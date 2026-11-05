"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, MapPin, PackageCheck, Truck } from "lucide-react";
import {
    useLazyGetIndiaPostPincodeQuery,
    useLazyGetIndiaPostBusinessParcelTariffQuery,
    type IndiaPostOffice,
} from "@/lib/redux/api/indiaPostApi";

// Company delivery policy: Pan India, EXCEPT Telangana.
// This product-page check is informational. Laravel must enforce the same rule at checkout.

type ProductData = Record<string, unknown> | null | undefined;
type ShippingSpec = {
    weightGrams: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
};
type Props = {
    product?: ProductData;
    variant?: ProductData;
};
type VerifiedLocation = {
    pin: string;
    locality: string;
    district: string;
    state: string;
    blocked: boolean;
};

function asObject(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;
}

function toText(value: unknown): string {
    return typeof value === "string" || typeof value === "number"
        ? String(value).trim()
        : "";
}

/** Handles Laravel -> Node -> DOP responses such as {success:true,data:{success:true,data:{data:[...]}}}. */
function readOffices(payload: unknown): IndiaPostOffice[] {
    let value: unknown = payload;
    for (let depth = 0; depth < 6; depth += 1) {
        if (Array.isArray(value)) {
            return value.filter((item) => asObject(item) !== null) as IndiaPostOffice[];
        }
        const obj = asObject(value);
        if (!obj) return [];
        const next = obj.data ?? obj.post_offices ?? obj.postOffices ?? obj.offices ?? obj.results ?? obj.records ?? obj.items;
        if (next == null || next === value) return [];
        value = next;
    }
    return [];
}

function isTelangana(state: string): boolean {
    const normalized = state.toLowerCase().replace(/[^a-z]/g, "");
    return normalized === "telangana" || normalized === "telengana" || normalized === "telingana";
}

function getVerifiedLocation(offices: IndiaPostOffice[], pin: string): VerifiedLocation | null {
    if (!offices.length) return null;
    const hasTelangana = offices.some((office) =>
        isTelangana(toText(office.state_name ?? office.state)),
    );
    // Prefer a Sub/Head Post Office over a branch office for a clean locality name.
    const primary = offices.find((office) =>
        String(office.office_type_code || "").toUpperCase() === "SPO" &&
        toText(office.state_name ?? office.state),
    ) ?? offices.find((office) => toText(office.state_name ?? office.state));

    if (!primary) return null; // Never claim delivery without a known state.
    const state = toText(primary.state_name ?? primary.state);
    const officeName = toText(primary.office_name ?? primary.name).replace(/\s+(BO|SO|HO)$/i, "");
    const locality = officeName || toText(primary.taluk_name) || toText(primary.city_name ?? primary.city);
    const district = toText(primary.city_name ?? primary.district_name ?? primary.district);
    return { pin, locality, district, state, blocked: hasTelangana || isTelangana(state) };
}

function getNumber(source: ProductData, keys: string[]): number | null {
    const obj = asObject(source);
    if (!obj) return null;
    for (const key of keys) {
        const raw = obj[key];
        if (raw === undefined || raw === null || raw === "") continue;
        const value = Number(raw);
        if (Number.isFinite(value) && value > 0) return value;
    }
    return null;
}

/** Never guess the unit of a generic weight or dimensions field. */
function readShippingSpec(product: ProductData, variant: ProductData): ShippingSpec | null {
    for (const source of [variant, product]) {
        const weightGrams = getNumber(source, ["shipping_weight_grams", "weight_grams"]);
        const lengthCm = getNumber(source, ["shipping_length_cm", "length_cm"]);
        const widthCm = getNumber(source, ["shipping_width_cm", "width_cm"]);
        const heightCm = getNumber(source, ["shipping_height_cm", "height_cm"]);
        if (
            weightGrams !== null && Number.isInteger(weightGrams) &&
            lengthCm !== null && widthCm !== null && heightCm !== null
        ) return { weightGrams, lengthCm, widthCm, heightCm };
    }
    return null;
}

function buildLocationLabel(location: VerifiedLocation): string {
    const entries = [location.locality, location.district, location.state];
    const distinct = entries.filter((entry, index) =>
        Boolean(entry) && entries.findIndex((candidate) => candidate.toLowerCase() === entry.toLowerCase()) === index,
    );
    return `${distinct.join(", ")} – ${location.pin}`;
}

export default function IndiaPostDeliveryChecker({ product, variant }: Props) {
    const [pincode, setPincode] = useState("");
    const [location, setLocation] = useState<VerifiedLocation | null>(null);
    const [error, setError] = useState("");
    const [quote, setQuote] = useState<number | null>(null);
    const [quoteNote, setQuoteNote] = useState("");
    const latestRequest = useRef(0);

    const [lookupPincode, { isFetching: isChecking }] = useLazyGetIndiaPostPincodeQuery();
    const [getTariff, { isFetching: isQuoting }] = useLazyGetIndiaPostBusinessParcelTariffQuery();
    const shippingSpec = useMemo(() => readShippingSpec(product, variant), [product, variant]);

    const productId = product?.id;
    const variantId = variant?.id;
    useEffect(() => {
        latestRequest.current += 1;
        setLocation(null);
        setQuote(null);
        setQuoteNote("");
        setError("");
    }, [productId, variantId]);

    const updatePincode = (value: string) => {
        latestRequest.current += 1;
        setPincode(value.replace(/\D/g, "").slice(0, 6));
        setLocation(null);
        setQuote(null);
        setQuoteNote("");
        setError("");
    };

    const handleCheck = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const requestId = ++latestRequest.current;
        const pin = pincode.trim();
        setLocation(null);
        setQuote(null);
        setQuoteNote("");
        setError("");

        if (!/^\d{6}$/.test(pin)) {
            setError("Please enter a valid 6-digit PIN code.");
            return;
        }

        try {
            const response = await lookupPincode(pin).unwrap();
            if (requestId !== latestRequest.current) return;
            if (response?.success !== true) {
                setError("Unable to verify this PIN code. Please try again.");
                return;
            }

            const offices = readOffices(response.data);
            const match = getVerifiedLocation(offices, pin);
            if (!match) {
                setError("We couldn't find this PIN code. Please check and try again.");
                return;
            }

            setLocation(match);
            if (match.blocked) return; // No tariff calls for the excluded state.
            if (!shippingSpec) return;

            try {
                const tariff = await getTariff({
                    destinationPincode: pin,
                    weightGrams: shippingSpec.weightGrams,
                    lengthCm: shippingSpec.lengthCm,
                    widthCm: shippingSpec.widthCm,
                    heightCm: shippingSpec.heightCm,
                }).unwrap();
                if (requestId !== latestRequest.current) return;
                const amount = Number(tariff?.data?.final_amount);
                if (tariff?.success && tariff?.data?.success !== false && Number.isFinite(amount) && amount >= 0) {
                    setQuote(amount);
                } else {
                    setQuoteNote("Shipping charges will be confirmed at checkout.");
                }
            } catch {
                if (requestId === latestRequest.current) {
                    setQuoteNote("Shipping charges will be confirmed at checkout.");
                }
            }
        } catch {
            if (requestId === latestRequest.current) {
                setError("Unable to check this PIN code right now. Please try again.");
            }
        }
    };

    return (
        <section
            className="mt-4 overflow-hidden rounded-[9px] border border-[#E5E7EB] bg-white"
            aria-label="Check delivery availability"
        >
            <div className="flex items-center gap-2.5 border-b border-[#F0F0F0] bg-[#FAFAFA] px-3.5 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDF7F0] text-[#188447]">
                    <Truck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#191919]">Check Delivery Availability</p>
                    <p className="text-[10px] text-[#767676]">Delivering across India, except Telangana</p>
                </div>
            </div>

            <div className="p-3.5">
                <form onSubmit={handleCheck} className="flex items-stretch gap-2">
                    <div className="relative min-w-0 flex-1">
                        <MapPin aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]" />
                        <input
                            aria-label="Delivery PIN code"
                            autoComplete="postal-code"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={pincode}
                            onChange={(event) => updatePincode(event.target.value)}
                            placeholder="Enter your 6-digit PIN code"
                            className="h-[42px] w-full rounded-md border border-[#D8DDE3] bg-white pl-9 pr-2 text-[12px] text-[#222] outline-none transition focus:border-[#188447] focus:ring-2 focus:ring-[#188447]/10"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isChecking || isQuoting}
                        className="inline-flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#171717] px-4 text-[11px] font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isChecking ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking</> : "Check"}
                    </button>
                </form>

                <div className="mt-2.5" aria-live="polite">
                    {error && (
                        <div role="alert" className="flex items-start gap-2 rounded-md border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2.5 text-[11px] leading-5 text-[#9A3412]">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                            <p>{error}</p>
                        </div>
                    )}

                    {location?.blocked && (
                        <div role="status" className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5">
                            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#B91C1C]">
                                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                Sorry, we don't deliver to Telangana yet.
                            </p>
                            <p className="mt-1.5 text-[10px] leading-5 text-[#7F1D1D]">
                                {buildLocationLabel(location)}
                            </p>
                            <p className="mt-1 text-[10px] text-[#7F1D1D]">
                                Please enter a PIN code from another state.
                            </p>
                        </div>
                    )}

                    {location && !location.blocked && (
                        <div role="status" className="rounded-md border border-[#D5EBDD] bg-[#F6FBF7] px-3 py-2.5">
                            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#166534]">
                                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                                Delivery available for this location
                            </p>
                            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-medium leading-5 text-[#334155]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B7280]" aria-hidden="true" />
                                {buildLocationLabel(location)}
                            </p>
                            <p className="mt-1.5 text-[10px] leading-4 text-[#64748B]">
                                Shipping charges and delivery timelines are confirmed at checkout.
                            </p>
                        </div>
                    )}

                    {location && !location.blocked && (isQuoting || quote !== null || quoteNote) && (
                        <div className="mt-2 flex items-start gap-2 rounded-md border border-[#EAEAEA] px-3 py-2.5">
                            <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#188447]" aria-hidden="true" />
                            <div>
                                {isQuoting ? (
                                    <p className="text-[11px] text-[#555]">Checking indicative shipping charges...</p>
                                ) : quote !== null ? (
                                    <>
                                        <p className="text-[11px] font-semibold text-[#222]">
                                            Estimated shipping: ₹{quote.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="mt-1 text-[10px] text-[#777]">Indicative only. Checkout confirms the final charge.</p>
                                    </>
                                ) : (
                                    <p className="text-[10px] text-[#777]">{quoteNote}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

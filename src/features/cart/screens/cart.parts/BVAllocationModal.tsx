"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import CheckoutProgress from "@/features/cart/screens/cart.parts/CheckoutProgress";
import { useUpdateCVAllocationMutation } from "@/lib/redux/api/checkoutApi";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";

export interface IgniteCVPreview {
  main_ba_id?: string;
  total_cv?: number | string;
  base_product_cv?: number | string;
  allocations?: Array<{
    target?: string;
    extra_tc?: number;
    cv?: number | string;
    reason?: string;
    placement_member_id?: number;
    placement_ba_id?: string;
    side?: number;
  }>;
  extra_tcs?: Array<{
    index?: number;
    placement_member_id?: number;
    placement_ba_id?: string;
    side?: number;
    cv?: number | string;
    allocated_cv?: number | string;
    cv_to_add?: number | string;
    current_bv?: number | string;
    current_bv_on_tc?: number | string;
    tc_number?: string | number;
    tc?: string | number;
    name?: string;
  }>;
  summary?: {
    total_cv?: number | string;
    base_product_cv?: number | string;
    nodes?: Record<
      string,
      {
        ba_id?: string;
        cv_allocated?: number | string;
        current_bv?: number | string;
        already_qualified?: boolean;
        needs_cv?: number | string;
      }
    >;
  };
}

export interface BVAllocationSelection {
  target: string;
  extra_tc: number | null;
  cv: string;
  reason: string;
  placement_member_id?: number;
  placement_ba_id?: string;
  side?: number;
}

interface AllocationRow {
  target: string;
  extraTc: number | null;
  label: string;
  baId: string;
  side?: number;
  currentBV: number;
  amount: string;
  placementMemberId?: number;
  reason: string;
}

interface BVAllocationModalProps {
  isOpen: boolean;
  preview?: IgniteCVPreview | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onContinue: (allocations: BVAllocationSelection[]) => void;
}

const MODAL_Z_INDEX = 2147483000;

const toNumber = (value: unknown): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const formatBV = (value: number): string =>
  value.toLocaleString("en-IN", { maximumFractionDigits: 4 });

const getTcLabel = (
  tc: NonNullable<IgniteCVPreview["extra_tcs"]>[number] | undefined,
  index: number,
): string => {
  const explicit = tc?.tc_number ?? tc?.tc ?? tc?.name;
  if (explicit !== undefined && explicit !== null && String(explicit).trim()) {
    const value = String(explicit).trim();
    return /^TC\s/i.test(value) ? value : `TC ${value}`;
  }

  const suffix = String(tc?.placement_ba_id ?? "").match(/-(\d+)$/)?.[1];
  return `TC ${suffix || String(index + 1).padStart(3, "0")}`;
};

function buildRows(preview?: IgniteCVPreview | null): AllocationRow[] {
  if (!preview) return [];

  const extraTcs = Array.isArray(preview.extra_tcs) ? preview.extra_tcs : [];
  const allocations = Array.isArray(preview.allocations)
    ? preview.allocations
    : [];
  const nodes = Object.values(preview.summary?.nodes ?? {});
  const targetIndexes = new Set<number>();

  extraTcs.forEach((tc, index) => {
    const itemIndex = Number.isInteger(Number(tc?.index))
      ? Number(tc.index)
      : index;
    targetIndexes.add(itemIndex);
  });

  allocations.forEach((allocation) => {
    const match = String(allocation?.target ?? "").match(/^extra_tc:(\d+)$/);
    if (match) targetIndexes.add(Number(match[1]));
  });

  const rows = Array.from(targetIndexes)
    .sort((a, b) => a - b)
    .map((targetIndex): AllocationRow => {
      const tc =
        extraTcs.find((item, index) => {
          const itemIndex = Number.isInteger(Number(item?.index))
            ? Number(item.index)
            : index;
          return itemIndex === targetIndex;
        }) ?? undefined;

      const target = `extra_tc:${targetIndex}`;
      const allocation = allocations.find(
        (item) => String(item?.target ?? "") === target,
      );
      const baId = String(
        tc?.placement_ba_id ?? allocation?.placement_ba_id ?? "—",
      );
      const matchingNode = nodes.find(
        (node) => baId !== "—" && String(node?.ba_id ?? "") === baId,
      );
      const currentBV = toNumber(
        tc?.current_bv_on_tc ??
          tc?.current_bv ??
          matchingNode?.current_bv ??
          matchingNode?.cv_allocated,
      );
      const initialAmount = toNumber(
        allocation?.cv ?? tc?.allocated_cv ?? tc?.cv_to_add ?? tc?.cv,
      );
      const memberId =
        tc?.placement_member_id ?? allocation?.placement_member_id;

      return {
        target,
        extraTc: targetIndex,
        label: getTcLabel(tc, targetIndex),
        baId,
        side: tc?.side ?? allocation?.side,
        currentBV,
        amount: String(initialAmount),
        placementMemberId:
          memberId !== undefined && Number.isFinite(Number(memberId))
            ? Number(memberId)
            : undefined,
        reason: String(allocation?.reason ?? "extra_tc"),
      };
    });

  // Preserve any additional allocation targets returned by the preview API.
  allocations.forEach((allocation, index) => {
    const target = String(allocation?.target ?? "").trim();
    if (!target || rows.some((row) => row.target === target)) return;

    rows.push({
      target,
      extraTc:
        allocation?.extra_tc !== undefined && allocation?.extra_tc !== null
          ? Number(allocation.extra_tc)
          : null,
      label: `TC ${String(index + 1).padStart(3, "0")}`,
      baId: String(allocation?.placement_ba_id ?? "—"),
      currentBV: 0,
      amount: String(toNumber(allocation?.cv)),
      placementMemberId:
        allocation?.placement_member_id !== undefined
          ? Number(allocation.placement_member_id)
          : undefined,
      reason: String(allocation?.reason ?? "manual"),
    });
  });

  return rows;
}

export default function BVAllocationModal({
  isOpen,
  preview,
  isSubmitting = false,
  onClose,
  onContinue,
}: BVAllocationModalProps) {
  const [rows, setRows] = useState<AllocationRow[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [updateCVAllocation, { isLoading: isUpdatingCV }] =
    useUpdateCVAllocationMutation();
  const busy = isSubmitting || isUpdatingCV;

  const totalCV = useMemo(
    () =>
      toNumber(
        preview?.total_cv ??
          preview?.summary?.total_cv ??
          preview?.base_product_cv ??
          preview?.summary?.base_product_cv,
      ),
    [preview],
  );

  useEffect(() => {
    if (isOpen) {
      setRows(buildRows(preview));
      setSubmitError(null);
    }
  }, [isOpen, preview]);

  // Lock background scrolling and allow Escape to close the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, busy, onClose]);

  const allocatedCV = useMemo(
    () => rows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    [rows],
  );
  const remainingCV = Math.max(0, totalCV - allocatedCV);
  const hasExceededLimit = allocatedCV > totalCV + 0.0001;
  const hasEligibleTargets = rows.length > 0;

  const getRowMaximum = (target: string): number => {
    const allocatedElsewhere = rows.reduce(
      (sum, row) =>
        sum + (row.target === target ? 0 : toNumber(row.amount)),
      0,
    );
    return Math.max(0, totalCV - allocatedElsewhere);
  };

  const updateAmount = (target: string, rawValue: string) => {
    setRows((current) => {
      const otherTotal = current.reduce(
        (sum, row) =>
          sum + (row.target === target ? 0 : toNumber(row.amount)),
        0,
      );
      const rowMaximum = Math.max(0, totalCV - otherTotal);

      return current.map((row) => {
        if (row.target !== target) return row;
        if (rawValue.trim() === "") return { ...row, amount: "" };

        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed)) return row;

        const safeValue = Math.max(0, Math.min(parsed, rowMaximum));
        return {
          ...row,
          amount: String(Math.round(safeValue * 10000) / 10000),
        };
      });
    });
  };

  const adjustAmount = (target: string, direction: "increase" | "decrease") => {
    const row = rows.find((item) => item.target === target);
    if (!row) return;

    const currentAmount = toNumber(row.amount);
    const nextAmount =
      direction === "increase"
        ? Math.min(getRowMaximum(target), currentAmount + 1)
        : Math.max(0, currentAmount - 1);

    updateAmount(target, String(nextAmount));
  };

  const handleContinue = async () => {
    if (busy || hasExceededLimit || !hasEligibleTargets) return;

    const result: BVAllocationSelection[] = rows.map((row) => ({
      target: row.target,
      extra_tc: row.extraTc,
      cv: toNumber(row.amount).toFixed(4),
      reason: row.reason,
      ...(row.placementMemberId !== undefined
        ? { placement_member_id: row.placementMemberId }
        : {}),
      ...(row.baId !== "—" ? { placement_ba_id: row.baId } : {}),
      ...(row.side !== undefined ? { side: row.side } : {}),
    }));

    const allocationsPayload = result.map((item) => ({
      target: item.target,
      cv: item.cv,
    }));

    const extraTcsPayload = result.map((item) => ({
      ...(item.placement_member_id !== undefined
        ? { placement_member_id: item.placement_member_id }
        : {}),
      ...(item.side !== undefined ? { side: item.side } : {}),
    }));

    try {
      setSubmitError(null);
      await updateCVAllocation({
        allocations: allocationsPayload,
        extra_tcs: extraTcsPayload,
      }).unwrap();
      onContinue(result);
    } catch (error: unknown) {
      const apiMessage = (error as any)?.data?.message;
      const message =
        apiMessage ||
        (error instanceof Error ? error.message : "") ||
        "Failed to update CV allocation. Please try again.";
      setSubmitError(message);
    }
  };

  // Skipping deliberately bypasses the CV update API and continues to checkout.
  // The parent receives an empty allocation list and handles navigation.
  const handleSkip = () => {
    if (busy) return;
    setSubmitError(null);
    onContinue([]);
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#101828]/70 p-3 backdrop-blur-sm sm:p-5"
      style={{ zIndex: MODAL_Z_INDEX, isolation: "isolate" }}
      role="presentation"
      onMouseDown={(event: ReactMouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="bv-allocation-title"
        className="flex max-h-[94dvh] w-full max-w-[1060px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]"
      >
        <div className="shrink-0 border-b border-[#E9EDF2] px-5 py-4 sm:px-7 sm:py-5">
          <div className="relative">
            {/* Keep the title on the left and the compact stepper in the top-right. */}
            <div className="min-w-0 pr-10 sm:pr-[300px]">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#EAF7EF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#16845B]">
                  Distributor checkout
                </span>
                <span className="text-[10px] font-medium text-[#8A94A3]">
                  Step 2 of 3
                </span>
              </div>
              <h2
                id="bv-allocation-title"
                className="text-[20px] font-semibold tracking-[-0.03em] text-[#17211B] sm:text-[23px]"
              >
                CV Allocation
              </h2>
              <p className="mt-1 max-w-[720px] text-[12px] leading-5 text-[#68756D]">
                Review and distribute the CV earned from this order across your
                eligible TCs. Use the plus/minus controls or enter an amount
                manually for each TC.
              </p>
            </div>

            {/* Desktop/tablet: compact progress tracker beside the close icon. */}
            <div className="absolute right-0 top-0 hidden items-start gap-2 sm:flex">
              <div className="w-[250px] pt-1">
                <CheckoutProgress currentStep={1} />
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close CV allocation"
                className="shrink-0 rounded-full p-2 text-[#7B8490] transition hover:bg-[#F2F4F7] hover:text-[#1D2939] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile: keep the close icon at the top and the narrow stepper right-aligned below the intro. */}
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Close CV allocation"
              className="absolute right-0 top-0 shrink-0 rounded-full p-2 text-[#7B8490] transition hover:bg-[#F2F4F7] hover:text-[#1D2939] disabled:cursor-not-allowed disabled:opacity-40 sm:hidden"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mt-4 flex justify-end sm:hidden">
              <div className="w-[250px] max-w-full">
                <CheckoutProgress currentStep={1} />
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="rounded-xl border border-[#DDEBE2] bg-[#F5FBF7] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#668070]">
                BV available to distribute
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[28px] font-bold tracking-[-0.04em] text-[#173E2B]">
                  {formatBV(totalCV)}
                </span>
                <span className="text-[11px] font-medium text-[#668070]">
                  CV
                </span>
              </div>
              {preview?.main_ba_id && (
                <p className="mt-1 text-[10px] text-[#748278]">
                  Main BA ID: {preview.main_ba_id}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[270px]">
              <div className="rounded-xl border border-[#E7EAF0] bg-white p-3">
                <p className="text-[10px] text-[#89919D]">Allocated</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#202B23]">
                  {formatBV(allocatedCV)}
                </p>
              </div>
              <div className="rounded-xl border border-[#E7EAF0] bg-white p-3">
                <p className="text-[10px] text-[#89919D]">Remaining</p>
                <p className="mt-1 text-[18px] font-semibold tabular-nums text-[#16845B]">
                  {formatBV(remainingCV)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-[#E4E7EC]">
            <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(100px,0.8fr)_minmax(210px,1.2fr)] items-center gap-3 bg-[#F5F6F7] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-[#667085] sm:grid sm:px-5">
              <span>TC details</span>
              <span className="text-right">Current BV on TC</span>
              <span className="text-center">New BV to add</span>
            </div>

            {rows.length > 0 ? (
              <div className="divide-y divide-[#EAECF0]">
                {rows.map((row) => {
                  const rowMaximum = getRowMaximum(row.target);
                  const amount = toNumber(row.amount);

                  return (
                    <div
                      key={row.target}
                      className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(100px,0.8fr)_minmax(210px,1.2fr)] sm:items-center sm:gap-3 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#202B23]">
                          {row.label}
                        </p>
                        <p className="mt-0.5 break-all text-[10px] text-[#89919D]">
                          {row.baId}
                          {row.side === 1
                            ? " · Left"
                            : row.side === 2
                              ? " · Right"
                              : ""}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:block sm:text-right">
                        <span className="text-[10px] text-[#89919D] sm:hidden">
                          Current BV on TC
                        </span>
                        <span className="text-[13px] font-medium tabular-nums text-[#475467]">
                          {formatBV(row.currentBV)}
                        </span>
                      </div>

                      <div>
                        <p className="mb-1 text-[10px] text-[#89919D] sm:hidden">
                          New BV to add
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustAmount(row.target, "decrease")}
                            disabled={busy || amount <= 0}
                            aria-label={`Decrease ${row.label} allocation`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white text-[#475467] transition hover:border-[#16845B] hover:bg-[#F0F8F3] hover:text-[#16845B] disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max={rowMaximum}
                            step="0.0001"
                            value={row.amount}
                            disabled={busy}
                            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                              updateAmount(row.target, event.target.value)
                            }
                            aria-label={`BV to add for ${row.label}`}
                            className="h-10 min-w-0 flex-1 rounded-lg border border-[#D0D5DD] bg-white px-3 text-center text-[13px] font-semibold tabular-nums text-[#202B23] outline-none transition focus:border-[#16845B] focus:ring-2 focus:ring-[#16845B]/10 disabled:bg-[#F2F4F7]"
                          />
                          <button
                            type="button"
                            onClick={() => adjustAmount(row.target, "increase")}
                            disabled={
                              busy ||
                              amount >= rowMaximum ||
                              remainingCV <= 0
                            }
                            aria-label={`Increase ${row.label} allocation`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#16845B] bg-[#16845B] text-white transition hover:bg-[#106B49] disabled:cursor-not-allowed disabled:border-[#D0D5DD] disabled:bg-[#F2F4F7] disabled:text-[#98A2B3]"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1 text-right text-[9px] text-[#98A2B3]">
                          Maximum for this TC: {formatBV(rowMaximum)} CV
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#B54708]" />
                <div>
                  <p className="text-[12px] font-semibold leading-5 text-[#344054]">
                    Your account is not yet placed in the Ignite network.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#E5EAF0] bg-[#F8FAFC] p-3.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#667085]" />
            <p className="text-[10.5px] leading-5 text-[#667085]">
              You can split the available CV between multiple TCs. The combined
              amount across all rows is restricted to the available CV and
              cannot exceed it. Review the allocation carefully before
              continuing to checkout.
            </p>
          </div>

          {hasExceededLimit && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#FFF2F0] p-3 text-[11px] text-[#B42318]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Total allocation cannot be greater than {formatBV(totalCV)} CV.
            </div>
          )}

          {submitError && (
            <div role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFF2F0] p-3 text-[11px] text-[#B42318]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#E9EDF2] bg-[#FCFCFD] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="h-11 rounded-lg border border-[#D0D5DD] bg-white px-5 text-[12px] font-semibold text-[#475467] transition hover:bg-[#F9FAFB] disabled:opacity-50"
          >
            Back to cart
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={busy}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D0D5DD] bg-white px-4 text-[12px] font-semibold text-[#475467] transition hover:border-[#16845B] hover:bg-[#F5FBF7] hover:text-[#16845B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Skip &amp; Continue to Payment
            </button>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.1em] text-[#98A2B3]">
                Total allocation
              </p>
              <p className="text-[13px] font-bold tabular-nums text-[#202B23]">
                {formatBV(allocatedCV)} / {formatBV(totalCV)} CV
              </p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={busy || hasExceededLimit || !hasEligibleTargets}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#173E2B] px-5 text-[12px] font-semibold text-white transition hover:bg-[#20543A] disabled:cursor-not-allowed disabled:bg-[#AAB8AF]"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUpdatingCV ? "Updating CV..." : "Continuing..."}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Continue to checkout
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

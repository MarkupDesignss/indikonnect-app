"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TbFilterSearch } from "react-icons/tb";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Gender = "WOMEN" | "MEN" | null;

type Occasion = "GIFTING" | "FOR MYSELF" | null;

type PriceRange =
  | "UNDER_10000"
  | "5000_150000"
  | "150000_MAX"
  | null;

type PriceOption = {
  value: Exclude<PriceRange, null>;
  title: string;
  description: string;
  min_price: number;
  max_price: number | null;
};

/* =========================================================
   GENDER -> SUBCATEGORY ID MAPPING
   (from API data)
   - WOMEN -> 2 ("For Her")
   - MEN   -> 3 ("For Him")
========================================================= */
const GENDER_SUBCATEGORY_MAP: Record<
  Exclude<Gender, null>,
  string
> = {
  WOMEN: "2",
  MEN: "3",
};

const priceOptions: PriceOption[] = [
  {
    value: "UNDER_10000",
    title: "UNDER ₹10,000",
    description: "",
    min_price: 0,
    max_price: 10000,
  },
  {
    value: "5000_150000",
    title: "₹5,000 - ₹1,50,000",
    description: "",
    min_price: 5000,
    max_price: 150000,
  },
  {
    value: "150000_MAX",
    title: "₹1,50,000 - MAX",
    description: "",
    min_price: 150000,
    max_price: null,
  },
];

/* =========================================================
   STEP 1 ICON
========================================================= */
function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 300 180"
      className="h-[105px] w-[180px] sm:h-[130px] sm:w-[225px] md:h-[145px] md:w-[250px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="112" y="48" width="165" height="43" rx="21.5" fill="#FFF8EA" />
      <rect x="48" y="103" width="170" height="42" rx="21" fill="#FFF8EA" />

      <path
        d="M113 35C101 28 96 26 88 26C78 27 68 34 64 43C61 50 62 56 67 63C70 67 72 71 71 77C69 85 65 94 63 104C62 110 66 116 73 118C80 120 88 117 92 111C96 104 99 97 103 89C105 84 107 79 112 76C118 72 123 69 126 62C130 54 127 45 122 40C119 37 116 36 113 35"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M67 65C70 67 72 68 76 69M67 74C71 76 75 76 78 75"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M93 111C97 119 101 126 103 136M73 115C73 123 70 129 66 135"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M74 46C82 53 91 55 99 54C107 53 112 48 116 43M81 36C90 43 100 45 110 41"
        stroke="#F7A000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M167 35C183 28 199 31 211 42C221 51 225 65 223 79C221 92 213 105 204 110C198 114 189 115 181 113C172 111 163 106 157 98C150 89 147 78 148 66C149 52 157 40 167 35"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M217 65C226 61 229 66 228 73C227 79 223 83 218 83"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M187 69C184 74 181 80 183 83C185 85 189 85 192 84"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M181 91C187 94 193 93 197 90"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M196 108C197 117 202 125 209 130M174 109C172 117 168 123 163 128"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M153 57C155 42 167 32 181 29C198 25 214 34 221 46M158 48C168 42 179 41 188 44C198 47 208 45 215 39"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   STEP 2 ICON
========================================================= */
function GiftIcon() {
  return (
    <svg
      viewBox="0 0 300 170"
      className="h-[95px] w-[177px] sm:h-[118px] sm:w-[220px] md:h-[132px] md:w-[245px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="82" y="43" width="180" height="43" rx="21.5" fill="#FFF8EA" />
      <path d="M65 139H267" stroke="#F7A000" strokeWidth="1.6" strokeLinecap="round" />

      <rect x="99" y="92" width="72" height="47" rx="2" stroke="#F7A000" strokeWidth="1.6" />
      <rect x="94" y="85" width="82" height="11" rx="2" stroke="#F7A000" strokeWidth="1.6" />
      <path d="M135 85V139" stroke="#F7A000" strokeWidth="1.6" />
      <path
        d="M135 85C127 70 112 72 112 64C112 57 119 54 126 56C134 58 136 70 135 85"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M137 85C142 69 155 64 160 67C166 71 159 78 151 82C146 85 142 86 137 85"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <rect x="153" y="51" width="90" height="88" rx="3" stroke="#F7A000" strokeWidth="1.6" />
      <rect x="147" y="44" width="102" height="11" rx="2" stroke="#F7A000" strokeWidth="1.6" />
      <path d="M199 44V139" stroke="#F7A000" strokeWidth="1.6" />
      <path
        d="M198 44C194 29 180 23 172 28C163 34 174 43 185 45C190 46 195 46 198 44"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M201 44C204 31 218 24 226 28C235 33 229 42 218 45C211 47 205 47 201 44"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   STEP 3 ICON
========================================================= */
function WatchIcon() {
  return (
    <svg
      viewBox="0 0 300 190"
      className="h-[110px] w-[177px] sm:h-[135px] sm:w-[220px] md:h-[153px] md:w-[245px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="111" y="48" width="159" height="43" rx="21.5" fill="#FFF8EA" />
      <rect x="53" y="105" width="163" height="42" rx="21" fill="#FFF8EA" />

      <path
        d="M125 48C130 31 139 22 153 18L177 18C191 20 201 27 205 43L210 66"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M102 65C107 59 114 57 122 59L161 66C168 67 173 73 172 80L165 114C164 122 157 127 149 126L111 120C103 119 98 112 99 104L102 65Z"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M112 69C115 65 119 64 125 65L153 70C158 71 161 75 160 80L154 106C153 111 149 113 144 112L118 108C113 107 110 103 111 98L112 69Z"
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M169 77L178 79L180 88L170 86"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M108 119L105 144C105 151 109 157 116 159L143 165C149 166 155 162 157 156L165 126"
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M119 121L116 146C116 150 118 152 122 153L140 157C144 158 147 155 148 151L155 125"
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M144 19C150 29 157 34 166 35C178 37 190 32 198 24"
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M130 25C138 30 143 31 150 30"
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function StyleFinder() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [gender, setGender] = useState<Gender>(null);
  const [occasion, setOccasion] = useState<Occasion>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>(null);

  /* =========================================================
     BODY SCROLL LOCK
  ========================================================= */
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* =========================================================
     ESCAPE KEY
  ========================================================= */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /* =========================================================
     OPEN
  ========================================================= */
  const openModal = () => {
    setStep(1);
    setGender(null);
    setOccasion(null);
    setSelectedPrice(null);
    setIsOpen(true);
  };

  /* =========================================================
     CLOSE
  ========================================================= */
  const closeModal = () => {
    setIsOpen(false);
  };

  /* =========================================================
     APPLY FILTERS TO URL
     -> Only subcategory_ids + min_price + max_price
  ========================================================= */
  const applyFiltersToUrl = (
    finalGender: Exclude<Gender, null>,
    priceOption: PriceOption,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // subcategory_ids (from gender mapping)
    const subcategoryId = GENDER_SUBCATEGORY_MAP[finalGender];
    params.set("subcategory_ids", subcategoryId);

    // min_price
    if (priceOption.min_price > 0) {
      params.set("min_price", String(priceOption.min_price));
    } else {
      params.delete("min_price");
    }

    // max_price
    if (priceOption.max_price !== null) {
      params.set("max_price", String(priceOption.max_price));
    } else {
      params.delete("max_price");
    }

    // reset pagination
    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  /* =========================================================
     STEP 1
  ========================================================= */
  const handleGender = (value: Exclude<Gender, null>) => {
    setGender(value);

    window.setTimeout(() => {
      setStep(2);
    }, 180);
  };

  /* =========================================================
     STEP 2
  ========================================================= */
  const handleOccasion = (value: Exclude<Occasion, null>) => {
    setOccasion(value);

    window.setTimeout(() => {
      setStep(3);
    }, 180);
  };

  /* =========================================================
     STEP 3 — FINAL APPLY
  ========================================================= */
  const handlePrice = (value: Exclude<PriceRange, null>) => {
    setSelectedPrice(value);

    const priceOption = priceOptions.find((option) => option.value === value);

    if (!priceOption || !gender) {
      console.warn("Missing selection before applying filters", {
        gender,
        occasion,
        value,
      });
      return;
    }

    // NOTE: occasion is intentionally NOT sent to URL right now.
    applyFiltersToUrl(gender, priceOption);

    window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  return (
    <>
    {!isOpen && (
  <button
    type="button"
    onClick={openModal}
    aria-label="Open Style Finder"
    title="Style Finder"
    className="
      fixed
      -right-0
      bottom-[120px]
      z-[80]
      flex
      h-[50px]
      w-[50px]
      items-center
      justify-center
      rounded-full
      bg-[#181818]
      text-white
    "
  >
    <div className="relative flex h-[24px] w-[24px] items-center justify-center sm:h-[30px] sm:w-[30px] md:h-[34px] md:w-[34px]">
      <TbFilterSearch
        className="
          h-[19px]
          w-[19px]
          text-white
          sm:h-[23px]
          sm:w-[23px]
          md:h-[26px]
          md:w-[26px]
        "
        strokeWidth={2}
      />
    </div>
  </button>
)}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-3 sm:px-0">
          <button
            type="button"
            aria-label="Close Style Finder"
            onClick={closeModal}
            className="
              absolute
              inset-0
              cursor-default
              border-0
              bg-black/50
              p-0
            "
          />

          <div
            className="
              relative
              z-10
              flex
              max-h-[80vh]
              w-full
              max-w-[360px]
              flex-col
              overflow-hidden
              rounded-[14px]
              bg-white
              shadow-[0_10px_40px_rgba(0,0,0,0.18)]
              sm:max-h-[82vh]
              sm:max-w-[400px]
              sm:rounded-[10px]
              md:max-w-[420px]
            "
          >
            {/* HEADER */}
            <div
              className="
                flex
                h-[54px]
                shrink-0
                items-center
                justify-between
                border-b
                border-[#ececec]
                px-[18px]
                sm:h-[62px]
                sm:px-[22px]
                md:px-[24px]
              "
            >
              <div className="flex items-center gap-[6px]">
                <h2
                  className="
                    m-0
                    font-sans
                    text-[16px]
                    font-medium
                    leading-none
                    text-[#111111]
                    sm:text-[18px]
                    md:text-[19px]
                  "
                >
                  Style Finder
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="
                  flex
                  h-[28px]
                  w-[28px]
                  items-center
                  justify-center
                  rounded-full
                  border-0
                  bg-transparent
                  p-0
                  text-[#464646]
                  transition
                  hover:bg-[#f4f4f4]
                  sm:h-[30px]
                  sm:w-[30px]
                "
              >
                <X size={20} strokeWidth={2} className="sm:h-[22px] sm:w-[22px]" />
              </button>
            </div>

            {/* CONTENT */}
            <div
              className="
                overflow-y-auto
                px-[18px]
                pb-[22px]
                pt-[18px]
                sm:px-[24px]
                sm:pb-[28px]
                sm:pt-[22px]
                md:px-[26px]
                [-webkit-overflow-scrolling:touch]
              "
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="animate-[fadeIn_.25s_ease]">
                  <div className="mb-[10px] flex justify-center sm:mb-[14px]">
                    <PeopleIcon />
                  </div>

                  <h3
                    className="
                      mb-[16px]
                      text-center
                      font-sans
                      text-[16px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:mb-[18px]
                      sm:text-[18px]
                      md:text-[19px]
                    "
                  >
                    Who Are You Shopping For?
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleGender("WOMEN")}
                    className={`
                      mb-[12px]
                      flex
                      h-[48px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[15px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      sm:mb-[16px]
                      sm:h-[56px]
                      sm:text-[17px]
                      ${
                        gender === "WOMEN"
                          ? "bg-[#eeeeef]"
                          : "bg-white hover:bg-[#f8f8f8]"
                      }
                    `}
                  >
                    WOMEN
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGender("MEN")}
                    className={`
                      flex
                      h-[48px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[15px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      sm:h-[56px]
                      sm:text-[17px]
                      ${
                        gender === "MEN"
                          ? "bg-[#eeeeef]"
                          : "bg-white hover:bg-[#f8f8f8]"
                      }
                    `}
                  >
                    MEN
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="animate-[fadeIn_.25s_ease]">
                  <div className="mb-[10px] flex justify-center sm:mb-[13px]">
                    <GiftIcon />
                  </div>

                  <h3
                    className="
                      mb-[16px]
                      text-center
                      font-sans
                      text-[16px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:mb-[19px]
                      sm:text-[18px]
                      md:text-[19px]
                    "
                  >
                    What's The Occasion?
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleOccasion("GIFTING")}
                    className={`
                      mb-[12px]
                      flex
                      h-[48px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[14px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      sm:mb-[15px]
                      sm:h-[56px]
                      sm:text-[16px]
                      ${
                        occasion === "GIFTING"
                          ? "bg-[#e9e9eb]"
                          : "bg-white hover:bg-[#f6f6f6]"
                      }
                    `}
                  >
                    GIFTING
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOccasion("FOR MYSELF")}
                    className={`
                      flex
                      h-[48px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[14px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      sm:h-[56px]
                      sm:text-[16px]
                      ${
                        occasion === "FOR MYSELF"
                          ? "bg-[#e9e9eb]"
                          : "bg-white hover:bg-[#f6f6f6]"
                      }
                    `}
                  >
                    FOR MYSELF
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="animate-[fadeIn_.25s_ease]">
                  <div className="mb-[8px] flex justify-center sm:mb-[10px]">
                    <WatchIcon />
                  </div>

                  <h3
                    className="
                      mb-[16px]
                      text-center
                      font-sans
                      text-[16px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:mb-[18px]
                      sm:text-[18px]
                      md:text-[19px]
                    "
                  >
                    What's Your Price Range?
                  </h3>

                  <div className="flex flex-col gap-[12px] sm:gap-[15px]">
                    {priceOptions.map((option) => {
                      const isSelected = selectedPrice === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handlePrice(option.value)}
                          className={`
                            flex
                            h-[48px]
                            w-full
                            items-center
                            justify-center
                            rounded-[10px]
                            border
                            border-[#171717]
                            px-3
                            font-sans
                            text-[14px]
                            font-normal
                            text-[#111111]
                            transition-all
                            duration-200
                            active:scale-[0.995]
                            sm:h-[56px]
                            sm:px-4
                            sm:text-[16px]
                            ${
                              isSelected
                                ? "bg-[#e9e9eb]"
                                : "bg-white hover:bg-[#f7f7f7]"
                            }
                          `}
                        >
                          {option.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
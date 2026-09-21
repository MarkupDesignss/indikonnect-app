"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
};

const priceOptions: PriceOption[] = [
  {
    value: "UNDER_10000",
    title: "UNDER ₹10,000",
    description: "",
  },
  {
    value: "5000_150000",
    title: "₹5,000 - ₹1,50,000",
    description: "",
  },
  {
    value: "150000_MAX",
    title: "₹1,50,000 - MAX",
    description: "",
  },
];

/* =========================================================
   STEP 1 ICON
========================================================= */
function PeopleIcon() {
  return (
    <svg
      viewBox="0 0 300 180"
      className="h-[145px] w-[250px] sm:h-[158px] sm:w-[275px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background decorative pills */}
      <rect
        x="112"
        y="48"
        width="165"
        height="43"
        rx="21.5"
        fill="#FFF8EA"
      />

      <rect
        x="48"
        y="103"
        width="170"
        height="42"
        rx="21"
        fill="#FFF8EA"
      />

      {/* Female face */}
      <path
        d="
          M113 35
          C101 28 96 26 88 26
          C78 27 68 34 64 43
          C61 50 62 56 67 63
          C70 67 72 71 71 77
          C69 85 65 94 63 104
          C62 110 66 116 73 118
          C80 120 88 117 92 111
          C96 104 99 97 103 89
          C105 84 107 79 112 76
          C118 72 123 69 126 62
          C130 54 127 45 122 40
          C119 37 116 36 113 35
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="
          M67 65
          C70 67 72 68 76 69
          M67 74
          C71 76 75 76 78 75
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M93 111
          C97 119 101 126 103 136
          M73 115
          C73 123 70 129 66 135
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M74 46
          C82 53 91 55 99 54
          C107 53 112 48 116 43
          M81 36
          C90 43 100 45 110 41
        "
        stroke="#F7A000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Male face */}
      <path
        d="
          M167 35
          C183 28 199 31 211 42
          C221 51 225 65 223 79
          C221 92 213 105 204 110
          C198 114 189 115 181 113
          C172 111 163 106 157 98
          C150 89 147 78 148 66
          C149 52 157 40 167 35
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="
          M217 65
          C226 61 229 66 228 73
          C227 79 223 83 218 83
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M187 69
          C184 74 181 80 183 83
          C185 85 189 85 192 84
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M181 91
          C187 94 193 93 197 90
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M196 108
          C197 117 202 125 209 130
          M174 109
          C172 117 168 123 163 128
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M153 57
          C155 42 167 32 181 29
          C198 25 214 34 221 46
          M158 48
          C168 42 179 41 188 44
          C198 47 208 45 215 39
        "
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
      className="h-[132px] w-[245px] sm:h-[142px] sm:w-[265px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="82"
        y="43"
        width="180"
        height="43"
        rx="21.5"
        fill="#FFF8EA"
      />

      <path
        d="M65 139H267"
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Small gift */}
      <rect
        x="99"
        y="92"
        width="72"
        height="47"
        rx="2"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <rect
        x="94"
        y="85"
        width="82"
        height="11"
        rx="2"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <path
        d="M135 85V139"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <path
        d="
          M135 85
          C127 70 112 72 112 64
          C112 57 119 54 126 56
          C134 58 136 70 135 85
        "
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="
          M137 85
          C142 69 155 64 160 67
          C166 71 159 78 151 82
          C146 85 142 86 137 85
        "
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Big gift */}
      <rect
        x="153"
        y="51"
        width="90"
        height="88"
        rx="3"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <rect
        x="147"
        y="44"
        width="102"
        height="11"
        rx="2"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <path
        d="M199 44V139"
        stroke="#F7A000"
        strokeWidth="1.6"
      />

      <path
        d="
          M198 44
          C194 29 180 23 172 28
          C163 34 174 43 185 45
          C190 46 195 46 198 44
        "
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="
          M201 44
          C204 31 218 24 226 28
          C235 33 229 42 218 45
          C211 47 205 47 201 44
        "
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
      className="h-[153px] w-[245px] sm:h-[164px] sm:w-[265px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="111"
        y="48"
        width="159"
        height="43"
        rx="21.5"
        fill="#FFF8EA"
      />

      <rect
        x="53"
        y="105"
        width="163"
        height="42"
        rx="21"
        fill="#FFF8EA"
      />

      {/* Top strap */}
      <path
        d="
          M125 48
          C130 31 139 22 153 18
          L177 18
          C191 20 201 27 205 43
          L210 66
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Watch body */}
      <path
        d="
          M102 65
          C107 59 114 57 122 59
          L161 66
          C168 67 173 73 172 80
          L165 114
          C164 122 157 127 149 126
          L111 120
          C103 119 98 112 99 104
          L102 65Z
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* Screen */}
      <path
        d="
          M112 69
          C115 65 119 64 125 65
          L153 70
          C158 71 161 75 160 80
          L154 106
          C153 111 149 113 144 112
          L118 108
          C113 107 110 103 111 98
          L112 69Z
        "
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Crown */}
      <path
        d="
          M169 77
          L178 79
          L180 88
          L170 86
        "
        stroke="#F7A000"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Lower strap */}
      <path
        d="
          M108 119
          L105 144
          C105 151 109 157 116 159
          L143 165
          C149 166 155 162 157 156
          L165 126
        "
        stroke="#F7A000"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="
          M119 121
          L116 146
          C116 150 118 152 122 153
          L140 157
          C144 158 147 155 148 151
          L155 125
        "
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="
          M144 19
          C150 29 157 34 166 35
          C178 37 190 32 198 24
        "
        stroke="#F7A000"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="
          M130 25
          C138 30 143 31 150 30
        "
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
  const [isOpen, setIsOpen] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [gender, setGender] = useState<Gender>(null);

  const [occasion, setOccasion] = useState<Occasion>(null);

  const [selectedPrice, setSelectedPrice] =
    useState<PriceRange>(null);

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
     STEP 1
  ========================================================= */
  const handleGender = (
    value: Exclude<Gender, null>
  ) => {
    setGender(value);

    setTimeout(() => {
      setStep(2);
    }, 180);
  };

  /* =========================================================
     STEP 2
  ========================================================= */
  const handleOccasion = (
    value: Exclude<Occasion, null>
  ) => {
    setOccasion(value);

    setTimeout(() => {
      setStep(3);
    }, 180);
  };

  /* =========================================================
     STEP 3
  ========================================================= */
  const handlePrice = (
    value: Exclude<PriceRange, null>
  ) => {
    setSelectedPrice(value);

    /*
      Yahan tum apni API / filter / navigation laga sakte ho.

      Example:
      console.log({
        gender,
        occasion,
        priceRange: value,
      });
    */

    console.log({
      gender,
      occasion,
      priceRange: value,
    });
  };

  return (
    <>
      {/* =====================================================
          OPEN BUTTON
      ====================================================== */}
      <button
        type="button"
        onClick={openModal}
        className="
          rounded-md
          border
          border-[#222222]
          bg-white
          px-5
          py-2.5
          text-sm
          font-medium
          text-[#171717]
          transition
          duration-200
          hover:bg-[#171717]
          hover:text-white
        "
      >
        Style Finder
      </button>

      {/* =====================================================
          MODAL
      ====================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          {/* Overlay */}
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

          {/* Modal */}
          <div
            className="
              relative
              z-10
              flex
              w-[calc(100%-28px)]
              max-w-[512px]
              flex-col
              overflow-hidden
              bg-white
              shadow-[0_10px_40px_rgba(0,0,0,0.18)]
              sm:w-[512px]
            "
          >
            {/* =================================================
                HEADER
            ================================================== */}
            <div
              className="
                flex
                h-[70px]
                shrink-0
                items-center
                justify-between
                border-b
                border-[#ececec]
                px-[25px]
                sm:px-[26px]
              "
            >
              <div className="flex items-center gap-[6px]">
                <h2
                  className="
                    m-0
                    font-sans
                    text-[20px]
                    font-medium
                    leading-none
                    text-[#111111]
                    sm:text-[21px]
                  "
                >
                  Style Finder
                </h2>

                <span
                  className="
                    font-sans
                    text-[16px]
                    font-normal
                    text-[#55708C]
                    sm:text-[17px]
                  "
                >
                  (Step {step}/3)
                </span>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="
                  flex
                  h-[32px]
                  w-[32px]
                  items-center
                  justify-center
                  rounded-full
                  border-0
                  bg-transparent
                  p-0
                  text-[#464646]
                  transition
                  hover:bg-[#f4f4f4]
                "
              >
                <X
                  size={25}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* =================================================
                CONTENT
            ================================================== */}
            <div
              className="
                px-[28px]
                pb-[40px]
                pt-[28px]
                sm:px-[32px]
              "
            >
              {/* =================================================
                  STEP 1
              ================================================== */}
              {step === 1 && (
                <div
                  key="step-1"
                  className="
                    animate-[fadeIn_.25s_ease]
                  "
                >
                  {/* Icon */}
                  <div className="mb-[16px] flex justify-center">
                    <PeopleIcon />
                  </div>

                  {/* Question */}
                  <h3
                    className="
                      mb-[22px]
                      text-center
                      font-sans
                      text-[21px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:text-[22px]
                    "
                  >
                    Who Are You Shopping For?
                  </h3>

                  {/* WOMEN */}
                  <button
                    type="button"
                    onClick={() =>
                      handleGender("WOMEN")
                    }
                    className={`
                      mb-[20px]
                      flex
                      h-[70px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[20px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      ${
                        gender === "WOMEN"
                          ? "bg-[#eeeeef]"
                          : "bg-white hover:bg-[#f8f8f8]"
                      }
                    `}
                  >
                    WOMEN
                  </button>

                  {/* MEN */}
                  <button
                    type="button"
                    onClick={() =>
                      handleGender("MEN")
                    }
                    className={`
                      flex
                      h-[70px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[20px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
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

              {/* =================================================
                  STEP 2
              ================================================== */}
              {step === 2 && (
                <div
                  key="step-2"
                  className="
                    animate-[fadeIn_.25s_ease]
                  "
                >
                  {/* Icon */}
                  <div className="mb-[15px] flex justify-center">
                    <GiftIcon />
                  </div>

                  {/* Question */}
                  <h3
                    className="
                      mb-[23px]
                      text-center
                      font-sans
                      text-[21px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:text-[22px]
                    "
                  >
                    What’s The Occasion?
                  </h3>

                  {/* GIFTING */}
                  <button
                    type="button"
                    onClick={() =>
                      handleOccasion("GIFTING")
                    }
                    className={`
                      mb-[19px]
                      flex
                      h-[71px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[19px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
                      ${
                        occasion === "GIFTING"
                          ? "bg-[#e9e9eb]"
                          : "bg-white hover:bg-[#f6f6f6]"
                      }
                    `}
                  >
                    GIFTING
                  </button>

                  {/* FOR MYSELF */}
                  <button
                    type="button"
                    onClick={() =>
                      handleOccasion("FOR MYSELF")
                    }
                    className={`
                      flex
                      h-[71px]
                      w-full
                      items-center
                      justify-center
                      rounded-[10px]
                      border
                      border-[#171717]
                      font-sans
                      text-[19px]
                      font-normal
                      text-[#111111]
                      transition-all
                      duration-200
                      active:scale-[0.995]
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

              {/* =================================================
                  STEP 3 - PRICE
              ================================================== */}
              {step === 3 && (
                <div
                  key="step-3"
                  className="
                    animate-[fadeIn_.25s_ease]
                  "
                >
                  {/* Watch Icon */}
                  <div className="mb-[10px] flex justify-center">
                    <WatchIcon />
                  </div>

                  {/* Question */}
                  <h3
                    className="
                      mb-[22px]
                      text-center
                      font-sans
                      text-[21px]
                      font-medium
                      leading-[1.25]
                      text-[#111111]
                      sm:text-[22px]
                    "
                  >
                    What’s Your Price Range?
                  </h3>

                  {/* Price options */}
                  <div className="flex flex-col gap-[19px]">
                    {priceOptions.map((option) => {
                      const isSelected =
                        selectedPrice === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handlePrice(option.value)
                          }
                          className={`
                            flex
                            h-[71px]
                            w-full
                            items-center
                            justify-center
                            rounded-[10px]
                            border
                            border-[#171717]
                            px-4
                            font-sans
                            text-[19px]
                            font-normal
                            text-[#111111]
                            transition-all
                            duration-200
                            active:scale-[0.995]
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

      {/* =====================================================
          GLOBAL ANIMATION
      ====================================================== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
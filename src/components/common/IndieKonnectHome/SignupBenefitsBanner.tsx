"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Gift, CreditCard, Zap } from "lucide-react";
import Banner from "../../../../public/indiekonnect-web/images/made_in_india_homepage_m.webp";

export default function SignupBenefitsBanner() {
  const router = useRouter();

  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = () => {
      const customerToken = localStorage.getItem("auth_token");
      const distributorToken = localStorage.getItem("distributor_token");

      setHasToken(
        Boolean(
          customerToken?.trim() ||
            distributorToken?.trim()
        )
      );
    };

    checkToken();

    // Same tab auth changes ke liye
    const handleAuthChange = () => {
      checkToken();
    };

    // Other tab auth changes ke liye
    const handleStorageChange = () => {
      checkToken();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSignUp = () => {
    router.push("/auth/customer/login");
  };

  return (
    <section className="w-full bg-white py-5">
      <div className="mx-auto w-full max-w-7xl">

        {/* =========================================================
            SIGNUP & BENEFITS SECTION
            TOKEN HONE PAR SIRF YE PART HIDE HOGA
        ========================================================= */}
        {hasToken === false && (
          <div
            className="
              flex
              min-h-[175px]
              w-full
              flex-col
              rounded-[16px]
              bg-[#FFFAF0]
              px-[16px]
              py-[16px]

              sm:px-[20px]
              sm:py-[20px]

              lg:min-h-[175px]
              lg:px-[28px]
              lg:py-[24px]
            "
          >
            {/* Heading */}
            <div
              className="
                mb-[12px]

                sm:mb-[18px]

                lg:mb-[28px]
              "
            >
              <h2
                className="
                  m-0
                  font-sans
                  text-[15px]
                  font-semibold
                  leading-[1.2]
                  text-[#111111]

                  sm:text-[17px]

                  lg:text-[18px]
                "
              >
                Signup & Unlock{" "}
                <span className="text-[#C58A20]">
                  Exclusive Benefits
                </span>
              </h2>
            </div>

            {/* =======================================================
                BENEFITS + SIGNUP
            ======================================================= */}
            <div
              className="
                flex
                w-full
                flex-col
                gap-[14px]

                lg:flex-row
                lg:items-center
                lg:justify-between
                lg:gap-[25px]
              "
            >
              {/* =====================================================
                  MOBILE BENEFITS GRID
              ===================================================== */}
              <div
                className="
                  grid
                  w-full
                  grid-cols-4
                  gap-[8px]

                  lg:contents
                "
              >
                {/* BENEFIT 1 */}
                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    justify-start
                    text-center

                    lg:flex-row
                    lg:items-center
                    lg:gap-[20px]
                    lg:text-left
                    lg:min-w-[210px]
                  "
                >
                  <div
                    className="
                      flex
                      h-[42px]
                      w-[42px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FFF0F0]

                      sm:h-[46px]
                      sm:w-[46px]

                      lg:h-[58px]
                      lg:w-[58px]
                    "
                  >
                    <Gift
                      size={23}
                      strokeWidth={1.8}
                      className="text-[#F04444] lg:h-8 lg:w-8"
                    />
                  </div>

                  <div
                    className="
                      mt-[7px]
                      min-w-0

                      lg:mt-0
                    "
                  >
                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[10px]
                        font-medium
                        leading-[14px]
                        text-[#111111]

                        sm:text-[12px]
                        sm:leading-[17px]

                        lg:text-[14px]
                        lg:leading-[20px]
                      "
                    >
                      10% OFF
                    </p>

                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[8px]
                        font-normal
                        leading-[13px]
                        text-[#111111]

                        sm:text-[10px]
                        sm:leading-[15px]

                        lg:text-[13px]
                        lg:leading-[20px]
                      "
                    >
                      For New User
                    </p>
                  </div>
                </div>

                {/* BENEFIT 2 */}
                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    justify-start
                    text-center

                    lg:flex-row
                    lg:items-center
                    lg:gap-[20px]
                    lg:text-left
                    lg:min-w-[220px]
                  "
                >
                  <div
                    className="
                      flex
                      h-[42px]
                      w-[42px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FFF9E7]

                      sm:h-[46px]
                      sm:w-[46px]

                      lg:h-[58px]
                      lg:w-[58px]
                    "
                  >
                    <span
                      className="
                        bg-gradient-to-br
                        from-[#FF198F]
                        via-[#6E3EFF]
                        to-[#12C9D8]
                        bg-clip-text
                        font-sans
                        text-[26px]
                        font-extrabold
                        italic
                        leading-none
                        text-transparent

                        sm:text-[29px]

                        lg:text-[34px]
                      "
                    >
                      N
                    </span>
                  </div>

                  <div
                    className="
                      mt-[7px]
                      min-w-0

                      lg:mt-0
                    "
                  >
                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[9px]
                        font-medium
                        leading-[14px]
                        text-[#111111]

                        sm:text-[11px]
                        sm:leading-[17px]

                        lg:text-[14px]
                        lg:leading-[20px]
                      "
                    >
                      Earn Neu Coins
                    </p>

                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[8px]
                        font-normal
                        leading-[13px]
                        text-[#111111]

                        sm:text-[10px]
                        sm:leading-[15px]

                        lg:text-[13px]
                        lg:leading-[20px]
                      "
                    >
                      On eligible Purchase
                    </p>
                  </div>
                </div>

                {/* BENEFIT 3 */}
                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    justify-start
                    text-center

                    lg:flex-row
                    lg:items-center
                    lg:gap-[20px]
                    lg:text-left
                    lg:min-w-[220px]
                  "
                >
                  <div
                    className="
                      flex
                      h-[42px]
                      w-[42px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#EDF3FF]

                      sm:h-[46px]
                      sm:w-[46px]

                      lg:h-[58px]
                      lg:w-[58px]
                    "
                  >
                    <CreditCard
                      size={23}
                      strokeWidth={1.8}
                      className="text-[#3157D5] lg:h-[31px] lg:w-[31px]"
                    />
                  </div>

                  <div
                    className="
                      mt-[7px]
                      min-w-0

                      lg:mt-0
                    "
                  >
                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[9px]
                        font-medium
                        leading-[14px]
                        text-[#111111]

                        sm:text-[11px]
                        sm:leading-[17px]

                        lg:text-[14px]
                        lg:leading-[20px]
                      "
                    >
                      No Cost EMI
                    </p>

                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[8px]
                        font-normal
                        leading-[13px]
                        text-[#111111]

                        sm:text-[10px]
                        sm:leading-[15px]

                        lg:text-[13px]
                        lg:leading-[20px]
                      "
                    >
                      Option
                    </p>
                  </div>
                </div>

                {/* BENEFIT 4 */}
                <div
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    justify-start
                    text-center

                    lg:flex-row
                    lg:items-center
                    lg:gap-[20px]
                    lg:text-left
                    lg:min-w-[230px]
                  "
                >
                  <div
                    className="
                      flex
                      h-[42px]
                      w-[42px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#EDF9F1]

                      sm:h-[46px]
                      sm:w-[46px]

                      lg:h-[58px]
                      lg:w-[58px]
                    "
                  >
                    <Zap
                      size={23}
                      fill="currentColor"
                      strokeWidth={1.5}
                      className="text-[#6244FF] lg:h-8 lg:w-8"
                    />
                  </div>

                  <div
                    className="
                      mt-[7px]
                      min-w-0

                      lg:mt-0
                    "
                  >
                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[9px]
                        font-medium
                        leading-[14px]
                        text-[#111111]

                        sm:text-[11px]
                        sm:leading-[17px]

                        lg:text-[14px]
                        lg:leading-[20px]
                      "
                    >
                      Snapmint
                    </p>

                    <p
                      className="
                        m-0
                        whitespace-nowrap
                        font-sans
                        text-[8px]
                        font-normal
                        leading-[13px]
                        text-[#111111]

                        sm:text-[10px]
                        sm:leading-[15px]

                        lg:text-[13px]
                        lg:leading-[20px]
                      "
                    >
                      Buy Now Pay Later
                    </p>
                  </div>
                </div>
              </div>

              {/* =====================================================
                  SIGN UP BUTTON
              ===================================================== */}
              <button
                type="button"
                onClick={handleSignUp}
                className="
                  flex
                  h-[40px]
                  w-full
                  shrink-0
                  items-center
                  justify-center
                  rounded-[7px]
                  border-0
                  bg-[#050505]
                  px-[20px]
                  font-sans
                  text-[12px]
                  font-medium
                  tracking-[0.2px]
                  text-white
                  transition-all
                  duration-200
                  hover:bg-[#181818]
                  active:scale-[0.98]

                  sm:h-[44px]
                  sm:text-[13px]

                  lg:h-[60px]
                  lg:w-[267px]
                  lg:px-[40px]
                  lg:text-[14px]
                "
              >
                SIGN UP
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            BANNER
            YE TOKEN HONE KE BAAD BHI VISIBLE RAHEGA
        ========================================================= */}
        <div
          className="
            mt-[8px]
            w-full
            overflow-hidden

            sm:mt-[10px]

            lg:mt-[16px]
          "
        >
          <div
            className="
              relative
              aspect-[4.95/1]
              w-full
              overflow-hidden
            "
          >
            <Image
              src={Banner}
              alt="Made in India - A IndieKoonect Story"
              fill
              priority
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
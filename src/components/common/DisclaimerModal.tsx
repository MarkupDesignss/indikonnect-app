"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ConsentItem {
  id: string;
  text: string;
}

interface DisclaimerModalProps {
  onConsent?: () => void;
  onDecline?: () => void;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    id: "item-1",
    text: "You have read, understood, and freely consented to be bound by this Consent, our Privacy Policy, our Cookie Policy, and, wherever applicable, our Return & Refund Policy and Distributor Agreement (Policies & Procedures and Code of Ethics).",
  },
  {
    id: "item-2",
    text: 'You must be at least 18 years of age and legally competent to enter into a binding contract under Indian Law to register on the Website as a "Customer" or "Distributor".',
  },
  {
    id: "item-3",
    text: "You must provide accurate, current, and complete information during registration and keep such information updated.",
  },
  {
    id: "item-4",
    text: "Distributor registration is additionally governed by the Distributor Joining Agreement, Code of Ethics, and Policies & Procedures published on the Website, which you separately acknowledge and accept during onboarding.",
  },
  {
    id: "item-5",
    text: "You have read and understood this Website Consent & Terms of Use, the Privacy Policy, and the Cookie Policy of the Website. You voluntarily consent to the collection, use, and disclosure of your personal data as described therein, and you agree to be bound by these terms.",
  },
];

/* =========================================================
   SHIELD
========================================================= */

const ShieldMark = () => (
  <div className="mx-auto h-12 w-12 shrink-0 sm:h-14 sm:w-14">
    <svg
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
    >
      <path
        d="M36 2L66 19.3205V52.6795L36 70L6 52.6795V19.3205L36 2Z"
        fill="white"
      />

      <path
        d="M36 4.5L63.5 20.7631V51.2369L36 67.5L8.5 51.2369V20.7631L36 4.5Z"
        fill="#FFC72C"
      />

      <path
        d="M36 18L49 22.5V36C49 44.5 43.5 51 36 54C28.5 51 23 44.5 23 36V22.5L36 18Z"
        fill="#09254B"
      />

      <circle
        cx="36"
        cy="32"
        r="3"
        fill="#FFC72C"
      />

      <path
        d="M35 34H37V42H35V34Z"
        fill="#FFC72C"
      />
    </svg>
  </div>
);

/* =========================================================
   CHECKBOX
========================================================= */

const ConsentCheckbox = ({
  checked,
}: {
  checked: boolean;
}) => {
  return (
    <span
      className={`
        mt-[1px]
        flex
        h-5
        w-5
        shrink-0
        items-center
        justify-center
        rounded-[5px]
        border
        transition-all
        duration-200
        sm:h-[21px]
        sm:w-[21px]
        ${
          checked
            ? "border-[#09254B] bg-[#09254B]"
            : "border-[#09254B] bg-white"
        }
      `}
      aria-hidden="true"
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 7.5L5.5 10.5L11.5 3.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
};

/* =========================================================
   SPINNER
========================================================= */

const Spinner = () => (
  <svg
    className="ml-2 h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />

    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/* =========================================================
   CHECKBOX LIST
========================================================= */

const ConsentCheckboxList = ({
  checkedItems,
}: {
  checkedItems: boolean[];
}) => {
  return (
    <div className="mt-5 w-full">
      <div className="w-full space-y-3">
        {CONSENT_ITEMS.map((item, index) => {
          const checked = checkedItems[index];

          return (
            <div
              key={item.id}
              className={`
                flex
                w-full
                items-start
                gap-3
                rounded-[12px]
                px-2
                py-2.5
                transition-all
                duration-200
                sm:px-3
                ${
                  checked
                    ? "bg-white"
                    : "bg-white/70"
                }
              `}
            >
              <ConsentCheckbox checked={checked} />

              <p
                className="
                  min-w-0
                  flex-1
                  break-words
                  text-[11px]
                  leading-[1.55]
                  text-[#272727]
                  sm:text-[12px]
                  md:text-[13px]
                "
              >
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   CONTENT
========================================================= */

const ConsentContent = ({
  isPending,
  checkedItems,
  onAccept,
  onDecline,
}: {
  isPending: boolean;
  checkedItems: boolean[];
  onAccept: () => void;
  onDecline: () => void;
}) => {
  const allChecked = checkedItems.every(Boolean);

  const completedCount =
    checkedItems.filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[820px] min-w-0">
      <ShieldMark />

      <h1
        id="dialogTitle"
        className="
          mt-2
          text-center
          text-[17px]
          font-semibold
          leading-tight
          text-[#09254B]
          sm:text-[19px]
          md:text-[21px]
        "
      >
        Disclaimer & Confirmation
      </h1>

      <div
        id="dialogDesc"
        className="
          mt-4
          w-full
          space-y-2.5
          text-[11px]
          leading-[1.5]
          text-[#272727]
          sm:text-[12px]
          md:text-[13px]
        "
      >
        <p>
          This Consent governs your access to and use of
          www.indiekonnect.com and any related digital platforms
          operated by us (collectively, the "Website"), whether you
          are browsing as a Visitor, registering as a Customer, or
          registering as an Independent Brand Affiliate/Direct Seller
          ("Distributor").
        </p>

        <p>
          By accessing, browsing, or using the Website, creating an
          account, or clicking 'I Agree' / 'I Accept', you confirm
          that:
        </p>
      </div>

      {/* CHECKBOXES */}
      <ConsentCheckboxList
        checkedItems={checkedItems}
      />

      <p
        className="
          mt-4
          text-[11px]
          leading-[1.5]
          text-[#272727]
          sm:text-[12px]
          md:text-[13px]
        "
      >
        If you do not agree with any part of this Consent, please
        discontinue use of the website immediately.
      </p>

      {/* PROGRESS */}
      <div className="mt-4 text-center">
        <span
          className="
            text-[11px]
            font-medium
            text-[#09254B]
            sm:text-[12px]
          "
        >
          {completedCount} of {CONSENT_ITEMS.length} confirmations
          completed
        </span>
      </div>

      {/* BUTTONS */}
      <div
        className="
          mt-5
          flex
          w-full
          flex-col
          items-center
          justify-center
          gap-2.5
          sm:flex-row
        "
      >
        {/* DECLINE */}
        <button
          type="button"
          onClick={onDecline}
          disabled={isPending}
          className="
            flex
            h-[40px]
            min-w-[120px]
            items-center
            justify-center
            rounded-[13px]
            border
            border-[#09254B]
            bg-transparent
            px-5
            text-[12px]
            font-medium
            text-[#09254B]
            transition
            hover:bg-[#09254B]/5
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          Decline
        </button>

        {/* AGREE */}
        <button
          type="button"
          onClick={onAccept}
          disabled={isPending || allChecked}
          className="
            flex
            h-[40px]
            min-w-[120px]
            items-center
            justify-center
            rounded-[13px]
            bg-[#F6B205]
            px-5
            text-[12px]
            font-medium
            text-[#09254B]
            shadow-[0_6px_15px_rgba(246,178,5,0.18)]
            transition
            hover:bg-[#DE9F00]
            disabled:pointer-events-none
            disabled:opacity-50
          "
        >
          {isPending ? "Processing..." : "I Agree"}

          {isPending && <Spinner />}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   CONSENT GATE
========================================================= */

const ConsentGate = ({
  onConsent,
  onDecline,
}: DisclaimerModalProps) => {
  const [visible, setVisible] = useState(true);

  const [pending, setPending] = useState(false);

  /*
   * Each checkbox becomes checked one-by-one.
   */
  const [checkedItems, setCheckedItems] =
    useState<boolean[]>(
      () => CONSENT_ITEMS.map(() => false)
    );

  const [closing, setClosing] = useState(false);

  const modalRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     LOCK PAGE
  ========================================================= */

  useEffect(() => {
    if (!visible) return;

    const body = document.body;
    const html = document.documentElement;

    const oldBodyOverflow =
      body.style.overflow;

    const oldBodyOverflowX =
      body.style.overflowX;

    const oldHtmlOverflowX =
      html.style.overflowX;

    body.style.overflow = "hidden";
    body.style.overflowX = "hidden";
    html.style.overflowX = "hidden";

    return () => {
      body.style.overflow =
        oldBodyOverflow;

      body.style.overflowX =
        oldBodyOverflowX;

      html.style.overflowX =
        oldHtmlOverflowX;
    };
  }, [visible]);

  /* =========================================================
     CLOSE CURRENT TAB
  ========================================================= */

  const closeCurrentTab = useCallback(() => {
    /*
     * Try to close the current browser tab.
     */
    try {
      window.open("", "_self");
      window.close();
    } catch (error) {
      console.error(
        "Current tab close attempt failed:",
        error
      );
    }

    /*
     * Browser fallback:
     *
     * If Chrome/Edge prevents window.close()
     * for a normal manually opened tab,
     * replace the current website with blank page.
     */
    window.setTimeout(() => {
      try {
        window.location.replace(
          "about:blank"
        );
      } catch (error) {
        console.error(
          "Unable to replace current page:",
          error
        );
      }
    }, 250);
  }, []);

  /* =========================================================
     KEYBOARD
  ========================================================= */

  useEffect(() => {
    if (
      !visible ||
      !modalRef.current
    ) {
      return;
    }

    const element =
      modalRef.current;

    const buttons =
      element.querySelectorAll<HTMLButtonElement>(
        "button"
      );

    const firstButton =
      buttons[0];

    const lastButton =
      buttons[buttons.length - 1];

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      /*
       * TAB FOCUS TRAP
       */
      if (
        event.key === "Tab" &&
        buttons.length > 0
      ) {
        if (
          event.shiftKey &&
          document.activeElement ===
            firstButton
        ) {
          event.preventDefault();

          lastButton?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement ===
            lastButton
        ) {
          event.preventDefault();

          firstButton?.focus();
        }
      }

      /*
       * ESC = DECLINE
       */
      if (
        event.key === "Escape" &&
        !pending
      ) {
        handleDecline();
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [visible, pending]);

  /* =========================================================
     ACCEPT / NEXT CHECKBOX
  ========================================================= */

  const handleAccept = useCallback(() => {
    if (pending) return;

    /*
     * Find the first unchecked item.
     */
    const nextIndex =
      checkedItems.findIndex(
        (checked) => !checked
      );

    /*
     * Everything already checked.
     */
    if (nextIndex === -1) {
      return;
    }

    /*
     * Check only the next item.
     */
    const updatedItems =
      [...checkedItems];

    updatedItems[nextIndex] = true;

    setCheckedItems(
      updatedItems
    );

    /*
     * Check whether this was
     * the final confirmation.
     */
    const isLastCheckbox =
      nextIndex ===
      CONSENT_ITEMS.length - 1;

    /*
     * Not the last checkbox yet.
     * User has to click I Agree again.
     */
    if (!isLastCheckbox) {
      return;
    }

    /* =======================================================
       FINAL CONSENT
    ======================================================= */

    setPending(true);

    try {
      /*
       * Save consent.
       */
      localStorage.setItem(
        "consent_given",
        "true"
      );

      console.log(
        "✅ consent_given:",
        localStorage.getItem(
          "consent_given"
        )
      );

      /*
       * Parent callback.
       */
      onConsent?.();

      /*
       * Close modal animation.
       */
      setClosing(true);

      window.setTimeout(() => {
        setVisible(false);
        setPending(false);
      }, 250);
    } catch (error) {
      console.error(
        "Failed to save consent:",
        error
      );

      setPending(false);
    }
  }, [
    checkedItems,
    onConsent,
    pending,
  ]);

  /* =========================================================
     DECLINE
  ========================================================= */

  const handleDecline = useCallback(() => {
    if (pending) return;

    try {
      /*
       * Save declined status.
       */
      localStorage.setItem(
        "consent_given",
        "false"
      );

      console.log(
        "❌ consent_given:",
        localStorage.getItem(
          "consent_given"
        )
      );

      /*
       * Parent callback.
       */
      onDecline?.();

      /*
       * Try closing CURRENT browser tab.
       */
      window.setTimeout(() => {
        closeCurrentTab();
      }, 50);
    } catch (error) {
      console.error(
        "Failed to save decline:",
        error
      );

      /*
       * Still attempt to close
       * or replace current tab.
       */
      closeCurrentTab();
    }
  }, [
    closeCurrentTab,
    onDecline,
    pending,
  ]);

  /* =========================================================
     HIDDEN
  ========================================================= */

  if (!visible) {
    return null;
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`
          fixed
          inset-0
          z-[2000]
          flex
          h-[100dvh]
          w-screen
          max-w-[100vw]
          items-center
          justify-center
          overflow-hidden
          bg-black/35
          p-3
          sm:p-4
          ${
            closing
              ? "opacity-0"
              : "opacity-100"
          }
          transition-opacity
          duration-200
        `}
      >
        {/* MODAL */}
        <div
          ref={modalRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="dialogTitle"
          aria-describedby="dialogDesc"
          className="
            relative
            flex
            h-auto
            max-h-[calc(100dvh-24px)]
            w-[calc(100vw-24px)]
            min-w-0
            max-w-[900px]
            flex-col
            overflow-x-clip
            overflow-y-auto
            overscroll-contain
            rounded-[22px]
            bg-[#F1F1F1]
            px-4
            py-5
            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            sm:max-h-[calc(100dvh-32px)]
            sm:w-[calc(100vw-32px)]
            sm:px-6
            sm:py-6
            md:px-8
            md:py-7
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",
          }}
        >
          <ConsentContent
            isPending={pending}
            checkedItems={checkedItems}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </div>
      </div>
    </>
  );
};

/* =========================================================
   MAIN EXPORT
========================================================= */

export default function DisclaimerModal({
  onConsent,
  onDecline,
}: DisclaimerModalProps) {
  return (
    <>
      <style jsx global>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden !important;
        }

        body {
          margin: 0;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        img,
        svg,
        video,
        canvas {
          max-width: 100%;
        }

        button {
          max-width: 100%;
        }

        @media (max-width: 640px) {
          html,
          body {
            overflow-x: hidden !important;
            overscroll-behavior-x: none !important;
          }
        }
      `}</style>

      <ConsentGate
        onConsent={onConsent}
        onDecline={onDecline}
      />
    </>
  );
}

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

const ShieldMark = () => (
  <div className="mx-auto h-10 w-10 shrink-0 sm:h-12 sm:w-12">
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
      <circle cx="36" cy="32" r="3" fill="#FFC72C" />
      <path d="M35 34H37V42H35V34Z" fill="#FFC72C" />
    </svg>
  </div>
);

const ConsentCheckbox = ({ checked }: { checked: boolean }) => (
  <span
    className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200 sm:h-[21px] sm:w-[21px] ${
      checked
        ? "border-[#09254B] bg-[#09254B]"
        : "border-[#09254B] bg-white"
    }`}
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

const ConsentCheckboxList = ({
  checkedItems,
  onToggleItem,
  listRef,
  itemRefs,
}: {
  checkedItems: boolean[];
  onToggleItem: (index: number) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}) => {
  return (
    <div
      ref={listRef}
      className="consent-scroll-area mt-3 w-full overflow-x-hidden overflow-y-auto overscroll-contain rounded-[12px] border border-[#09254B]/15 bg-white/70 p-2 sm:p-2.5"
      style={{
        maxHeight: "35vh",
        minHeight: "130px",
        scrollbarWidth: "auto",
        scrollbarColor: "#09254B #E5E7EB",
        touchAction: "pan-y",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="w-full space-y-2">
        {CONSENT_ITEMS.map((item, index) => {
          const checked = checkedItems[index];

          return (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              onClick={() => onToggleItem(index)}
              aria-pressed={checked}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-[10px] px-2 py-2 text-left transition-all duration-200 sm:px-3 ${
                checked
                  ? "bg-white ring-1 ring-[#09254B]/10"
                  : "bg-white/50 hover:bg-white"
              }`}
            >
              <ConsentCheckbox checked={checked} />

              <p className="min-w-0 flex-1 break-words text-[11px] leading-[1.5] text-[#272727] sm:text-[12px] md:text-[13px]">
                {item.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ConsentContent = ({
  isPending,
  checkedItems,
  onAccept,
  onDecline,
  onToggleItem,
  listRef,
  itemRefs,
}: {
  isPending: boolean;
  checkedItems: boolean[];
  onAccept: () => void;
  onDecline: () => void;
  onToggleItem: (index: number) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  itemRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
}) => {
  const completedCount = checkedItems.filter(Boolean).length;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[820px] flex-col">
      <ShieldMark />

      <h1
        id="dialogTitle"
        className="mt-2 text-center text-[17px] font-semibold leading-tight text-[#09254B] sm:text-[19px] md:text-[21px]"
      >
        Disclaimer &amp; Confirmation
      </h1>

      <div
        id="dialogDesc"
        className="mt-3 w-full space-y-2 text-[11px] leading-[1.5] text-[#272727] sm:text-[12px] md:text-[13px]"
      >
        <p>
          This Consent governs your access to and use of
          www.indiekonnect.com and any related digital platforms operated by
          us (collectively, the &quot;Website&quot;), whether you are browsing
          as a Visitor, registering as a Customer, or registering as an
          Independent Brand Affiliate/Direct Seller (&quot;Distributor&quot;).
        </p>

        <p>
          By accessing, browsing, or using the Website, creating an account,
          or clicking &apos;I Agree&apos; / &apos;I Accept&apos;, you confirm
          that:
        </p>
      </div>

      <ConsentCheckboxList
        checkedItems={checkedItems}
        onToggleItem={onToggleItem}
        listRef={listRef}
        itemRefs={itemRefs}
      />

      <p className="mt-3 text-[11px] leading-[1.5] text-[#272727] sm:text-[12px] md:text-[13px]">
        If you do not agree with any part of this Consent, please discontinue
        use of the website immediately.
      </p>

      <div className="mt-2 text-center">
        <span className="text-[11px] font-medium text-[#09254B] sm:text-[12px]">
          {completedCount} of {CONSENT_ITEMS.length} confirmations completed
        </span>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onDecline}
          disabled={isPending}
          className="flex h-[40px] min-w-[120px] items-center justify-center rounded-[12px] border border-[#09254B] bg-transparent px-5 text-[12px] font-medium text-[#09254B] transition hover:bg-[#09254B]/5 disabled:pointer-events-none disabled:opacity-50"
        >
          Decline
        </button>

        <button
          type="button"
          onClick={onAccept}
          disabled={isPending}
          className="flex h-[40px] min-w-[120px] items-center justify-center rounded-[12px] bg-[#F6B205] px-5 text-[12px] font-medium text-[#09254B] shadow-[0_6px_15px_rgba(246,178,5,0.18)] transition hover:bg-[#DE9F00] disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? "Processing..." : "I Agree"}
          {isPending && <Spinner />}
        </button>
      </div>
    </div>
  );
};

const ConsentGate = ({
  onConsent,
  onDecline,
}: DisclaimerModalProps) => {
  const [visible, setVisible] = useState(true);
  const [pending, setPending] = useState(false);
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    () => CONSENT_ITEMS.map(() => false)
  );
  const [closing, setClosing] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Lock background scrolling.
  useEffect(() => {
    if (!visible) return;

    const body = document.body;
    const html = document.documentElement;

    const scrollY = window.scrollY;

    const oldBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    const oldHtmlStyles = {
      overflow: html.style.overflow,
      overscrollBehavior: html.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = oldHtmlStyles.overflow;
      html.style.overscrollBehavior =
        oldHtmlStyles.overscrollBehavior;

      body.style.position = oldBodyStyles.position;
      body.style.top = oldBodyStyles.top;
      body.style.left = oldBodyStyles.left;
      body.style.right = oldBodyStyles.right;
      body.style.width = oldBodyStyles.width;
      body.style.overflow = oldBodyStyles.overflow;

      window.scrollTo(0, scrollY);
    };
  }, [visible]);

  // Handle wheel and touch scrolling without background scroll.
  useEffect(() => {
    if (!visible) return;

    const handleWheel = (event: WheelEvent) => {
      const target = event.target as Node;

      if (!modalRef.current?.contains(target)) {
        event.preventDefault();
        return;
      }

      const targetElement =
        target instanceof Element ? target : null;

      const list = listRef.current;
      const modal = modalRef.current;

      const listTarget = targetElement?.closest(
        ".consent-scroll-area"
      );

      // Scroll the list when mouse is over the list.
      if (listTarget && list && list.contains(listTarget)) {
        const atTop = list.scrollTop <= 0;
        const atBottom =
          list.scrollTop + list.clientHeight >=
          list.scrollHeight - 1;

        const scrollingUp = event.deltaY < 0;
        const scrollingDown = event.deltaY > 0;

        if (
          (atTop && scrollingUp) ||
          (atBottom && scrollingDown)
        ) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      // Scroll modal when mouse is anywhere else inside modal.
      if (modal) {
        event.preventDefault();
        modal.scrollTop += event.deltaY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as Node;

      if (!modalRef.current?.contains(target)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    window.addEventListener("touchmove", handleTouchMove, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
    };
  }, [visible]);

  const closeCurrentTab = useCallback(() => {
    try {
      window.open("", "_self");
      window.close();
    } catch {}

    window.setTimeout(() => {
      try {
        window.location.replace("about:blank");
      } catch {}
    }, 250);
  }, []);

  const finalizeConsent = useCallback(() => {
    setPending(true);

    try {
      localStorage.setItem("consent_given", "true");

      onConsent?.();

      setClosing(true);

      window.setTimeout(() => {
        setVisible(false);
        setPending(false);
      }, 250);
    } catch {
      setPending(false);
    }
  }, [onConsent]);

  const handleToggleItem = useCallback(
    (index: number) => {
      if (pending) return;

      setCheckedItems((prev) => {
        const updated = [...prev];
        updated[index] = !updated[index];
        return updated;
      });
    },
    [pending]
  );

  // Automatically select and scroll to the next unchecked point.
  const handleAccept = useCallback(() => {
    if (pending) return;

    const nextIndex = checkedItems.findIndex(
      (checked) => !checked
    );

    if (nextIndex === -1) {
      finalizeConsent();
      return;
    }

    const updated = [...checkedItems];
    updated[nextIndex] = true;

    setCheckedItems(updated);

    requestAnimationFrame(() => {
      const list = listRef.current;
      const selectedItem = itemRefs.current[nextIndex];

      if (!list || !selectedItem) return;

      const itemTop = selectedItem.offsetTop - list.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      const visibleTop = list.scrollTop;
      const visibleBottom = visibleTop + list.clientHeight;

      if (itemBottom > visibleBottom) {
        list.scrollTo({
          top: itemBottom - list.clientHeight + 12,
          behavior: "smooth",
        });
      } else if (itemTop < visibleTop) {
        list.scrollTo({
          top: itemTop - 12,
          behavior: "smooth",
        });
      }
    });

    if (updated.every(Boolean)) {
      window.setTimeout(() => {
        finalizeConsent();
      }, 300);
    }
  }, [checkedItems, finalizeConsent, pending]);

  const handleDecline = useCallback(() => {
    if (pending) return;

    try {
      localStorage.setItem("consent_given", "false");

      onDecline?.();

      window.setTimeout(() => {
        closeCurrentTab();
      }, 50);
    } catch {
      closeCurrentTab();
    }
  }, [closeCurrentTab, onDecline, pending]);

  // Keyboard focus management.
  useEffect(() => {
    if (!visible || !modalRef.current) return;

    const element = modalRef.current;
    const buttons =
      element.querySelectorAll<HTMLButtonElement>("button");

    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && buttons.length > 0) {
        if (
          event.shiftKey &&
          document.activeElement === firstButton
        ) {
          event.preventDefault();
          lastButton?.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastButton
        ) {
          event.preventDefault();
          firstButton?.focus();
        }
      }

      if (event.key === "Escape" && !pending) {
        event.preventDefault();
        handleDecline();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visible, pending, handleDecline]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex h-[100dvh] w-screen max-w-[100vw] items-center justify-center overflow-hidden bg-black/60 p-3 backdrop-blur-sm transition-opacity duration-200 sm:p-4 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogTitle"
        aria-describedby="dialogDesc"
        className="relative flex h-auto max-h-[90dvh] w-[calc(100vw-24px)] min-w-0 max-w-[800px] flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-[22px] bg-[#F1F1F1] px-4 py-5 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:px-6 sm:py-6 md:px-8 md:py-7"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#09254B #E5E7EB",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <ConsentContent
          isPending={pending}
          checkedItems={checkedItems}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onToggleItem={handleToggleItem}
          listRef={listRef}
          itemRefs={itemRefs}
        />
      </div>
    </div>
  );
};

export default function DisclaimerModal({
  onConsent,
  onDecline,
}: DisclaimerModalProps) {
  return (
    <ConsentGate
      onConsent={onConsent}
      onDecline={onDecline}
    />
  );
}

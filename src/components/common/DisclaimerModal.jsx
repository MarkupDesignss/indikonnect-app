// app/components/DisclaimerModal.jsx
"use client";

import { useState } from "react";
import styles from "./DisclaimerModal.module.css";

const DisclaimerModal = ({ isOpen, onClose, onConfirm }) => {
  const [checkedItems, setCheckedItems] = useState({
    terms: false,
    privacy: false,
    consent: false,
  });

  if (!isOpen) return null;

  const handleCheckboxChange = (key) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleAgree = () => {
    if (allChecked) {
      onConfirm();
      onClose();
    }
  };

  const checklistItems = [
    {
      id: "terms",
      text: "I have read and understood the Terms of Service and agree to be bound by them.",
    },
    {
      id: "privacy",
      text: "I acknowledge the Privacy Policy and consent to the collection and processing of my personal data.",
    },
    {
      id: "consent",
      text: "I confirm that I am at least 18 years of age and legally capable of entering into this agreement.",
    },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="disclaimer-title"
      >
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <svg
              className={styles.logoIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shield Icon */}
              <path
                d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 id="disclaimer-title" className={styles.title}>
            Disclaimer & Confirmation
          </h2>
        </div>

        <div className={styles.content}>
          <p className={styles.paragraph}>
            Please carefully read and acknowledge the following statements
            before proceeding. Your agreement is required to access our
            services.
          </p>

          <ul className={styles.checklist}>
            {checklistItems.map((item) => (
              <li
                key={item.id}
                className={styles.checklistItem}
                onClick={() => handleCheckboxChange(item.id)}
              >
                <span
                  className={`${styles.checkIcon} ${checkedItems[item.id] ? styles.checkIconActive : ""}`}
                  role="checkbox"
                  aria-checked={checkedItems[item.id]}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleCheckboxChange(item.id);
                    }
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {checkedItems[item.id] ? (
                      <>
                        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
                        <path
                          d="M8 12L11 15L16 9"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="#D3D3D3"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </span>
                <span className={styles.checklistText}>{item.text}</span>
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            By clicking "I Agree", you confirm that you have read and accept all
            the terms outlined above.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnDecline} onClick={onClose}>
            Decline
          </button>
          <button
            className={`${styles.btnAgree} ${!allChecked ? styles.btnAgreeDisabled : ""}`}
            onClick={handleAgree}
            disabled={!allChecked}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;

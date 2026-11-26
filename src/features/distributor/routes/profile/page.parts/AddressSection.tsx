"use client";

import AddressComponent from "@/features/profile/components/AddressComponent";
import { SectionHeader, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function AddressSection() {
  return (
    <section className={`${sectionClass} mt-5`}>
      <SectionHeader
        title="Address"
        subtitle="Manage your saved delivery & billing addresses"
      />

      <div className="address-card-wrapper -mt-1 min-w-0">
        <AddressComponent buttonPosition="bottom" />
      </div>

      <style jsx global>{`
        .address-card-wrapper {
          min-width: 0;
          width: 100%;
          max-width: 100%;
        }

        .address-card-wrapper > div {
          margin-top: 0 !important;
          max-width: 100%;
          min-width: 0;
        }

        .address-card-wrapper input,
        .address-card-wrapper textarea,
        .address-card-wrapper select {
          box-sizing: border-box;
          max-width: 100%;
          min-width: 0;
          border-radius: 12px !important;
          border-color: #e4e5e8 !important;
          background: #fff !important;
        }

        .address-card-wrapper input:focus-visible,
        .address-card-wrapper textarea:focus-visible,
        .address-card-wrapper select:focus-visible {
          outline: 2px solid rgba(20, 20, 20, 0.15);
          outline-offset: 1px;
        }

        .address-card-wrapper h2 {
          color: #222 !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }

        .address-card-wrapper > div > div:first-child > button {
          display: none !important;
        }

        .address-card-wrapper .add-address-bottom-btn,
        .address-card-wrapper .border-dashed button {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 43px !important;
          max-width: 100%;
          padding: 0 20px !important;
          border: 1px solid #141414 !important;
          border-radius: 11px !important;
          background: #141414 !important;
          box-shadow: none !important;
          color: #fff !important;
          font-size: 12.5px !important;
          font-weight: 700 !important;
          transition: background-color 0.15s ease !important;
        }

        .address-card-wrapper .add-address-bottom-btn:hover,
        .address-card-wrapper .border-dashed button:hover {
          background: #000 !important;
        }

        .address-card-wrapper .add-address-bottom-btn {
          margin-top: 14px !important;
        }

        .address-card-wrapper button.underline {
          color: #454545 !important;
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }

        .address-card-wrapper button.underline:hover {
          color: #000 !important;
        }

        .address-card-wrapper img {
          max-width: 100%;
          object-fit: cover;
        }

        @media (max-width: 639px) {
          .address-card-wrapper,
          .address-card-wrapper p,
          .address-card-wrapper span {
            overflow-wrap: anywhere;
          }

          .address-card-wrapper .add-address-bottom-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}

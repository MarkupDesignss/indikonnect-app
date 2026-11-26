"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { SaveButton, SectionHeader, inputClass, labelClass, readOnlyClass, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function ProfileForm({
  user,
  onSave,
  loading,
}: {
  user: any;
  onSave: (data: { full_name: string }) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    idNumber: "",
    panNumber: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.full_name || "",
      email: user.email || "",
      country: user.country || "",
      idNumber: user.aadhaar_last4 ? `XXXX-XXXX-${user.aadhaar_last4}` : "",
      panNumber: user.pan_last4 ? `XXXXX${user.pan_last4}` : "",
      dateOfBirth: user.date_of_birth || "",
    });
  }, [user]);

  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return null;
  };

  const handleNameChange = (value: string) => {
    setFormData((previous) => ({
      ...previous,
      fullName: value,
    }));

    setTouched((previous) => ({
      ...previous,
      fullName: true,
    }));

    setErrors((previous) => ({
      ...previous,
      fullName: validateFullName(value) || "",
    }));
  };

  const handleSave = () => {
    const error = validateFullName(formData.fullName);
    setErrors({ fullName: error || "" });
    setTouched({ fullName: true });

    if (!error) {
      onSave({
        full_name: formData.fullName.trim(),
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }
  };

  return (
    <section className={sectionClass}>
      <SectionHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      <div className="space-y-4 sm:space-y-[16px]">
        <div className="min-w-0">
          <label className={labelClass}>
            Full Name<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={(event) => handleNameChange(event.target.value)}
            onBlur={() => {
              setTouched((previous) => ({
                ...previous,
                fullName: true,
              }));
              setErrors((previous) => ({
                ...previous,
                fullName: validateFullName(formData.fullName) || "",
              }));
            }}
            onKeyDown={handleKeyDown}
            className={`${inputClass} ${
              touched.fullName && errors.fullName
                ? "border-red-500 ring-2 ring-red-500/10"
                : ""
            }`}
          />
          {touched.fullName && errors.fullName && (
            <p className="mt-1 break-words text-[10.5px] text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="min-w-0">
          <label className={labelClass}>
            Email Address{" "}
            <span className="ml-2 inline-block rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[9px] font-medium text-[#8A8E97]">
              READ ONLY
            </span>
          </label>
          <input
            type="email"
            value={formData.email}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Country</label>
          <input
            value={formData.country}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass}>Aadhaar (Last 4)</label>
            <input
              value={formData.idNumber}
              readOnly
              disabled
              className={readOnlyClass}
            />
          </div>

          <div className="min-w-0">
            <label className={labelClass}>PAN (Masked)</label>
            <input
              value={formData.panNumber}
              readOnly
              disabled
              className={readOnlyClass}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Date of Birth</label>
          <input
            value={formData.dateOfBirth}
            readOnly
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="flex justify-end border-t border-[#EAF0F7] pt-5">
          <SaveButton onClick={handleSave} loading={loading} />
        </div>
      </div>
    </section>
  );
}

"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "@/lib/slices/toastSlice";
import { useAddBeneficiaryMutation, useUpdateBeneficiaryMutation } from "@/lib/redux/api/distributor/beneficiaryApi";
import { EMERALD, GhostButton, RELATIONSHIP_OPTIONS, SaveButton, SectionHeader, getErrorMessage, inputClass, labelClass, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


// ============================================
// BENEFICIARY SECTION (NEW)
// ============================================

export function BeneficiarySection({
  beneficiaries,
  onSuccess,
}: {
  beneficiaries?: any[] | null;
  onSuccess?: () => void | Promise<unknown>;
}) {
  const dispatch = useDispatch();

  const [addBeneficiary, { isLoading: isAdding }] = useAddBeneficiaryMutation();
  const [updateBeneficiary, { isLoading: isUpdatingBeneficiary }] =
    useUpdateBeneficiaryMutation();

  // Profile API response ke top-level `beneficiaries` array se pehli entry.
  // Mili to form autofill + "Update", nahi mili to khali form + "Add".
  const existing =
    Array.isArray(beneficiaries) && beneficiaries.length > 0
      ? beneficiaries[0]
      : null;

  // NOTE: response me `id` nahi aa raha, isliye fallback user_id le rahe hain.
  // Backend se `id` bhejwa do to update sahi record par jayega.
  const beneficiaryId: number | null = existing
    ? (existing.id ?? existing.user_id ?? null)
    : null;

  const [form, setForm] = useState({
    full_name: existing?.full_name ?? "",
    relationship: existing?.relationship ?? "",
    age: existing?.age != null ? String(existing.age) : "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Profile refetch hone par form ko sync rakho
  useEffect(() => {
    if (!existing) return;
    setForm({
      full_name: existing.full_name ?? "",
      relationship: existing.relationship ?? "",
      age: existing.age != null ? String(existing.age) : "",
    });
    setErrors({});
    setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.full_name, existing?.relationship, existing?.age]);

  const isEditMode = existing !== null;

  // Update button tabhi enable ho jab kuch badla ho
  const hasChanges =
    !isEditMode ||
    form.full_name.trim() !== (existing?.full_name ?? "") ||
    form.relationship !== (existing?.relationship ?? "") ||
    form.age !== (existing?.age != null ? String(existing.age) : "");
  const loading = isAdding || isUpdatingBeneficiary;

  const validate = (field: "full_name" | "relationship" | "age", value: string) => {
    if (field === "full_name") {
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      if (!/^[A-Za-z\s.'-]+$/.test(value.trim()))
        return "Name can only contain letters and spaces";
      return "";
    }

    if (field === "relationship") {
      return value ? "" : "Please select a relationship";
    }

    if (!value.trim()) return "Age is required";
    if (!/^\d+$/.test(value.trim())) return "Age must be a whole number";
    const age = Number(value);
    if (age < 1 || age > 120) return "Age must be between 1 and 120";
    return "";
  };

  const handleChange = (
    field: "full_name" | "relationship" | "age",
    value: string,
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({ ...previous, [field]: validate(field, value) }));
  };

  const handleBlur = (field: "full_name" | "relationship" | "age") => {
    setTouched((previous) => ({ ...previous, [field]: true }));
    setErrors((previous) => ({
      ...previous,
      [field]: validate(field, form[field]),
    }));
  };

  const handleReset = () => {
    setForm({
      full_name: existing?.full_name ?? "",
      relationship: existing?.relationship ?? "",
      age: existing?.age != null ? String(existing.age) : "",
    });
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextErrors = {
      full_name: validate("full_name", form.full_name),
      relationship: validate("relationship", form.relationship),
      age: validate("age", form.age),
    };

    setErrors(nextErrors);
    setTouched({ full_name: true, relationship: true, age: true });

    if (Object.values(nextErrors).some(Boolean)) return;

    const body = {
      full_name: form.full_name.trim(),
      relationship: form.relationship,
      age: Number(form.age),
    };

    try {
      const response = isEditMode
        ? await updateBeneficiary({ id: beneficiaryId as number, body }).unwrap()
        : await addBeneficiary(body).unwrap();

      if (response?.success === false) {
        dispatch(
          showToast({
            message: response.message || "Unable to save beneficiary.",
            type: "error",
          }),
        );
        return;
      }

      dispatch(
        showToast({
          message:
            response?.message ||
            (isEditMode
              ? "Beneficiary updated successfully."
              : "Beneficiary added successfully."),
          type: "success",
        }),
      );

      await onSuccess?.();
    } catch (error: unknown) {
      dispatch(
        showToast({
          message: getErrorMessage(
            error,
            "Something went wrong while saving beneficiary.",
          ),
          type: "error",
        }),
      );
    }
  };

  const fieldError = (field: "full_name" | "relationship" | "age") =>
    touched[field] && errors[field] ? errors[field] : "";

  return (
    <section className={sectionClass}>
      <SectionHeader
        title="Beneficiary"
        subtitle={
          isEditMode
            ? "Update your nominee / beneficiary details"
            : "Add a nominee who will benefit from your account"
        }
      />

      {isEditMode && (
        <div className="mb-4 flex min-w-0 items-start gap-2 rounded-[12px] bg-[#eaf7f0] px-3 py-2.5">
          <CheckCircle2
            size={14}
            className="mt-0.5 shrink-0"
            style={{ color: EMERALD }}
          />
          <p
            className="break-words text-[11px] font-semibold leading-4 sm:text-[11.5px]"
            style={{ color: EMERALD }}
          >
            Saved beneficiary details are filled in below. Edit and click
            Update to save changes.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-[16px]"
        noValidate
      >
        <div className="min-w-0">
          <label htmlFor="beneficiary-name" className={labelClass}>
            Full Name<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input
            id="beneficiary-name"
            type="text"
            autoComplete="off"
            value={form.full_name}
            onChange={(event) => handleChange("full_name", event.target.value)}
            onBlur={() => handleBlur("full_name")}
            placeholder="Enter beneficiary full name"
            aria-invalid={Boolean(fieldError("full_name"))}
            className={`${inputClass} ${
              fieldError("full_name")
                ? "border-red-500 ring-2 ring-red-500/10"
                : ""
            }`}
          />
          {fieldError("full_name") && (
            <p className="mt-1 break-words text-[10.5px] text-red-500">
              {fieldError("full_name")}
            </p>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="beneficiary-relationship" className={labelClass}>
              Relationship<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id="beneficiary-relationship"
              value={form.relationship}
              onChange={(event) =>
                handleChange("relationship", event.target.value)
              }
              onBlur={() => handleBlur("relationship")}
              aria-invalid={Boolean(fieldError("relationship"))}
              className={`${inputClass} appearance-none bg-[length:16px] ${
                fieldError("relationship")
                  ? "border-red-500 ring-2 ring-red-500/10"
                  : ""
              } ${form.relationship ? "" : "text-[#98A6B9] font-normal"}`}
            >
              <option value="">Select relationship</option>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {fieldError("relationship") && (
              <p className="mt-1 break-words text-[10.5px] text-red-500">
                {fieldError("relationship")}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <label htmlFor="beneficiary-age" className={labelClass}>
              Age<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              id="beneficiary-age"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={3}
              value={form.age}
              onChange={(event) =>
                handleChange("age", event.target.value.replace(/[^\d]/g, ""))
              }
              onBlur={() => handleBlur("age")}
              placeholder="Enter age"
              aria-invalid={Boolean(fieldError("age"))}
              className={`${inputClass} ${
                fieldError("age") ? "border-red-500 ring-2 ring-red-500/10" : ""
              }`}
            />
            {fieldError("age") && (
              <p className="mt-1 break-words text-[10.5px] text-red-500">
                {fieldError("age")}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-[#EAF0F7] pt-5 sm:flex-row sm:justify-end">
          <GhostButton text="Reset" onClick={handleReset} />
          <SaveButton
            type="submit"
            text={isEditMode ? "Update Beneficiary" : "Add Beneficiary"}
            loading={loading}
            disabled={!hasChanges}
          />
        </div>
      </form>
    </section>
  );
}

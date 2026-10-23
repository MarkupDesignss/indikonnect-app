"use client";



import {

  Pencil,

  UserRound,

  Loader2,

  Eye,

  EyeOff,

} from "lucide-react";



import {

  useState,

  useRef,

  useEffect,

  type ChangeEvent,

  type KeyboardEvent,

} from "react";



import { useDispatch } from "react-redux";



import DashboardHeader from "@/components/Distributor/distributor/DashboardHeader";

import Sidebar from "../../../components/Distributor/distributor/Sidebar";



import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";



import {

  useChangePasswordMutation,

  useUpdateUserProfileMutation,

} from "@/lib/redux/api/Profile/userApi";



import AddressComponent from "@/components/profile/AddressComponent";

import { showToast } from "@/lib/slices/toastSlice";
import DistributorPVCSection from "./DistributorPVCSection";



// --------------------------------------------------

// Design tokens

// --------------------------------------------------



const NAVY = "#0E1B3D";

const EMERALD = "#1f9d6b";



// --------------------------------------------------

// Responsive styles

// --------------------------------------------------



const inputClass =

  "box-border h-[42px] min-w-0 w-full rounded-[10px] border border-[#e9edf2] bg-[#f7f8fa] px-3.5 text-[13px] text-[#475066] outline-none placeholder:text-[#98a2b3] transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10 sm:px-[14px]";



const readOnlyClass =

  "box-border h-[42px] min-w-0 w-full rounded-[10px] border border-[#e9edf2] bg-[#f2f4f7] px-3.5 text-[12px] text-[#667085] outline-none cursor-not-allowed sm:px-[14px] sm:text-[13px]";



const labelClass =

  "mb-2 block break-words text-[12px] font-semibold leading-5 text-[#475066] sm:text-[12.5px]";



const sectionClass =

  "min-w-0 w-full rounded-[12px] border border-[#e9edf2] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5 lg:p-[22px]";



// --------------------------------------------------

// Error helper

// --------------------------------------------------



function getErrorMessage(err: any, fallback: string): string {

  const data = err?.data;



  if (data?.errors && typeof data.errors === "object") {

    const firstKey = Object.keys(data.errors)[0];

    const firstVal = data.errors[firstKey];



    if (Array.isArray(firstVal) && firstVal.length > 0) {

      return String(firstVal[0]);

    }



    if (typeof firstVal === "string") {

      return firstVal;

    }

  }



  if (data?.message) return data.message;

  if (err?.message) return err.message;



  return fallback;

}



// --------------------------------------------------

// Section Header

// --------------------------------------------------



function SectionHeader({

  title,

  subtitle,

}: {

  title: string;

  subtitle?: string;

}) {

  return (

    <div className="mb-4 flex min-w-0 items-start gap-2.5 border-b border-[#e9edf2] pb-3.5 sm:mb-[18px]">

      <span

        className="mt-0.5 h-4 w-1 shrink-0 rounded-full"

        style={{ backgroundColor: NAVY }}

      />



      <div className="min-w-0 flex-1">

        <h3 className="break-words text-[14px] font-semibold text-[#101828]">

          {title}

        </h3>



        {subtitle && (

          <p className="mt-1 break-words text-[11px] leading-4 text-[#98a2b3] sm:text-[11.5px]">

            {subtitle}

          </p>

        )}

      </div>

    </div>

  );

}



// --------------------------------------------------

// Save Button

// --------------------------------------------------



function SaveButton({

  text = "Save",

  onClick,

  disabled = false,

  loading = false,

}: {

  text?: string;

  onClick?: () => void;

  disabled?: boolean;

  loading?: boolean;

}) {

  const unavailable = disabled || loading;



  return (

    <button

      type="button"

      onClick={onClick}

      disabled={unavailable}

      style={

        !unavailable

          ? {

            backgroundColor: NAVY,

            boxShadow: `0 8px 20px -8px ${NAVY}66`,

          }

          : undefined

      }

      className={`inline-flex min-h-[38px] min-w-[80px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] px-4 text-[12px] font-semibold text-white transition-all sm:px-5 sm:text-[12.5px] ${unavailable

        ? "cursor-not-allowed bg-[#c1c6d0]"

        : "hover:brightness-110"

        }`}

    >

      {loading && (

        <Loader2 size={14} className="shrink-0 animate-spin" />

      )}



      {text}

    </button>

  );

}



// --------------------------------------------------

// Secondary Button

// --------------------------------------------------



function GhostButton({

  text,

  onClick,

}: {

  text: string;

  onClick?: () => void;

}) {

  return (

    <button

      type="button"

      onClick={onClick}

      className="inline-flex min-h-[38px] min-w-[80px] shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] border border-[#e9edf2] bg-white px-4 text-[12px] font-semibold text-[#475066] transition-colors hover:bg-[#f7f8fa] sm:px-5 sm:text-[12.5px]"

    >

      {text}

    </button>

  );

}



// ============================================

// PROFILE SUMMARY

// ============================================



function ProfileSummary({ user }: { user: any }) {

  const initials = user?.full_name

    ? user.full_name

      .split(" ")

      .filter(Boolean)

      .map((name: string) => name[0])

      .join("")

      .toUpperCase()

      .slice(0, 2)

    : "U";



  return (

    <div className={sectionClass}>

      <div className="flex min-w-0 items-center gap-3">

        <div

          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-12 sm:w-12"

          style={{ backgroundColor: NAVY }}

        >

          {user?.profile_picture ? (

            <img

              src={user.profile_picture}

              alt="Profile"

              className="h-full w-full object-cover"

            />

          ) : (

            <span className="text-[14px] font-bold text-white">

              {initials}

            </span>

          )}

        </div>



        <div className="min-w-0 flex-1">

          <p className="break-words text-[12px] font-bold leading-5 text-[#101828] sm:text-[14px]">

            {user?.full_name?.toUpperCase() || "—"}

          </p>



          <p className="break-all text-[11px] leading-4 text-[#98a2b3] sm:truncate sm:text-[11.5px]">

            {user?.email || "—"}

          </p>

        </div>



        <span

          className="h-2.5 w-2.5 shrink-0 rounded-full"

          style={{

            backgroundColor: user?.is_active ? EMERALD : "#98a2b3",

          }}

          title={user?.is_active ? "Active" : "Inactive"}

        />

      </div>



      <div className="mt-4 space-y-3.5 border-t border-dashed border-[#e9edf2] pt-4 sm:mt-[18px]">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">

            Account ID

          </p>



          <p className="mt-1 break-all text-[12px] font-semibold text-[#475066] sm:text-[13px]">

            {user?.distributor_id || "—"}

          </p>

        </div>



        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">

            Account Type

          </p>



          <p className="mt-1 break-words text-[12px] font-semibold capitalize text-[#475066] sm:text-[13px]">

            {user?.account_type || "—"}

          </p>

        </div>



        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#98a2b3] sm:text-[11.5px]">

            Status

          </p>



          <p

            className="mt-1 flex items-center gap-2 break-words text-[12px] font-semibold sm:text-[13px]"

            style={{

              color: user?.is_active ? EMERALD : "#98a2b3",

            }}

          >

            <span

              className="h-2 w-2 shrink-0 rounded-full"

              style={{

                backgroundColor: user?.is_active ? EMERALD : "#98a2b3",

              }}

            />



            <span>

              {user?.distributor_status ||

                (user?.is_active ? "Active" : "Inactive")}

            </span>

          </p>

        </div>

      </div>

    </div>

  );

}



// ============================================

// PROFILE IMAGE CARD

// ============================================



function ProfileImageCard({

  user,

  onSave,

  loading,

}: {

  user: any;

  onSave: (file: File) => void;

  loading: boolean;

}) {

  const fileInputRef = useRef<HTMLInputElement>(null);



  const [imagePreview, setImagePreview] = useState<string | null>(

    user?.profile_picture || null

  );



  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);



  useEffect(() => {

    if (!selectedFile) {

      setImagePreview(user?.profile_picture || null);

    }

  }, [user?.profile_picture, selectedFile]);



  const handleImageClick = () => {

    if (!loading) {

      fileInputRef.current?.click();

    }

  };



  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];



    if (!file) return;



    if (file.size > 5 * 1024 * 1024) {

      setError("File size must be less than 5MB");

      event.target.value = "";

      return;

    }



    if (!file.type.startsWith("image/")) {

      setError("Please upload an image file");

      event.target.value = "";

      return;

    }



    setError(null);

    setSelectedFile(file);



    const reader = new FileReader();



    reader.onloadend = () => {

      setImagePreview(reader.result as string);

    };



    reader.readAsDataURL(file);

  };



  const handleSave = () => {

    if (selectedFile) {

      onSave(selectedFile);

    } else {

      setError("Please upload an image first");

    }

  };



  const handleCancel = () => {

    setSelectedFile(null);

    setImagePreview(user?.profile_picture || null);

    setError(null);



    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };



  return (

    <div className={sectionClass}>

      <h3 className="text-center text-[12px] font-semibold text-[#101828] sm:text-[13px]">

        UPDATE PROFILE IMAGE

      </h3>



      <div className="mt-4 flex justify-center sm:mt-5">

        <div className="relative">

          <button

            type="button"

            onClick={handleImageClick}

            disabled={loading}

            aria-label="Upload profile image"

            className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border-2 border-[#e9edf2] bg-[#f7f8fa] transition-all hover:border-[#0E1B3D] disabled:cursor-not-allowed sm:h-[110px] sm:w-[110px]"

          >

            {imagePreview ? (

              <img

                src={imagePreview}

                alt="Profile preview"

                className="h-full w-full object-cover"

              />

            ) : (

              <UserRound

                size={64}

                strokeWidth={1}

                className="text-[#98a2b3] sm:h-[70px] sm:w-[70px]"

              />

            )}

          </button>



          <button

            type="button"

            onClick={handleImageClick}

            disabled={loading}

            aria-label="Edit profile image"

            className="absolute right-0 top-0 flex h-[29px] w-[29px] items-center justify-center rounded-full border-2 bg-white shadow-md transition-colors hover:bg-[#f7f8fa] disabled:cursor-not-allowed"

            style={{ borderColor: NAVY }}

          >

            <Pencil size={13} style={{ color: NAVY }} />

          </button>



          <input

            ref={fileInputRef}

            type="file"

            accept="image/*"

            className="hidden"

            onChange={handleFileChange}

          />

        </div>

      </div>



      {error && (

        <p className="mt-2 break-words text-center text-[10.5px] text-red-500">

          {error}

        </p>

      )}



      <p className="mt-2 text-center text-[10px] leading-4 text-[#98a2b3] sm:text-[10.5px]">

        Click on image to upload (Max 5MB)

      </p>



      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-[18px]">

        <GhostButton text="Cancel" onClick={handleCancel} />



        <SaveButton

          text="Save"

          onClick={handleSave}

          loading={loading}

          disabled={!selectedFile}

        />

      </div>

    </div>

  );

}



// ============================================

// PROFILE FORM

// ============================================



function ProfileForm({

  user,

  onSave,

  loading,

}: {

  user: any;

  onSave: (data: { full_name: string; phone: string }) => void;

  loading: boolean;

}) {

  const [formData, setFormData] = useState({

    fullName: "",

    email: "",

    country: "",

    phone: "",

    idNumber: "",

    passportNumber: "",

    dateOfBirth: "",

  });



  const [errors, setErrors] = useState<Record<string, string>>({});

  const [touched, setTouched] = useState<Record<string, boolean>>({});



  useEffect(() => {

    if (user) {

      setFormData({

        fullName: user.full_name || "",

        email: user.email || "",

        country: user.country || "",

        phone: (user.phone || "").replace(/^\\+91/, ""),

        idNumber: user.aadhaar_last4

          ? `XXXX-XXXX-${user.aadhaar_last4}`

          : "",

        passportNumber: user.pan_last4

          ? `XXXXX${user.pan_last4}`

          : "",

        dateOfBirth: user.date_of_birth || "",

      });

    }

  }, [user]);



  const validateFullName = (name: string) => {

    if (!name.trim()) return "Full name is required";

    if (name.trim().length < 2) {

      return "Name must be at least 2 characters";

    }



    return null;

  };



  const validatePhone = (phone: string) => {

    if (!phone) return "Phone number is required";

    if (!/^\d{10}$/.test(phone)) {

      return "Phone must be exactly 10 digits";

    }



    return null;

  };



  const handleFieldChange = (

    field: string,

    value: string,

    validationFn?: (val: string) => string | null

  ) => {

    setFormData((previous) => ({

      ...previous,

      [field]: value,

    }));



    setTouched((previous) => ({

      ...previous,

      [field]: true,

    }));



    if (validationFn) {

      const error = validationFn(value);



      setErrors((previous) => ({

        ...previous,

        [field]: error || "",

      }));

    }

  };



  const handleBlur = (

    field: string,

    validationFn?: (val: string) => string | null

  ) => {

    setTouched((previous) => ({

      ...previous,

      [field]: true,

    }));



    if (validationFn) {

      const value = formData[field as keyof typeof formData];

      const error = validationFn(value);



      setErrors((previous) => ({

        ...previous,

        [field]: error || "",

      }));

    }

  };



  const handleSave = () => {

    const newErrors: Record<string, string> = {};



    const nameError = validateFullName(formData.fullName);

    const phoneError = validatePhone(formData.phone);



    if (nameError) newErrors.fullName = nameError;

    if (phoneError) newErrors.phone = phoneError;



    setErrors(newErrors);

    setTouched({

      fullName: true,

      phone: true,

    });



    if (Object.keys(newErrors).length === 0) {

      onSave({

        full_name: formData.fullName.trim(),

        phone: `+91${formData.phone}`,

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

        {/* Full name */}

        <div className="min-w-0">

          <label className={labelClass}>

            Full Name<span className="ml-0.5 text-red-500">*</span>

          </label>



          <input

            type="text"

            autoComplete="name"

            value={formData.fullName}

            onChange={(event) =>

              handleFieldChange(

                "fullName",

                event.target.value,

                validateFullName

              )

            }

            onBlur={() => handleBlur("fullName", validateFullName)}

            onKeyDown={handleKeyDown}

            className={`${inputClass} ${touched.fullName && errors.fullName

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



        {/* Email */}

        <div className="min-w-0">

          <label className={labelClass}>

            Email Address



            <span className="ml-2 inline-block rounded bg-[#f2f4f7] px-1.5 py-0.5 text-[9px] font-medium text-[#98a2b3]">

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



        {/* Country and phone */}

        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="min-w-0">

            <label className={labelClass}>Country</label>



            <input

              value={formData.country}

              readOnly

              disabled

              className={readOnlyClass}

            />

          </div>



          <div className="min-w-0">

            <label className={labelClass}>

              Phone Number<span className="ml-0.5 text-red-500">*</span>

            </label>



            <div className="flex min-w-0 gap-2">

              <input

                value="+91"

                disabled

                aria-label="Country calling code"

                className="box-border h-[42px] w-[48px] shrink-0 rounded-[10px] border border-[#e9edf2] bg-[#f2f4f7] text-center text-[12px] font-semibold text-[#475066] outline-none sm:w-[52px] sm:text-[13px]"

              />



              <div className="min-w-0 flex-1">

                <input

                  type="tel"

                  inputMode="numeric"

                  autoComplete="tel-national"

                  aria-label="Phone number"

                  value={formData.phone}

                  onChange={(event) => {

                    const value = event.target.value

                      .replace(/\D/g, "")

                      .slice(0, 10);



                    handleFieldChange(

                      "phone",

                      value,

                      validatePhone

                    );

                  }}

                  onBlur={() => handleBlur("phone", validatePhone)}

                  onKeyDown={handleKeyDown}

                  maxLength={10}

                  className={`${inputClass} ${touched.phone && errors.phone

                    ? "border-red-500 ring-2 ring-red-500/10"

                    : ""

                    }`}

                />



                {touched.phone && errors.phone && (

                  <p className="mt-1 break-words text-[10.5px] text-red-500">

                    {errors.phone}

                  </p>

                )}

              </div>

            </div>

          </div>

        </div>



        {/* Aadhaar and PAN */}

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

              value={formData.passportNumber}

              readOnly

              disabled

              className={readOnlyClass}

            />

          </div>

        </div>



        {/* Date of birth */}

        <div className="min-w-0">

          <label className={labelClass}>Date of Birth</label>



          <input

            value={formData.dateOfBirth}

            readOnly

            disabled

            className={readOnlyClass}

          />

        </div>



        <div className="flex justify-end border-t border-[#f0f2f5] pt-4">

          <SaveButton onClick={handleSave} loading={loading} />

        </div>

      </div>

    </section>

  );

}



// ============================================

// BANK / WALLET DETAILS

// ============================================



function BankWalletDetails({ user }: { user: any }) {

  const bankProfile =

    user?.distributor_profile ?? user?.business_profile;



  const maskedAccount = user?.account_last4

    ? `XXXX XXXX ${user.account_last4}`

    : "—";



  const rows: {

    label: string;

    value: string;

    capitalize?: boolean;

  }[] = [

      {

        label: "Bank Name",

        value: bankProfile?.bank_name || "—",

      },

      {

        label: "Account Holder Name",

        value: bankProfile?.bank_holder_name || "—",

        capitalize: true,

      },

      {

        label: "Account Number",

        value: maskedAccount,

      },

      {

        label: "Account Type",

        value: bankProfile?.account_type || "—",

        capitalize: true,

      },

      {

        label: "IFSC Code",

        value: bankProfile?.bank_ifsc || "—",

      },

      {

        label: "Branch Name",

        value: bankProfile?.branch_name || "—",

      },

    ];



  const bankVerified = !!bankProfile?.bank_verified;



  return (

    <section className={sectionClass}>

      <SectionHeader title="Bank / Wallet Details" />



      {/* Verification status */}

      <div

        className="mb-4 flex min-w-0 items-start gap-2 rounded-[8px] px-3 py-2.5"

        style={{

          backgroundColor: bankVerified ? "#eaf7f0" : "#f8f1e4",

        }}

      >

        <span

          className="mt-1 h-2 w-2 shrink-0 rounded-full"

          style={{

            backgroundColor: bankVerified ? EMERALD : "#B8935A",

          }}

        />



        <p

          className="break-words text-[11px] font-semibold leading-4 sm:text-[11.5px]"

          style={{

            color: bankVerified ? EMERALD : "#B8935A",

          }}

        >

          {bankVerified

            ? "Bank account verified"

            : "Bank verification pending"}

        </p>

      </div>



      <div className="space-y-3.5 sm:space-y-[14px]">

        {rows.map((row) => (

          <div key={row.label} className="min-w-0">

            <label className={labelClass}>{row.label}</label>



            <input

              value={row.value}

              readOnly

              disabled

              className={`${readOnlyClass} ${row.capitalize ? "capitalize" : ""

                }`}

            />

          </div>

        ))}

      </div>

    </section>

  );

}



// ============================================

// ADDRESS SECTION

// ============================================



function AddressSection() {

  return (

    <section className={`${sectionClass} mt-4 sm:mt-[14px]`}>

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

    max-width: 100%;

  }



  /* Force all borders inside the wrapper to be #e9edf2 */

  .address-card-wrapper *,

  .address-card-wrapper input,

  .address-card-wrapper textarea,

  .address-card-wrapper select,

  .address-card-wrapper button,

  .address-card-wrapper div {

    border-color: #e9edf2 !important;

  }



  .address-card-wrapper input,

  .address-card-wrapper textarea,

  .address-card-wrapper select {

    box-sizing: border-box;

    min-width: 0;

    max-width: 100%;

  }



  .address-card-wrapper > div {

    margin-top: 0 !important;

    min-width: 0;

    max-width: 100%;

  }



  .address-card-wrapper h2 {

    font-size: 14px !important;

    font-weight: 600 !important;

    color: #101828 !important;

    margin-bottom: 0 !important;

  }



  .address-card-wrapper > div > div:first-child > button {

    display: none !important;

  }



  .address-card-wrapper .add-address-bottom-btn {

    background-color: #0e1b3d !important;

    border-radius: 10px !important;

    border: 1px solid #e9edf2 !important;

    min-height: 38px !important;

    max-width: 100%;

    padding: 0 20px !important;

    font-size: 12.5px !important;

    font-weight: 600 !important;

    color: #ffffff !important;

    box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;

    transition: filter 0.15s ease !important;

    display: inline-flex !important;

    align-items: center !important;

    justify-content: center !important;

    flex-wrap: wrap;

    gap: 8px !important;

    margin-top: 16px !important;

  }



  .address-card-wrapper .add-address-bottom-btn:hover {

    filter: brightness(1.1) !important;

  }



  .address-card-wrapper .border-dashed button {

    background-color: #0e1b3d !important;

    border-radius: 10px !important;

    border: 1px solid #e9edf2 !important;

    min-height: 38px !important;

    max-width: 100%;

    font-size: 12.5px !important;

    font-weight: 600 !important;

    box-shadow: 0 8px 20px -8px rgba(14, 27, 61, 0.4) !important;

  }



  .address-card-wrapper .rounded-\\\\[8px\\\\] {

    border-radius: 12px !important;

    border-color: #e9edf2 !important;

    border-style: solid !important;

    border-width: 1px !important;

    min-width: 0;

    max-width: 100%;

  }



  .address-card-wrapper .rounded-\\\\[8px\\\\]:hover {

    border-color: #e9edf2 !important;

  }



  .address-card-wrapper .bg-\\\\[\\\\#111111\\\\] {

    background-color: #0e1b3d !important;

  }



  .address-card-wrapper .rounded-\\\\[6px\\\\].text-\\\\[\\\\#888888\\\\] {

    background-color: transparent !important;

    color: #98a2b3 !important;

    border: none !important;

    box-shadow: none !important;

  }



  .address-card-wrapper .rounded-\\\\[6px\\\\].text-\\\\[\\\\#888888\\\\]:hover {

    background-color: #f7f8fa !important;

    color: #0e1b3d !important;

  }



  .address-card-wrapper .rounded-\\\\[6px\\\\] svg {

    color: currentColor !important;

    stroke: currentColor !important;

    flex-shrink: 0;

  }



  .address-card-wrapper button.underline {

    color: #475066 !important;

    background-color: transparent !important;

    box-shadow: none !important;

    border: none !important;

  }



  .address-card-wrapper button.underline:hover {

    color: #0e1b3d !important;

  }



  .address-card-wrapper .bg-white.rounded-full {

    background-color: #ffffff !important;

    border: 1px solid #e9edf2 !important;

  }



  @media (max-width: 639px) {

    .address-card-wrapper {

      width: 100%;

      overflow-wrap: anywhere;

    }



    .address-card-wrapper p,

    .address-card-wrapper span {

      overflow-wrap: anywhere;

    }



    .address-card-wrapper button {

      max-width: 100%;

    }



    .address-card-wrapper img {

      max-width: 100%;

      height: auto;

      object-fit: cover;

    }



    .address-card-wrapper .add-address-bottom-btn {

      width: 100%;

    }

  }

`}</style>

    </section>

  );

}



// ============================================

// SECURITY SECTION

// ============================================



function SecuritySection() {

  const dispatch = useDispatch();



  const [changePassword, { isLoading: isChanging }] =

    useChangePasswordMutation();



  const [security, setSecurity] = useState({

    oldPassword: "",

    password: "",

    confirmPassword: "",

  });



  const [errors, setErrors] = useState<Record<string, string>>({});



  const [showOldPassword, setShowOldPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);



  const [showConfirmPassword, setShowConfirmPassword] =

    useState(false);



  const validateOldPassword = (value: string) => {

    if (!value) return "Old password is required";

    return null;

  };



  const validatePassword = (value: string) => {

    if (!value) return "Password is required";



    if (value.length < 6) {

      return "Password must be at least 6 characters";

    }



    return null;

  };



  const validateConfirmPassword = (

    value: string,

    newPassword = security.password

  ) => {

    if (!value) return "Please confirm your password";



    if (value !== newPassword) {

      return "Passwords do not match";

    }



    return null;

  };



  const handleChange = (

    field: "oldPassword" | "password" | "confirmPassword",

    value: string

  ) => {

    const nextSecurity = {

      ...security,

      [field]: value,

    };



    setSecurity(nextSecurity);



    const nextErrors = {

      ...errors,

    };



    if (field === "oldPassword") {

      nextErrors.oldPassword =

        validateOldPassword(value) || "";

    }



    if (field === "password") {

      nextErrors.password = validatePassword(value) || "";



      if (nextSecurity.confirmPassword) {

        nextErrors.confirmPassword =

          validateConfirmPassword(

            nextSecurity.confirmPassword,

            value

          ) || "";

      }

    }



    if (field === "confirmPassword") {

      nextErrors.confirmPassword =

        validateConfirmPassword(value) || "";

    }



    setErrors(nextErrors);

  };



  const handleSave = async () => {

    const nextErrors: Record<string, string> = {};



    const oldError = validateOldPassword(security.oldPassword);

    const passwordError = validatePassword(security.password);



    const confirmError = validateConfirmPassword(

      security.confirmPassword

    );



    if (oldError) nextErrors.oldPassword = oldError;

    if (passwordError) nextErrors.password = passwordError;

    if (confirmError) nextErrors.confirmPassword = confirmError;



    setErrors(nextErrors);



    if (Object.keys(nextErrors).length > 0) return;



    try {

      const response = await changePassword({

        current_password: security.oldPassword,

        new_password: security.password,

        new_password_confirmation: security.confirmPassword,

      }).unwrap();



      if (response?.status) {

        dispatch(

          showToast({

            message:

              response?.message ||

              "Password changed successfully!",

            type: "success",

          })

        );



        setSecurity({

          oldPassword: "",

          password: "",

          confirmPassword: "",

        });



        setErrors({});

        setShowOldPassword(false);

        setShowNewPassword(false);

        setShowConfirmPassword(false);

      } else {

        dispatch(

          showToast({

            message:

              response?.message || "Failed to change password",

            type: "error",

          })

        );

      }

    } catch (error: any) {

      dispatch(

        showToast({

          message: getErrorMessage(

            error,

            "Something went wrong while changing password"

          ),

          type: "error",

        })

      );

    }

  };



  return (

    <section className={sectionClass}>

      <SectionHeader

        title="Security"

        subtitle="Change your account password"

      />



      <div className="space-y-4 sm:space-y-[16px]">

        {/* Old password */}

        <div className="min-w-0">

          <label className={labelClass}>

            Old Password

            <span className="ml-0.5 text-red-500">*</span>

          </label>



          <div className="relative min-w-0">

            <input

              type={showOldPassword ? "text" : "password"}

              autoComplete="current-password"

              value={security.oldPassword}

              onChange={(event) =>

                handleChange("oldPassword", event.target.value)

              }

              placeholder="Enter current password"

              className={`${inputClass} pr-11 ${errors.oldPassword

                ? "border-red-500 ring-2 ring-red-500/10"

                : ""

                }`}

            />



            <button

              type="button"

              onClick={() => setShowOldPassword((value) => !value)}

              aria-label={

                showOldPassword

                  ? "Hide old password"

                  : "Show old password"

              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] transition-colors hover:text-[#475066]"

            >

              {showOldPassword ? (

                <EyeOff size={16} />

              ) : (

                <Eye size={16} />

              )}

            </button>

          </div>



          {errors.oldPassword && (

            <p className="mt-1 break-words text-[10.5px] text-red-500">

              {errors.oldPassword}

            </p>

          )}

        </div>



        {/* New password */}

        <div className="min-w-0">

          <label className={labelClass}>

            New Password

            <span className="ml-0.5 text-red-500">*</span>

          </label>



          <div className="relative min-w-0">

            <input

              type={showNewPassword ? "text" : "password"}

              autoComplete="new-password"

              value={security.password}

              onChange={(event) =>

                handleChange("password", event.target.value)

              }

              placeholder="Enter new password"

              className={`${inputClass} pr-11 ${errors.password

                ? "border-red-500 ring-2 ring-red-500/10"

                : ""

                }`}

            />



            <button

              type="button"

              onClick={() => setShowNewPassword((value) => !value)}

              aria-label={

                showNewPassword

                  ? "Hide new password"

                  : "Show new password"

              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] transition-colors hover:text-[#475066]"

            >

              {showNewPassword ? (

                <EyeOff size={16} />

              ) : (

                <Eye size={16} />

              )}

            </button>

          </div>



          {errors.password && (

            <p className="mt-1 break-words text-[10.5px] text-red-500">

              {errors.password}

            </p>

          )}

        </div>



        {/* Confirm password */}

        <div className="min-w-0">

          <label className={labelClass}>

            Confirm New Password

            <span className="ml-0.5 text-red-500">*</span>

          </label>



          <div className="relative min-w-0">

            <input

              type={showConfirmPassword ? "text" : "password"}

              autoComplete="new-password"

              value={security.confirmPassword}

              onChange={(event) =>

                handleChange(

                  "confirmPassword",

                  event.target.value

                )

              }

              placeholder="Confirm new password"

              className={`${inputClass} pr-11 ${errors.confirmPassword

                ? "border-red-500 ring-2 ring-red-500/10"

                : ""

                }`}

            />



            <button

              type="button"

              onClick={() =>

                setShowConfirmPassword((value) => !value)

              }

              aria-label={

                showConfirmPassword

                  ? "Hide confirmation password"

                  : "Show confirmation password"

              }

              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3] transition-colors hover:text-[#475066]"

            >

              {showConfirmPassword ? (

                <EyeOff size={16} />

              ) : (

                <Eye size={16} />

              )}

            </button>

          </div>



          {errors.confirmPassword && (

            <p className="mt-1 break-words text-[10.5px] text-red-500">

              {errors.confirmPassword}

            </p>

          )}

        </div>



        <div className="flex justify-end border-t border-[#f0f2f5] pt-4">

          <SaveButton

            text="Change Password"

            onClick={handleSave}

            loading={isChanging}

          />

        </div>

      </div>

    </section>

  );

}



// ============================================

// PAGE

// ============================================



export default function DistributorProfilePage() {

  const dispatch = useDispatch();



  const {

    data,

    isLoading,

    isError,

    refetch,

  } = useGetUserProfileQuery(undefined);



  const [updateUserProfile, { isLoading: isUpdating }] =

    useUpdateUserProfileMutation();



  const user = data?.user;



  // --------------------------------------------------

  // Update profile

  // --------------------------------------------------



  const handleUpdateProfile = async (payload: {

    full_name?: string;

    phone?: string;

    profile_image?: File;

  }) => {

    try {

      const formData = new FormData();



      if (payload.full_name !== undefined) {

        formData.append("full_name", payload.full_name);

      }



      if (payload.phone !== undefined) {

        formData.append("phone", payload.phone);

      }



      if (payload.profile_image) {

        formData.append("profile_picture", payload.profile_image);

      }



      const response = await updateUserProfile(formData).unwrap();



      if (response.status) {

        dispatch(

          showToast({

            message:

              response.message ||

              "Profile updated successfully!",

            type: "success",

          })

        );



        refetch();

      } else {

        dispatch(

          showToast({

            message:

              response.message || "Failed to update profile",

            type: "error",

          })

        );

      }

    } catch (error: any) {

      dispatch(

        showToast({

          message: getErrorMessage(

            error,

            "Something went wrong while updating profile"

          ),

          type: "error",

        })

      );

    }

  };



  // --------------------------------------------------

  // Loading

  // --------------------------------------------------



  if (isLoading) {

    return (

      <div

        className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-white px-4"

        style={{ fontFamily: "'Lato', sans-serif" }}

      >

        <style>{`

          @import url('https\://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');

        `}</style>



        <div className="flex flex-col items-center gap-3">

          <Loader2

            className="h-8 w-8 animate-spin"

            style={{ color: NAVY }}

          />



          <p className="text-[12px] font-semibold text-[#667085]">

            Loading profile...

          </p>

        </div>

      </div>

    );

  }



  // --------------------------------------------------

  // Error

  // --------------------------------------------------



  if (isError || !user) {

    return (

      <div

        className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 overflow-x-hidden bg-white px-4"

        style={{ fontFamily: "'Lato', sans-serif" }}

      >

        <p className="text-center text-[14px] font-semibold text-[#101828]">

          Failed to load profile

        </p>



        <GhostButton text="Retry" onClick={() => refetch()} />

      </div>

    );

  }



  // --------------------------------------------------

  // Main page

  // --------------------------------------------------



  return (

    <div

      className="min-h-dvh w-full overflow-x-hidden bg-white"

      style={{ fontFamily: "'Lato', sans-serif" }}

    >

      <style>{`

        @import url('https\://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');



        html,

        body {

          max-width: 100%;

          overflow-x: hidden;

        }



        *,

        *::before,

        *::after {

          box-sizing: border-box;

        }

      `}</style>



      {/* Dashboard header */}

      <DashboardHeader

        distributorId={user?.distributor_id || ""}

      />



      {/* Main layout */}

      <div className="relative flex min-h-[calc(100dvh-72px)] min-w-0">

        <Sidebar />



        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[#fafcff] px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-5 lg:px-8 lg:pt-6">

          <div className="mx-auto w-full min-w-0 max-w-[1600px]">

            {/* Page header */}

            <div className="mb-5 flex min-w-0 items-start gap-3 sm:mb-[22px]">

              <span

                className="mt-1 h-6 w-1 shrink-0 rounded-full sm:w-1.5"

                style={{ backgroundColor: NAVY }}

              />



              <div className="min-w-0 flex-1">

                <h1 className="break-words text-[20px] font-semibold leading-tight text-[#101828] sm:text-[22px]">

                  My Profile

                </h1>



                <p className="mt-1 break-words text-[11px] leading-5 text-[#98a2b3] sm:text-[12px]">

                  Manage your account, security and bank details

                </p>

              </div>

            </div>



            {/* *

*              Responsive profile layout:*

*              Mobile: 1 column*

*              Tablet: cards adapt independently*

*              Desktop: 3 columns*

*            */}

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px] xl:gap-[14px]">

              {/* LEFT COLUMN */}

              <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-[14px]">

                <ProfileSummary user={user} />



                <ProfileImageCard

                  user={user}

                  loading={isUpdating}

                  onSave={(file) =>

                    handleUpdateProfile({

                      profile_image: file,

                    })

                  }

                />

              </div>



              {/* CENTER COLUMN */}

              <div className="min-w-0">

                <ProfileForm

                  user={user}

                  loading={isUpdating}

                  onSave={(profileData) =>

                    handleUpdateProfile(profileData)

                  }

                />



                <AddressSection />

                <div className="mt-4"><DistributorPVCSection user={user} /></div>

              </div>



              {/* RIGHT COLUMN */}

              <div className="grid min-w-0 grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:gap-[14px]">

                <BankWalletDetails user={user} />



                <SecuritySection />

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>

  );

}
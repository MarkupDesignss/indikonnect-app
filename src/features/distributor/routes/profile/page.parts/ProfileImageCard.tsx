"use client";

import { Camera, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { GhostButton, SaveButton, SectionHeader, sectionClass } from "@/features/distributor/routes/profile/page.parts/support";


export function ProfileImageCard({
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
    user?.profile_picture || null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setImagePreview(user?.profile_picture || null);
    }
  }, [user?.profile_picture, selectedFile]);

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
      <SectionHeader
        title="Profile picture"
        subtitle="Use a clear photo for your account"
      />

      <div className="mt-5 flex justify-center sm:mt-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Upload profile image"
            className="flex h-[110px] w-[110px] items-center justify-center overflow-hidden rounded-full border-[5px] border-[#F4F4F5] bg-[#FAFAFA] shadow-[0_0_0_1px_#E6E7E9] transition hover:shadow-[0_0_0_2px_#202020] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 disabled:cursor-not-allowed sm:h-[118px] sm:w-[118px]"
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
                className="text-[#8A8E97] sm:h-[70px] sm:w-[70px]"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => !loading && fileInputRef.current?.click()}
            disabled={loading}
            aria-label="Edit profile image"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white bg-[#141414] text-white shadow-md transition-colors hover:bg-[#1D468D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed"
          >
            <Camera size={15} />
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

      <p className="mt-2 text-center text-[10px] leading-4 text-[#8A8E97] sm:text-[10.5px]">
        Image file · Maximum 5 MB
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:mt-6">
        <GhostButton text="Cancel" onClick={handleCancel} />
        <SaveButton
          text="Save"
          onClick={() =>
            selectedFile
              ? onSave(selectedFile)
              : setError("Please upload an image first")
          }
          loading={loading}
          disabled={!selectedFile}
        />
      </div>
    </div>
  );
}

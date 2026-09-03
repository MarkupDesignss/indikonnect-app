import React, {
  useState,
  useRef,
  ChangeEvent,
  useEffect,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  X,
  Trash2,
  AlertCircle,
  Ban,
  RotateCcw,
  Plus,
  Camera,
} from "lucide-react";


export interface OrderImage {
  id?: string;
  file: File;
  preview: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface CancelOrderData {
  reason: string;
  images: File[];
  quantity?: number;
}

export interface OrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderReference: string;
  onCancel: (data: CancelOrderData) => void;
  isLoading?: boolean;
  maxImages?: number;
  maxFileSize?: number;
  minReasonLength?: number;
  modalType?: "cancel" | "return";
  order?: any;
}

const OrderCancelModal: React.FC<
  OrderCancelModalProps
> = ({
  isOpen,
  onClose,
  orderReference,
  onCancel,
  isLoading = false,
  maxImages = 5,
  maxFileSize = 5,
  minReasonLength = 10,
  modalType = "cancel",
  order,
}) => {
    const [reason, setReason] = useState("");
    const [images, setImages] = useState<OrderImage[]>([]);
    const [error, setError] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    console.log(order)

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isReturn = modalType === "return";

    const title = isReturn ? "Return Order" : "Cancel Order";
    const IconComponent = isReturn ? RotateCcw : Ban;
    const buttonColor = isReturn
      ? "bg-orange-500 hover:bg-orange-600"
      : "bg-red-500 hover:bg-red-600";
    const buttonText = isReturn ? "Submit Return Request" : "Confirm Cancellation";
    const placeholder = isReturn
      ? "Please tell us why you want to return this order..."
      : "Please tell us why you want to cancel this order...";

    const maxReturnQuantity = Number(order?.quantity) || 1;

    useEffect(() => {
      if (isOpen) {
        resetForm();
      } else {
        resetForm();
      }
    }, [isOpen, order]);

    const resetForm = () => {
      images.forEach((img) => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });

      setImages([]);
      setReason("");
      setError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const validateFile = (file: File): string | null => {
      const maxSizeBytes = maxFileSize * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        return `File "${file.name}" exceeds ${maxFileSize}MB limit`;
      }

      if (!file.type.startsWith("image/")) {
        return `File "${file.name}" is not an image`;
      }

      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      if (!validTypes.includes(file.type)) {
        return `File "${file.name}" format not supported`;
      }

      return null;
    };

    const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;

      if (!files || files.length === 0) {
        return;
      }

      processFiles(files);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;

      if (files && files.length > 0) {
        processFiles(files);
      }
    };

    const processFiles = (files: FileList) => {
      if (images.length + files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);

        setTimeout(() => setError(""), 3000);

        return;
      }

      const validImages: OrderImage[] = [];
      let hasError = false;

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);

        if (validationError) {
          setError(validationError);
          hasError = true;
          return;
        }

        validImages.push({
          file,
          preview: URL.createObjectURL(file),
          isUploading: false,
          uploadProgress: 0,
        });
      });

      if (hasError) {
        setTimeout(() => setError(""), 3000);
        return;
      }

      setImages((prev) => [...prev, ...validImages]);
    };

    const removeImage = (index: number) => {
      setImages((prev) => {
        const newImages = [...prev];

        if (newImages[index].preview) {
          URL.revokeObjectURL(newImages[index].preview);
        }

        newImages.splice(index, 1);

        return newImages;
      });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      setError("");

      if (!reason.trim()) {
        setError(`Please provide a reason for ${isReturn ? "return" : "cancellation"}`);
        return;
      }

      if (reason.trim().length < minReasonLength) {
        setError(`Please provide a more detailed reason (minimum ${minReasonLength} characters)`);
        return;
      }

      const files = images.map((img) => img.file);

      onCancel({
        reason: reason.trim(),
        images: files,
        ...(isReturn ? { quantity: maxReturnQuantity } : {}),
      });
    };

    const backdropVariants = {
      hidden: {
        opacity: 0,
      },
      visible: {
        opacity: 1,
      },
    };

    const modalVariants = {
      hidden: {
        opacity: 0,
        scale: 0.9,
        y: 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 25,
          stiffness: 300,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: {
          duration: 0.2,
        },
      },
    };

    const imageVariants = {
      hidden: {
        opacity: 0,
        scale: 0.8,
      },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          type: "spring",
          damping: 20,
          stiffness: 300,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
          duration: 0.15,
        },
      },
    };

    if (!isOpen) {
      return null;
    }

    return (
      <AnimatePresence>
        {isOpen && (
          // Highest z-index for modal container - z-[9999]
          <div className="fixed inset-0 z-[9999] overflow-y-auto">
            {/* Backdrop with slightly lower z-index */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Modal content with even higher z-index */}
            <div className="relative z-[10000] flex min-h-full items-center justify-center p-4">
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isReturn ? "bg-orange-100" : "bg-red-100"
                          }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${isReturn ? "text-orange-600" : "text-red-600"
                            }`}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Order:{" "}
                          <span className="font-medium text-gray-700">{orderReference}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                      disabled={isLoading}
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>

                  {order && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                        {order.items?.length || 1} items
                      </span>

                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                        ₹{Math.round(Number(order.line_total) || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="max-h-[calc(90vh-180px)] overflow-y-auto px-6 py-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Reason */}
                    <div>
                      <label
                        htmlFor="reason"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                      >
                        Reason for {isReturn ? "Return" : "Cancellation"}{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <textarea
                        id="reason"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                        placeholder={placeholder}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isLoading}
                      />

                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Minimum {minReasonLength} characters
                        </p>

                        <p
                          className={`text-xs ${reason.length >= minReasonLength
                              ? "text-green-600"
                              : "text-gray-400"
                            }`}
                        >
                          {reason.length}/{minReasonLength}
                        </p>
                      </div>
                    </div>

                    {/* Image Upload - ONLY for Return Modal */}
                    {isReturn && (
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Attach Images{" "}
                          <span className="text-xs font-normal text-gray-400">
                            (Optional)
                          </span>
                        </label>

                        {images.length > 0 && (
                          <div className="mb-3 grid grid-cols-3 gap-3">
                            <AnimatePresence>
                              {images.map((image, index) => (
                                <motion.div
                                  key={index}
                                  variants={imageVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  className="group relative"
                                >
                                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                    <img
                                      src={image.preview}
                                      alt={`Upload ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                    <div className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                                      {index + 1}/{images.length}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                      disabled={isLoading}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {images.length < maxImages && (
                              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:bg-blue-50">
                                <div className="text-center">
                                  <Plus className="mx-auto h-6 w-6 text-gray-400" />
                                  <span className="text-[10px] text-gray-500">Add</span>
                                </div>

                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={isLoading}
                                />
                              </label>
                            )}
                          </div>
                        )}

                        {images.length === 0 && (
                          <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className="relative"
                          >
                            <label
                              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 transition-colors ${isDragging
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                                }`}
                            >
                              <Camera
                                className={`h-8 w-8 transition-colors ${isDragging ? "text-blue-500" : "text-gray-400"
                                  }`}
                              />

                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">
                                  {isDragging
                                    ? "Drop your images here"
                                    : "Click or drag & drop to upload"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Max {maxImages} images • {maxFileSize} MB each • JPG, PNG, GIF,
                                  WEBP
                                </p>
                              </div>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isLoading}
                              />
                            </label>
                          </div>
                        )}

                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3"
                            >
                              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                              <p className="text-sm text-red-600">{error}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Message based on modal type */}
                    <p className="pt-1 text-center text-xs text-gray-400">
                      {isReturn
                        ? "Your return request will be reviewed within 24-48 hours."
                        : "This action cannot be undone. Please confirm your decision."}
                    </p>
                  </form>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 border-t border-gray-100 bg-white px-6 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSubmit}
                      disabled={
                        isLoading ||
                        !reason.trim() ||
                        reason.trim().length < minReasonLength
                      }
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${buttonColor}`}
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          <IconComponent className="h-4 w-4" />
                          {buttonText}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  };

export default OrderCancelModal;
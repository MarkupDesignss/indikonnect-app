"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Star,
  X,
  Plus,
  Camera,
  Trash2,
  Send,
  AlertCircle,
  Check,
  Package,
} from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSubmit: (reviewData: any) => Promise<void>;
}

const ReviewModal = ({ isOpen, onClose, order, onSubmit }: ReviewModalProps) => {
  // State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Clean up object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setRating(0);
      setHoverRating(0);
      setReviewText("");
      setImages([]);
      setImagePreviews([]);
      setError("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Auto focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");

    // Check max images (max 5)
    if (files.length + images.length > 5) {
      setError("You can upload maximum 5 images");
      return;
    }

    // Validate file size (max 5MB each)
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      setError("Some files exceed 5MB limit");
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validFilesTypes = validFiles.filter(file => validTypes.includes(file.type));
    if (validFilesTypes.length !== validFiles.length) {
      setError("Only JPG, PNG, GIF, and WEBP formats are allowed");
      return;
    }

    const newImages = [...images, ...validFilesTypes];
    const newPreviews = validFilesTypes.map(file => URL.createObjectURL(file));
    setImages(newImages);
    setImagePreviews([...imagePreviews, ...newPreviews]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validate
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const reviewData = {
        order_id: order.order_id,
        rating: rating,
        review: reviewText.trim(),
        images: images,
        product_id: order.items?.[0]?.product_id,
        order_reference: order.order_reference,
      };

      await onSubmit(reviewData);
      setIsSuccess(true);
      
      // Close after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError("Failed to submit review. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get rating label
  const getRatingLabel = (rating: number) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent!"
    };
    return labels[rating as keyof typeof labels] || "";
  };

  // Character count
  const charCount = reviewText.length;
  const minChars = 10;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#FDCB00] fill-[#FDCB00]" />
                Write a Review
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Order: {order?.order_reference || `#${order?.order_id}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
            {isSuccess ? (
              /* Success State */
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-500 text-center">
                  Your review has been submitted successfully.
                  <br />
                  It will help other customers make better decisions.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Product Info */}
                {order?.items?.[0] && (
                  <div className="flex items-center gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
                      {order.items[0].primary_image ? (
                        <Image
                          src={order.items[0].primary_image}
                          alt={order.items[0].product_name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {order.items[0].product_name || "Unknown Product"}
                      </p>
                      {order.items.length > 1 && (
                        <p className="text-sm text-gray-500">
                          + {order.items.length - 1} more item(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                          whileTap={{ scale: 0.9 }}
                          disabled={isSubmitting}
                        >
                          <Star
                            className={`w-10 h-10 ${
                              star <= (hoverRating || rating)
                                ? "fill-[#FDCB00] text-[#FDCB00]"
                                : "fill-gray-200 text-gray-200"
                            } transition-colors duration-150`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-700 min-h-[20px]">
                      {rating > 0 && (
                        <span className="text-[#FDCB00]">
                          {getRatingLabel(rating)}
                        </span>
                      )}
                      {rating === 0 && (
                        <span className="text-gray-400">Tap a star to rate</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={reviewText}
                      onChange={(e) => {
                        setReviewText(e.target.value);
                        if (error && e.target.value.length >= 10) {
                          setError("");
                        }
                      }}
                      placeholder="Share your experience with this product..."
                      className={`w-full px-4 py-3 bg-gray-50 border ${
                        error && reviewText.length < 10 && reviewText.length > 0
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-[#FDCB00]"
                      } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        error && reviewText.length < 10 && reviewText.length > 0
                          ? "focus:ring-red-500/20"
                          : "focus:ring-[#FDCB00]/20"
                      } transition-all resize-none min-h-[120px]`}
                      maxLength={500}
                      disabled={isSubmitting}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {charCount}/500
                    </div>
                  </div>
                  {charCount > 0 && charCount < minChars && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Minimum {minChars} characters required ({minChars - charCount} remaining)
                    </p>
                  )}
                  {charCount >= minChars && charCount < 20 && (
                    <p className="text-xs text-green-500 mt-1">
                      ✓ Good start! Add more details if you'd like.
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>

                  {/* Image Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <AnimatePresence>
                        {imagePreviews.map((preview, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative group"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                              <img
                                src={preview}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                disabled={isSubmitting}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Upload button if less than 5 images */}
                      {imagePreviews.length < 5 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FDCB00] flex items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-yellow-50">
                          <div className="text-center">
                            <Plus className="w-6 h-6 text-gray-400 mx-auto" />
                            <span className="text-xs text-gray-500">Add</span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Upload area when no images */}
                  {imagePreviews.length === 0 && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="relative"
                    >
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 hover:border-[#FDCB00] rounded-xl cursor-pointer transition-colors bg-gray-50 hover:bg-yellow-50 group">
                        <Camera className="w-8 h-8 text-gray-400 group-hover:text-[#FDCB00] transition-colors" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700 group-hover:text-[#1a1a2e] transition-colors">
                            Click or drag & drop to upload photos
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Max 5 images • 5MB each • JPG, PNG, GIF, WEBP
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0 || reviewText.length < 10}
                  className={`px-6 py-2.5 bg-[#FDCB00] text-[#1a1a2e] rounded-lg font-medium flex items-center gap-2 transition-all ${
                    isSubmitting || rating === 0 || reviewText.length < 10
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-[#E5B800] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1a1a2e] border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
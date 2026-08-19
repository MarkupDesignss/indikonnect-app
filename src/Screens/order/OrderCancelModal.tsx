
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Trash2, 
  AlertCircle,
  Ban,
  RotateCcw,
  Plus,
  Camera
} from 'lucide-react';

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

const OrderCancelModal: React.FC<OrderCancelModalProps> = ({
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
  const [reason, setReason] = useState('');
  const [images, setImages] = useState<OrderImage[]>([]);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReturn = modalType === "return";
  const title = isReturn ? "Return Order" : "Cancel Order";
  const icon = isReturn ? RotateCcw : Ban;
  const IconComponent = icon;
  const buttonColor = isReturn ? "bg-orange-500 hover:bg-orange-600" : "bg-red-500 hover:bg-red-600";
  const accentColor = isReturn ? "orange" : "red";
  const buttonText = isReturn ? "Submit Return Request" : "Confirm Cancellation";
  const placeholder = isReturn 
    ? "Please tell us why you want to return this order..." 
    : "Please tell us why you want to cancel this order...";

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    images.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setImages([]);
    setReason('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSizeBytes = maxFileSize * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return `File "${file.name}" exceeds ${maxFileSize}MB limit`;
    }

    if (!file.type.startsWith('image/')) {
      return `File "${file.name}" is not an image`;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return `File "${file.name}" format not supported`;
    }

    return null;
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      setTimeout(() => setError(''), 3000);
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
      setTimeout(() => setError(''), 3000);
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
    setError('');

    if (!reason.trim()) {
      setError(`Please provide a reason for ${isReturn ? 'return' : 'cancellation'}`);
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
    });
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isReturn ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isReturn ? 'text-orange-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Order: <span className="font-medium text-gray-700">{orderReference}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Order summary chips */}
                {order && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                      {order.items?.length || 0} items
                    </span>
                    <span className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                      ₹{order.total_payable || 0}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                      order.order_status?.toLowerCase() === 'delivered' 
                        ? 'bg-green-100 text-green-700'
                        : order.order_status?.toLowerCase() === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.order_status || 'N/A'}
                    </span>
                  </div>
                )}
              </div>

              {/* Content - Scrollable */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Reason input */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reason for {isReturn ? 'Return' : 'Cancellation'} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-50 text-gray-900 placeholder-gray-400 resize-none text-sm"
                      placeholder={placeholder}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">
                        Minimum {minReasonLength} characters
                      </p>
                      <p className={`text-xs ${reason.length >= minReasonLength ? 'text-green-600' : 'text-gray-400'}`}>
                        {reason.length}/{minReasonLength}
                      </p>
                    </div>
                  </div>

                  {/* Image upload section - Similar to ReviewModal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Attach Images <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                    </label>

                    {/* Image Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <AnimatePresence>
                          {images.map((image, index) => (
                            <motion.div
                              key={index}
                              variants={imageVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="relative group"
                            >
                              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img
                                  src={image.preview}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                {/* Image counter */}
                                <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                                  {index + 1}/{images.length}
                                </div>

                                {/* Delete button */}
                                <button
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Upload button if less than max images */}
                        {images.length < maxImages && (
                          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50">
                            <div className="text-center">
                              <Plus className="w-6 h-6 text-gray-400 mx-auto" />
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

                    {/* Upload area when no images */}
                    {images.length === 0 && (
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className="relative"
                      >
                        <label className={`flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors bg-gray-50 ${
                          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}>
                          <Camera className={`w-8 h-8 ${
                            isDragging ? 'text-blue-500' : 'text-gray-400'
                          } transition-colors`} />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                              {isDragging ? 'Drop your images here' : 'Click or drag & drop to upload'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max {maxImages} images • {maxFileSize}MB each • JPG, PNG, GIF, WEBP
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

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2"
                        >
                          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-gray-400 text-center pt-1">
                    {isReturn 
                      ? 'Your return request will be reviewed within 24-48 hours.'
                      : 'This action cannot be undone. Please confirm your decision.'
                    }
                  </p>
                </form>
              </div>

              {/* Footer - Fixed at bottom */}
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !reason.trim() || reason.trim().length < minReasonLength}
                    className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${buttonColor} rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-${accentColor}-500/25`}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IconComponent className="w-4 h-4" />
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
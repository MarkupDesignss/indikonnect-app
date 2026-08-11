"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Phone, User, Mail, MessageCircle } from "lucide-react";
import { useSubmitContactMutation } from "@/lib/redux/api/ContactApi";

interface ContactFormProps {
    onSubmit?: (data: any) => void;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
    const [submitContact, { isLoading }] = useSubmitContactMutation();
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [formErrors, setFormErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        message?: string;
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");
        setFormErrors({});

        // Client-side validation
        const errors: any = {};
        if (!formData.firstName.trim()) {
            errors.firstName = "First name is required";
        }
        if (!formData.lastName.trim()) {
            errors.lastName = "Last name is required";
        }
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Please enter a valid email address";
        }
        if (!formData.phone.trim()) {
            errors.phone = "Phone number is required";
        } else if (!/^[0-9]{10,14}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = "Please enter a valid phone number (10-14 digits)";
        }
        if (!formData.message.trim()) {
            errors.message = "Message is required";
        } else if (formData.message.trim().length < 10) {
            errors.message = "Message must be at least 10 characters";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            // Prepare data for API
            const contactData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.phone.replace(/\s/g, ''),
                message: formData.message,
            };

            // Call API
            const result = await submitContact(contactData).unwrap();

            // Set success message from backend response
            if (result?.message) {
                setSuccessMessage(result.message);
            } else {
                setSuccessMessage("Your message has been sent successfully!");
            }

            // Set submitted state
            setIsSubmitted(true);
            
            // Call parent onSubmit if provided
            if (onSubmit) {
                onSubmit(contactData);
            }

            // Reset form after 3 seconds
            setTimeout(() => {
                setIsSubmitted(false);
                setSuccessMessage("");
                setFormData({ 
                    firstName: "", 
                    lastName: "", 
                    email: "",
                    phone: "",
                    message: "" 
                });
            }, 3000);

        } catch (error: any) {
            console.error("Contact form submission error:", error);

            // Handle specific error message from backend
            if (error?.data?.message) {
                setErrorMessage(error.data.message);
            } else if (error?.data?.error) {
                // Handle the specific error format from backend
                setErrorMessage(error.data.error);
            } else if (error?.status === 400) {
                setErrorMessage("Please check your input and try again.");
            } else if (error?.status === 429) {
                setErrorMessage("Too many requests. Please try again later.");
            } else if (error?.status === 500) {
                setErrorMessage("Server error. Please try again later.");
            } else {
                setErrorMessage("Failed to send message. Please try again.");
            }

            // Auto-clear error message after 5 seconds
            setTimeout(() => {
                setErrorMessage("");
            }, 5000);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // For phone field, only allow numbers and limit to 14 digits
        if (name === "phone") {
            const cleanedValue = value.replace(/\D/g, '');
            if (cleanedValue.length <= 14) {
                setFormData({
                    ...formData,
                    [name]: cleanedValue,
                });
            }
            // Clear error for phone field
            if (formErrors.phone) {
                setFormErrors({
                    ...formErrors,
                    phone: undefined,
                });
            }
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        // Clear error for this field when user starts typing
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors({
                ...formErrors,
                [name]: undefined,
            });
        }
        // Clear general error message
        if (errorMessage) {
            setErrorMessage("");
        }
        // Clear success message when user starts typing
        if (successMessage) {
            setSuccessMessage("");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                Got Any Questions?
            </h3>
            <p className="text-sm text-gray-500 mb-6" style={{ fontFamily: "'Lato', sans-serif" }}>
                Use the form below to get in touch with the sales team
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all text-black disabled:opacity-50 disabled:cursor-not-allowed ${
                                    formErrors.firstName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-200"
                                }`}
                                placeholder="Enter Your First Name"
                                style={{ fontFamily: "'Lato', sans-serif" }}
                            />
                        </div>
                        <AnimatePresence>
                            {formErrors.firstName && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {formErrors.firstName}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all text-black disabled:opacity-50 disabled:cursor-not-allowed ${
                                    formErrors.lastName
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : "border-gray-200"
                                }`}
                                placeholder="Enter Your Last Name"
                                style={{ fontFamily: "'Lato', sans-serif" }}
                            />
                        </div>
                        <AnimatePresence>
                            {formErrors.lastName && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mt-1 text-xs text-red-500 flex items-center gap-1"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    {formErrors.lastName}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                        Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all text-black disabled:opacity-50 disabled:cursor-not-allowed ${
                                formErrors.email
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200"
                            }`}
                            placeholder="you@example.com"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        />
                    </div>
                    <AnimatePresence>
                        {formErrors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.email}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            maxLength={14}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all text-black disabled:opacity-50 disabled:cursor-not-allowed ${
                                formErrors.phone
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200"
                            }`}
                            placeholder="Enter Your Phone Number"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        />
                    </div>
                    <AnimatePresence>
                        {formErrors.phone && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.phone}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                        Message <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <MessageCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            disabled={isLoading}
                            className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all resize-none text-black disabled:opacity-50 disabled:cursor-not-allowed ${
                                formErrors.message
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : "border-gray-200"
                            }`}
                            placeholder="Your message here (minimum 10 characters)..."
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        />
                    </div>
                    <AnimatePresence>
                        {formErrors.message && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-500 flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" />
                                {formErrors.message}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Success Message from Backend */}
                <AnimatePresence>
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-start gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{successMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* General Error Message from Backend */}
                <AnimatePresence>
                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-start gap-2"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={!isLoading ? { scale: 1.02 } : undefined}
                    whileTap={!isLoading ? { scale: 0.98 } : undefined}
                    type="submit"
                    disabled={isLoading || isSubmitted}
                    className="w-full py-3 bg-[#1a1a2e] text-white rounded-xl font-semibold hover:bg-[#16213e] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#1a1a2e]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                >
                    {isLoading ? (
                        <>
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                            >
                                ⟳
                            </motion.span>
                            Sending...
                        </>
                    ) : isSubmitted ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Message Sent!
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Send Message
                        </>
                    )}
                </motion.button>

                {/* Form footer */}
                <p className="text-xs text-gray-400 text-center mt-2" style={{ fontFamily: "'Lato', sans-serif" }}>
                    We'll get back to you within 24 hours
                </p>
            </form>
        </motion.div>
    );
}
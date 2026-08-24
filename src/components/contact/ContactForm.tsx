"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useSubmitContactMutation } from "@/lib/redux/api/ContactApi";

interface ContactFormProps {
  onSubmit?: (data: any) => void;
}

const subjects = [
  "Order support",
  "Wholesale & partnerships",
  "Press",
  "Something else",
];

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [submitContact, { isLoading }] = useSubmitContactMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "Order support",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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
    } else if (!/^[0-9]{10,14}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number";
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
      const contactData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ""),
        message: `[${formData.subject}] ${formData.message}`,
      };

      const result = await submitContact(contactData).unwrap();

      setSuccessMessage(
        result?.message || "Your message has been sent successfully!",
      );

      setIsSubmitted(true);

      if (onSubmit) {
        onSubmit(contactData);
      }

      setTimeout(() => {
        setIsSubmitted(false);
        setSuccessMessage("");

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "Order support",
          message: "",
        });
      }, 3000);
    } catch (error: any) {
      if (error?.data?.message) {
        setErrorMessage(error.data.message);
      } else if (error?.data?.error) {
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

      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleanedValue = value.replace(/\D/g, "");

      if (cleanedValue.length <= 14) {
        setFormData((prev) => ({
          ...prev,
          phone: cleanedValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="mb-6">
        {/* Heading with Continuous Shimmer Effect */}
        <div className="relative inline-block overflow-hidden">
          <h2
            className="text-[24px] md:text-[28px] font-serif font-semibold text-[#101B3D]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Send us a message
          </h2>

          {/* Continuous Shimmer Effect on Heading */}
          <motion.span
            className="absolute inset-0 -translate-x-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(200, 155, 60, 0.15), transparent)",
              width: "200%",
              height: "100%",
            }}
            animate={{
              x: ["0%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1.5,
            }}
          />
        </div>

        <p className="text-[14px] md:text-[15px] text-gray-500 mt-1.5">
          Questions about an order, a partnership, or an artisan collective
          you&apos;d like us to feature — write in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name + Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2">
              First Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Your first name"
                className={`w-full h-[44px] pl-10 pr-4 rounded-lg border bg-white text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                  formErrors.firstName
                    ? "border-red-400 focus:ring-1 focus:ring-red-300"
                    : "border-[#E5DCCF] focus:border-[#C89B3C] focus:ring-1 focus:ring-[#C89B3C]/20"
                }`}
              />
            </div>

            <AnimatePresence>
              {formErrors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-[12px] text-red-500"
                >
                  {formErrors.firstName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2">
              Last Name
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Your last name"
                className={`w-full h-[44px] pl-10 pr-4 rounded-lg border bg-white text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                  formErrors.lastName
                    ? "border-red-400 focus:ring-1 focus:ring-red-300"
                    : "border-[#E5DCCF] focus:border-[#C89B3C] focus:ring-1 focus:ring-[#C89B3C]/20"
                }`}
              />
            </div>

            <AnimatePresence>
              {formErrors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-[12px] text-red-500"
                >
                  {formErrors.lastName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2">
            Email Address
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="you@email.com"
              className={`w-full h-[44px] pl-10 pr-4 rounded-lg border bg-white text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                formErrors.email
                  ? "border-red-400 focus:ring-1 focus:ring-red-300"
                  : "border-[#E5DCCF] focus:border-[#C89B3C] focus:ring-1 focus:ring-[#C89B3C]/20"
              }`}
            />
          </div>

          <AnimatePresence>
            {formErrors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-[12px] text-red-500"
              >
                {formErrors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2">
            Phone Number
          </label>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter your phone number"
              className={`w-full h-[44px] pl-10 pr-4 rounded-lg border bg-white text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                formErrors.phone
                  ? "border-red-400 focus:ring-1 focus:ring-red-300"
                  : "border-[#E5DCCF] focus:border-[#C89B3C] focus:ring-1 focus:ring-[#C89B3C]/20"
              }`}
            />
          </div>

          <AnimatePresence>
            {formErrors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-[12px] text-red-500"
              >
                {formErrors.phone}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2.5">
            Subject
          </label>

          <div className="flex flex-wrap gap-2.5">
            {subjects.map((subject) => {
              const active = formData.subject === subject;

              return (
                <button
                  key={subject}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      subject,
                    }))
                  }
                  className={`px-4 py-2 rounded-full border text-[12px] transition-all ${
                    active
                      ? "border-[#C89B3C] bg-[#FFF9EC] text-[#16213E] font-medium"
                      : "border-[#E5DCCF] bg-white text-gray-500 hover:border-[#C89B3C] hover:text-[#16213E]"
                  }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#172044] mb-2">
            Message
          </label>

          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={isLoading}
              rows={5}
              placeholder="Tell us how we can help"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border bg-white text-[14px] text-gray-800 placeholder:text-gray-400 resize-none outline-none transition-all ${
                formErrors.message
                  ? "border-red-400 focus:ring-1 focus:ring-red-300"
                  : "border-[#E5DCCF] focus:border-[#C89B3C] focus:ring-1 focus:ring-[#C89B3C]/20"
              }`}
            />
          </div>

          <AnimatePresence>
            {formErrors.message && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-[12px] text-red-500"
              >
                {formErrors.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700 flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-600 flex items-center gap-2.5"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button with Hover Shimmer Effect */}
        <div className="relative inline-block">
          <motion.button
            type="submit"
            disabled={isLoading || isSubmitted}
            whileHover={
              !isLoading && !isSubmitted ? { scale: 1.02 } : undefined
            }
            whileTap={!isLoading && !isSubmitted ? { scale: 0.98 } : undefined}
            className="relative overflow-hidden inline-flex items-center justify-center gap-2.5 px-8 h-[46px] rounded-full bg-[#101B3D] text-white text-[11px] font-bold tracking-[0.12em] uppercase shadow-sm hover:bg-[#182650] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Hover Shimmer Effect - Slides across on hover */}
            {!isLoading && !isSubmitted && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            )}

            {isLoading ? (
              <>
                <span className="animate-spin text-[14px]">⟳</span>
                <span className="text-[11px]">Sending...</span>
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px]">Message Sent</span>
              </>
            ) : (
              <>
                <span className="relative z-10 text-[11px]">Send Message</span>
                <Send className="relative z-10 w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

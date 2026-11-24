
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

const RequiredStar = () => (
  <span className="ml-1 inline-block text-red-500" aria-hidden="true">
    *
  </span>
);

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
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name + Last Name */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
              First Name
              <RequiredStar />
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                required
                aria-required="true"
                aria-invalid={Boolean(formErrors.firstName)}
                placeholder="Your first name"
                className={`h-[44px] w-full rounded-lg border bg-white pl-10 pr-4 text-[14px] text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
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

          {/* Last Name */}
          <div>
            <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
              Last Name
              <RequiredStar />
            </label>

            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                required
                aria-required="true"
                aria-invalid={Boolean(formErrors.lastName)}
                placeholder="Your last name"
                className={`h-[44px] w-full rounded-lg border bg-white pl-10 pr-4 text-[14px] text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
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
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
            Email Address
            <RequiredStar />
          </label>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.email)}
              placeholder="you@email.com"
              className={`h-[44px] w-full rounded-lg border bg-white pl-10 pr-4 text-[14px] text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
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
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
            Phone Number
            <RequiredStar />
          </label>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.phone)}
              placeholder="Enter your phone number"
              className={`h-[44px] w-full rounded-lg border bg-white pl-10 pr-4 text-[14px] text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
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

        {/* Subject - Optional */}
        <div>
          <label className="mb-2.5 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
            Subject
            <span className="ml-2 text-[10px] font-normal normal-case tracking-normal text-gray-400">
              (Optional)
            </span>
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
                  className={`rounded-full border px-4 py-2 text-[12px] transition-all ${
                    active
                      ? "border-[#C89B3C] bg-[#FFF9EC] font-medium text-[#16213E]"
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
          <label className="mb-2 block text-[12px] font-semibold uppercase tracking-wider text-[#172044]">
            Message
            <RequiredStar />
          </label>

          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={isLoading}
              required
              aria-required="true"
              aria-invalid={Boolean(formErrors.message)}
              rows={5}
              placeholder="Tell us how we can help"
              className={`w-full resize-none rounded-lg border bg-white py-3 pl-10 pr-4 text-[14px] text-gray-800 outline-none transition-all placeholder:text-gray-400 ${
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

        {/* Success / Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3 text-[13px] text-green-700"
            >
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-600"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="relative inline-block">
          <motion.button
            type="submit"
            disabled={isLoading || isSubmitted}
            whileHover={
              !isLoading && !isSubmitted ? { scale: 1.02 } : undefined
            }
            whileTap={!isLoading && !isSubmitted ? { scale: 0.98 } : undefined}
            className="relative inline-flex h-[46px] items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[#101B3D] px-8 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm transition-all hover:bg-[#182650] disabled:cursor-not-allowed disabled:opacity-60"
          >
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
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[11px]">Message Sent</span>
              </>
            ) : (
              <>
                <span className="relative z-10 text-[11px]">
                  Send Message
                </span>
                <Send className="relative z-10 h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

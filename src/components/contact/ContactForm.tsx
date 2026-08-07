"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";

interface ContactFormProps {
    onSubmit?: (data: any) => void;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        if (onSubmit) {
            onSubmit(formData);
        }
        // Reset after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ firstName: "", lastName: "", email: "", message: "" });
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all"
                            placeholder="John"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all"
                            placeholder="Doe"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all"
                        placeholder="you@example.com"
                        style={{ fontFamily: "'Lato', sans-serif" }}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5" style={{ fontFamily: "'Lato', sans-serif" }}>
                        Message
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FDCB00] focus:ring-1 focus:ring-[#FDCB00] transition-all resize-none"
                        placeholder="Your message here..."
                        style={{ fontFamily: "'Lato', sans-serif" }}
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-[#1a1a2e] text-white rounded-xl font-semibold hover:bg-[#16213e] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#1a1a2e]/20"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                >
                    {isSubmitted ? (
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
            </form>
        </motion.div>
    );
}
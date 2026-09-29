// components/distributor/registration/legalContent.tsx

import React from "react";
import { FileText, Shield, Users } from "lucide-react";

export type LegalType = "terms" | "agreement" | "code-of-conduct";

export interface LegalDoc {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    lastUpdated: string;
    sections: {
        heading: string;
        body: string[];
    }[];
}

export const LEGAL_DOCS: Record<LegalType, LegalDoc> = {
    terms: {
        title: "Terms of Use",
        subtitle:
            "Please read these terms carefully before using our platform.",
        icon: <FileText className="w-5 h-5" />,
        lastUpdated: "01 January 2025",
        sections: [
            {
                heading: "1. Acceptance of Terms",
                body: [
                    "By accessing or using the IndieKonnect platform, you agree to be bound by these Terms of Use and all applicable laws and regulations.",
                    "If you do not agree with any part of these terms, you must not use the platform.",
                ],
            },
            {
                heading: "2. Eligibility",
                body: [
                    "You must be at least 18 years of age to register as a distributor.",
                    "You must provide accurate, current, and complete information during registration.",
                    "You are responsible for maintaining the confidentiality of your account credentials.",
                ],
            },
            {
                heading: "3. Distributor Responsibilities",
                body: [
                    "Promote products and services in compliance with applicable laws.",
                    "Do not make false or misleading claims about the company or its products.",
                    "Maintain ethical business practices at all times.",
                    "Comply with all company policies, including the Code of Conduct.",
                ],
            },
            {
                heading: "4. Prohibited Activities",
                body: [
                    "Engaging in any fraudulent, deceptive, or unethical activity.",
                    "Spamming, unsolicited marketing, or misrepresentation.",
                    "Attempting to reverse-engineer, hack, or disrupt the platform.",
                    "Creating multiple accounts to abuse the system.",
                ],
            },
            {
                heading: "5. Termination",
                body: [
                    "We reserve the right to suspend or terminate your account at any time for violation of these terms.",
                    "Upon termination, you must immediately cease all use of the platform.",
                ],
            },
            {
                heading: "6. Limitation of Liability",
                body: [
                    "The platform is provided 'as is' without warranties of any kind.",
                    "We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.",
                ],
            },
            {
                heading: "7. Changes to Terms",
                body: [
                    "We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.",
                ],
            },
        ],
    },

    agreement: {
        title: "Distributor Agreement",
        subtitle:
            "This agreement governs your relationship with IndieKonnect as a distributor.",
        icon: <Users className="w-5 h-5" />,
        lastUpdated: "01 January 2025",
        sections: [
            {
                heading: "1. Appointment as Distributor",
                body: [
                    "Upon approval of your application, you are appointed as an independent distributor of IndieKonnect.",
                    "This is a non-exclusive, non-transferable appointment.",
                ],
            },
            {
                heading: "2. Independent Contractor Status",
                body: [
                    "You are an independent contractor and not an employee, agent, or partner of IndieKonnect.",
                    "You are responsible for your own taxes, insurance, and business expenses.",
                    "You have no authority to bind IndieKonnect to any contract or obligation.",
                ],
            },
            {
                heading: "3. Compensation Structure",
                body: [
                    "Compensation is based on the company's published compensation plan.",
                    "Payments will be made only after successful verification of your KYC and bank details.",
                    "We reserve the right to modify the compensation plan with prior notice.",
                ],
            },
            {
                heading: "4. Sales & Marketing",
                body: [
                    "You agree to market products ethically and truthfully.",
                    "You may not use the company's name, logo, or trademarks without written permission.",
                    "All marketing materials must be approved by the company.",
                ],
            },
            {
                heading: "5. Confidentiality",
                body: [
                    "You agree to keep all company trade secrets and confidential information strictly private.",
                    "This obligation survives the termination of this agreement.",
                ],
            },
            {
                heading: "6. Term & Termination",
                body: [
                    "This agreement is effective from the date of your approval and continues until terminated.",
                    "Either party may terminate with 30 days' written notice.",
                    "Immediate termination is possible for breach of this agreement.",
                ],
            },
            {
                heading: "7. Governing Law",
                body: [
                    "This agreement shall be governed by and construed in accordance with the laws of India.",
                ],
            },
        ],
    },

    "code-of-conduct": {
        title: "Code of Conduct",
        subtitle:
            "Our shared commitment to ethical, transparent, and respectful business practices.",
        icon: <Shield className="w-5 h-5" />,
        lastUpdated: "01 January 2025",
        sections: [
            {
                heading: "1. Integrity & Honesty",
                body: [
                    "Always act with integrity and honesty in all business dealings.",
                    "Do not misrepresent products, income potential, or the company.",
                ],
            },
            {
                heading: "2. Respect for Others",
                body: [
                    "Treat all distributors, customers, and employees with respect and dignity.",
                    "Harassment, discrimination, or abusive behavior will not be tolerated.",
                ],
            },
            {
                heading: "3. Compliance with Laws",
                body: [
                    "Comply with all applicable local, state, and national laws.",
                    "Do not engage in any illegal or unethical activities.",
                ],
            },
            {
                heading: "4. Product Claims",
                body: [
                    "Only make product claims that are supported by the company's official materials.",
                    "Do not make health, medical, or income claims that are not approved.",
                ],
            },
            {
                heading: "5. Customer Care",
                body: [
                    "Provide accurate information to customers.",
                    "Handle complaints promptly and professionally.",
                    "Never pressure anyone to join or purchase.",
                ],
            },
            {
                heading: "6. Anti-Spam Policy",
                body: [
                    "Do not send unsolicited emails, messages, or calls.",
                    "Respect do-not-contact requests immediately.",
                ],
            },
            {
                heading: "7. Consequences of Violation",
                body: [
                    "Violation of this Code of Conduct may result in suspension or termination of your distributorship.",
                    "The company reserves the right to take legal action where necessary.",
                ],
            },
        ],
    },
};
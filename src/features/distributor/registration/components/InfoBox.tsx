// components/distributor/registration/components/common/InfoBox.tsx

import React from "react";

interface InfoBoxProps {
    type: "info" | "success" | "warning" | "error";
    title?: string;
    children: React.ReactNode;
    icon?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
    type,
    title,
    children,
    icon,
}) => {
    const styles = {
        info: {
            bg: "bg-blue-50/80",
            border: "border-blue-100",
            text: "text-blue-700",
            icon: icon || "ℹ️",
        },
        success: {
            bg: "bg-green-50/80",
            border: "border-green-100",
            text: "text-green-700",
            icon: icon || "✅",
        },
        warning: {
            bg: "bg-yellow-50/80",
            border: "border-yellow-100",
            text: "text-yellow-700",
            icon: icon || "⚠️",
        },
        error: {
            bg: "bg-red-50/80",
            border: "border-red-100",
            text: "text-red-700",
            icon: icon || "❌",
        },
    };

    const style = styles[type];

    return (
        <div className={`${style.bg} backdrop-blur-sm p-4 rounded-xl border ${style.border} mb-2`}>
            <p className={`text-sm ${style.text} flex items-start gap-2`}>
                <span className="text-lg flex-shrink-0">{style.icon}</span>
                <span>
                    {title && <strong>{title}:</strong>} {children}
                </span>
            </p>
        </div>
    );
};
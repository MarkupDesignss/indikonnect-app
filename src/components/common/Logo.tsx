// components/common/Logo.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
    className = '',
    width = 120,
    height = 40,
    showText = true,
}) => {
    return (
        <Link href="/" className={`flex items-center gap-2 ${className}`}>
            <Image
                src="/images/logo.png"
                alt="IndieKonnect"
                width={width}
                height={height}
                className="object-contain"
                priority
            />
            {showText && (
                <span className="text-[#06101E] font-bold text-xl hidden sm:block">
                    IndieKonnect
                </span>
            )}
        </Link>
    );
};
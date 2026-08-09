// components/common/Card.tsx

import React from 'react';
import { cn } from '@/lib/utils/constants';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    title,
    description,
    noPadding = false,
}) => {
    return (
        <div className={cn(
            'bg-white shadow-xl rounded-2xl border border-gray-100',
            className
        )}>
            {(title || description) && (
                <div className="px-6 pt-6 pb-2 text-center">
                    {title && (
                        <h2 className="text-2xl font-bold text-[#06101E]">{title}</h2>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-gray-600">{description}</p>
                    )}
                </div>
            )}
            <div className={cn(!noPadding && 'p-6')}>
                {children}
            </div>
        </div>
    );
};
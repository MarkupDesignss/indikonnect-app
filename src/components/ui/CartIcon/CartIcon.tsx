'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface CartIconProps {
  count?: number;
  className?: string;
}

export function CartIcon({ count = 0, className }: CartIconProps) {
  return (
    <Link
      href="/cart"
      className={cn(
        'relative p-2 text-gray-600 hover:text-[#0A2240] transition-colors',
        className
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#FFC72C] text-[#0A2240] text-xs font-bold rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
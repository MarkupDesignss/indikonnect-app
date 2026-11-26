"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ProductDetailViewModel } from './useProductDetail';


export default function ProductBreadcrumb({ product }: Pick<ProductDetailViewModel, "product">) {
  return (
<nav className="mb-3 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] text-[#8A8A8A] sm:text-[12px]">
          <Link href="/home" className="transition hover:text-[#111]">
            Home
          </Link>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <Link href="/products" className="transition hover:text-[#111]">
            Products
          </Link>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <span className="font-medium text-[#555]">{product.category}</span>

          <ChevronRight className="h-3 w-3 flex-shrink-0 text-[#CFCFCF]" />

          <span className="max-w-[180px] truncate font-medium text-[#111]">
            {product.name}
          </span>
        </nav>
  );
}

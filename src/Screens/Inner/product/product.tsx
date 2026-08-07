import { Metadata } from "next";
import ProductGrid from "../../../components/product/ProductGrid";
import FilterSidebar from "../../../components/product/FilterSidebar";
import Newsletter from "../../../components/product/Newsletter";

export const metadata: Metadata = {
    title: "Products | Collections",
    description: "Browse our collection of premium dinnerware and accessories",
};

export default function ProductsPage(): JSX.Element {
    return (
        <div className="py-8 md:py-10">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-5 border-b border-gray-200">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        Collections
                    </h1>
                    <nav
                        className="flex items-center gap-2 text-sm text-gray-500 mt-2 sm:mt-0"
                        aria-label="Breadcrumb"
                    >
                        <span>Home</span>
                        <span className="text-gray-300">/</span>
                        <span>Products</span>
                    </nav>
                </div>

                {/* Main Layout */}
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8">
                    <FilterSidebar />
                    <ProductGrid />
                </div>

                <Newsletter />
            </div>
        </div>
    );
}

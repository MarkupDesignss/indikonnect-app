'use client';

import { useState, useMemo } from 'react';
import ProductCard from '../product/ProductCard';
import { products } from '../../data/products';
import { Product } from '../../Screens/types/product';

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'newest';

export default function ProductGrid(): JSX.Element {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<SortOption>('recommended');
    const productsPerPage: number = 12;

    // Use useMemo to prevent unnecessary recalculations
    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);
            default:
                return sorted;
        }
    }, [sortBy]);

    // Pagination calculations
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts: Product[] = sortedProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const totalPages: number = Math.ceil(sortedProducts.length / productsPerPage);

    const handlePageChange = (page: number): void => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        setSortBy(e.target.value as SortOption);
        setCurrentPage(1);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                <div className="text-sm text-gray-600">
                    Showing {indexOfFirstProduct + 1}-
                    {Math.min(indexOfLastProduct, sortedProducts.length)} of{' '}
                    {sortedProducts.length} Products
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-sm text-gray-600">
                        Sort By:
                    </label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        <option value="recommended">Recommended</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
            </div>

            {/* Products Grid */}
            {currentProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No products found</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentProducts.map((product: Product) => (
                        <ProductCard key={product.id} productId={product.id} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mt-8 pt-5">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        Previous
                    </button>
                    <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                            let page = i + 1;
                            // Show pages around current page
                            if (totalPages > 10) {
                                if (currentPage <= 5) {
                                    page = i + 1;
                                } else if (currentPage >= totalPages - 4) {
                                    page = totalPages - 9 + i;
                                } else {
                                    page = currentPage - 4 + i;
                                }
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 border border-gray-300 rounded text-sm cursor-pointer transition-all ${currentPage === page
                                            ? 'bg-gray-800 text-white border-gray-800'
                                            : 'bg-white hover:bg-gray-100'
                                        }`}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white border border-gray-300 rounded text-sm cursor-pointer transition-all hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
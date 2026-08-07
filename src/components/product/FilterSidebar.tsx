"use client";

import { useState, useCallback } from "react";
import { FilterState } from "../../Screens/types/product";

const CATEGORIES: string[] = [
  "All Collection",
  "Watch",
  "Dinnerware",
  "Business Tools",
];

export default function FilterSidebar(): JSX.Element {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [1000, 5100],
    availability: {
      inStock: false,
      outOfStock: false,
    },
  });

  const handleCategoryChange = useCallback((category: string): void => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const handlePriceChange = useCallback(
    (index: number, value: number): void => {
      setFilters((prev) => {
        const newRange: [number, number] = [...prev.priceRange] as [
          number,
          number,
        ];
        newRange[index] = value;
        return { ...prev, priceRange: newRange };
      });
    },
    [],
  );

  const handleAvailabilityChange = useCallback(
    (type: keyof FilterState["availability"]): void => {
      setFilters((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [type]: !prev.availability[type],
        },
      }));
    },
    [],
  );

  const clearFilters = useCallback((): void => {
    setFilters({
      categories: [],
      priceRange: [1000, 5100],
      availability: {
        inStock: false,
        outOfStock: false,
      },
    });
  }, []);

  const getFilterCount = (): number => {
    return (
      filters.categories.length +
      Object.values(filters.availability).filter((v) => v).length
    );
  };

  return (
    <aside
      className="bg-white p-5 rounded-lg shadow-sm h-fit md:sticky md:top-5"
      aria-label="Product filters"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-semibold">FILTERS ({getFilterCount()})</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-800 hover:underline transition-colors"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6 pb-5 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">CATEGORIES</h4>
        <div
          className="flex flex-col gap-2.5"
          role="group"
          aria-label="Category filters"
        >
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2.5 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => handleCategoryChange(category)}
                className="w-4 h-4 cursor-pointer"
                aria-label={`Filter by ${category}`}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6 pb-5 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">PRICE</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePriceChange(0, Number(e.target.value))
              }
              className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              min="0"
              aria-label="Minimum price"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePriceChange(1, Number(e.target.value))
              }
              className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              min="0"
              aria-label="Maximum price"
            />
          </div>
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="6000"
              value={filters.priceRange[0]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePriceChange(0, Number(e.target.value))
              }
              className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              aria-label="Minimum price slider"
            />
            <input
              type="range"
              min="0"
              max="6000"
              value={filters.priceRange[1]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handlePriceChange(1, Number(e.target.value))
              }
              className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              aria-label="Maximum price slider"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-3">
          AVAILABILITY
        </h4>
        <div
          className="flex flex-col gap-2.5"
          role="group"
          aria-label="Availability filters"
        >
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.availability.inStock}
              onChange={() => handleAvailabilityChange("inStock")}
              className="w-4 h-4 cursor-pointer"
              aria-label="Filter by in stock items"
            />
            <span>In Stock</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.availability.outOfStock}
              onChange={() => handleAvailabilityChange("outOfStock")}
              className="w-4 h-4 cursor-pointer"
              aria-label="Filter by out of stock items"
            />
            <span>Out Of Stock</span>
          </label>
        </div>
      </div>

      <button
        className="w-full py-3 bg-gray-800 text-white rounded text-sm font-semibold hover:bg-gray-700 transition-colors"
        aria-label="Apply all filters"
      >
        Apply Filters
      </button>
    </aside>
  );
}

'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="pt-24 pb-16">
                <div className="container-custom">
                    <h1 className="text-4xl font-bold text-[#0A2240] mb-8">Shop</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Product cards would go here */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                            <h3 className="font-semibold text-[#0A2240]">Product Name</h3>
                            <p className="text-gray-600 text-sm mt-1">$99.99</p>
                            <Button className="w-full mt-4 bg-[#0A2240] hover:bg-[#1a3250]">
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
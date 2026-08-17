import { Suspense } from "react";
import Profile from "./profile";

// Loading fallback component
function ProfileLoading() {
    return (
        <div className="min-h-screen bg-[#FBF8F2]">
            <div className="relative w-full h-[160px] md:h-[220px] lg:h-[280px] overflow-hidden bg-gray-300 animate-pulse"></div>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(43,36,32,0.06)] border border-[#E7DBC0]/40 animate-pulse">
                            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                    </div>
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-gradient-to-r from-[#1a1a2e]/5 to-transparent rounded-2xl p-6 border border-[#FDCB00]/20 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
                                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto mt-3"></div>
                                    <div className="h-8 w-16 bg-gray-200 rounded mx-auto mt-2"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                            <div className="h-20 w-full bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <Profile />
        </Suspense>
    );
}
"use client";

import {
    ShoppingBag,
    TrendingUp,
    Layers,
    Link2,
    Network,
    DollarSign,
    CircleDollarSign,
    Coins,
    ChevronDown,
    Award,
    GitBranch,
} from "lucide-react";
import { useState } from "react";

interface TrackingDashboardProps {
    variant?: "cv" | "commission";
}

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const INDIGO = "#3955A6";

const STAT_CARDS = [
    { label: "Retail profit", icon: ShoppingBag, color: INDIGO, bg: "#eceffb" },
    { label: "Floating retail profit", icon: TrendingUp, color: BRASS, bg: "#f8f1e4" },
    { label: "Total paired CV", icon: Layers, color: NAVY, bg: "#eceefb" },
    { label: "Pairing commission", icon: Link2, color: "#c0392b", bg: "#fbeceb" },
    { label: "Unilevel commission", icon: Network, color: INDIGO, bg: "#eceffb" },
    { label: "Green coin earned", icon: DollarSign, color: EMERALD, bg: "#eaf7f0" },
    { label: "Yellow coin earned", icon: CircleDollarSign, color: BRASS, bg: "#f8f1e4" },
];

const FontImport = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
    /* In production, prefer next/font/google over a runtime @import for this. */
  `}</style>
);

// ---------- Premium 3D-style donut chart ----------
const DonutChart = ({
    segments,
    total,
}: {
    segments: { label: string; value: number; color: string }[];
    total: number;
}) => {
    const size = 200;
    const stroke = 26;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    // If there's no real data yet, split evenly so the ring still reads as a chart.
    const hasData = total > 0;
    const shares = hasData
        ? segments.map((s) => s.value / total)
        : segments.map(() => 1 / segments.length);

    let offsetAcc = 0;

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <defs>
                    <filter id="donutShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0E1B3D" floodOpacity="0.18" />
                    </filter>
                    {segments.map((s, i) => (
                        <linearGradient key={s.label} id={`segGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={s.color} stopOpacity="1" />
                            <stop offset="100%" stopColor={s.color} stopOpacity="0.72" />
                        </linearGradient>
                    ))}
                    <radialGradient id="donutInset" cx="50%" cy="45%" r="65%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#f7f8fa" />
                    </radialGradient>
                </defs>

                {/* Track */}
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef0f4" strokeWidth={stroke} />

                {/* Segments */}
                {segments.map((s, i) => {
                    const dash = shares[i] * circumference;
                    const gap = circumference - dash;
                    const dashOffset = -offsetAcc;
                    offsetAcc += dash;
                    return (
                        <circle
                            key={s.label}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={`url(#segGrad-${i})`}
                            strokeWidth={stroke}
                            strokeDasharray={`${dash} ${gap}`}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            filter="url(#donutShadow)"
                        />
                    );
                })}

                {/* Inset center */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius - stroke / 2 - 6}
                    fill="url(#donutInset)"
                    filter="url(#donutShadow)"
                />
            </svg>

            {/* Centered label (not rotated) */}
            <div className="pointer-events-none relative -mt-[124px] flex h-[200px] w-[200px] flex-col items-center justify-center">
                <p className="text-[30px] font-black text-[#101828]">{total}</p>
                <p className="text-[11.5px] font-semibold text-[#8a92a6]">Total</p>
            </div>
        </div>
    );
};

// ---------- Gradient area / line chart ----------
const WeeklyTrendChart = () => {
    const points = [
        { x: 10, y: 120, day: "Mon" },
        { x: 58, y: 112, day: "Tue" },
        { x: 106, y: 116, day: "Wed" },
        { x: 154, y: 78, day: "Thu" },
        { x: 200, y: 92, day: "Fri", highlight: true },
        { x: 248, y: 64, day: "Sat" },
        { x: 290, y: 30, day: "Sun" },
    ];

    const linePath = `M ${points.map((p) => `${p.x} ${p.y}`).join(" L ")}`;
    const areaPath = `${linePath} L 290 150 L 10 150 Z`;

    return (
        <div className="relative mt-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
                {[50, 40, 30, 20, 10].map((val) => (
                    <div key={val} className="flex items-center gap-2">
                        <span className="w-5 text-right text-[10px] text-[#c1c6d0]">{val}</span>
                        <div className="h-[1px] flex-1 bg-[#f0f2f5]" />
                    </div>
                ))}
            </div>

            <svg viewBox="0 0 300 150" className="relative h-[150px] w-full" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={NAVY} stopOpacity="0.28" />
                        <stop offset="100%" stopColor={NAVY} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={INDIGO} />
                        <stop offset="100%" stopColor={NAVY} />
                    </linearGradient>
                    <filter id="dotShadow" x="-100%" y="-100%" width="300%" height="300%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0E1B3D" floodOpacity="0.35" />
                    </filter>
                </defs>

                <path d={areaPath} fill="url(#trendFill)" />
                <path d={linePath} fill="none" stroke="url(#trendStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {points.map((p) => (
                    <circle
                        key={p.day}
                        cx={p.x}
                        cy={p.y}
                        r={p.highlight ? 4.5 : 3.5}
                        fill="white"
                        stroke={p.highlight ? BRASS : NAVY}
                        strokeWidth="2"
                        filter="url(#dotShadow)"
                    />
                ))}

                {/* Highlight tooltip */}
                <g>
                    <line x1="200" y1="0" x2="200" y2="130" stroke={BRASS} strokeDasharray="3 4" strokeWidth="1" />
                    <rect x="182" y="0" width="36" height="26" rx="6" fill={NAVY} />
                    <text x="200" y="10" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                        Fri
                    </text>
                    <text x="200" y="21" textAnchor="middle" fill="white" fontSize="9">
                        0
                    </text>
                </g>
            </svg>

            <div className="mt-2 flex justify-between text-[11px] font-medium text-[#98a2b3]">
                {points.map((p) => (
                    <span key={p.day}>{p.day}</span>
                ))}
            </div>
        </div>
    );
};

const TrackingDashboard = ({ variant = "cv" }: TrackingDashboardProps) => {
    const [selectedWeek, setSelectedWeek] = useState("Week 34 (22 Aug – 28 Aug 2026)");

    const commissionBreakdown = [
        { label: "Pairing commission", value: 0, color: NAVY },
        { label: "Retail profit", value: 0, color: INDIGO },
        { label: "Unilevel commission", value: 0, color: BRASS },
    ];
    const commissionTotal = commissionBreakdown.reduce((sum, s) => sum + s.value, 0);

    return (
        <div style={{ fontFamily: "'Lato', sans-serif" }} className="space-y-6">
            <FontImport />

            {/* ================= HEADER ================= */}
            <h1 className="text-[24px] font-black tracking-[-0.01em] text-[#101828]">Dashboard</h1>

            {/* ================= TOP STATS CARDS ================= */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {STAT_CARDS.map(({ label, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="flex h-[84px] items-center gap-4 rounded-[14px] border border-[#e7e9ee] bg-white p-4 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: bg }}>
                            <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold text-[#667085]">{label}</p>
                            <p className="mt-1 text-[19px] font-black text-[#101828]">0</p>
                        </div>
                    </div>
                ))}

                {variant === "cv" && (
                    <div className="flex h-[84px] items-center gap-4 rounded-[14px] border border-[#e7e9ee] bg-white p-4 transition-shadow hover:shadow-[0_8px_20px_-12px_rgba(16,24,40,0.15)]">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#eceffb" }}>
                            <Coins className="h-5 w-5" style={{ color: INDIGO }} />
                        </div>
                        <div>
                            <p className="text-[12px] font-semibold text-[#667085]">Blue coin earned</p>
                            <p className="mt-1 text-[19px] font-black text-[#101828]">0</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ================= TRACKING CENTER ================= */}
            <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                <h2 className="text-[18px] font-bold text-[#101828]">Tracking center</h2>

                <div className="mt-5 grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">TC account</label>
                        <div className="relative">
                            <select className="h-[44px] w-full appearance-none rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 text-[14px] text-[#101828] outline-none transition-colors focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10">
                                <option>TC-001</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">Week</label>
                        <div className="relative">
                            <select
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="h-[44px] w-full appearance-none rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 text-[14px] text-[#101828] outline-none transition-colors focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
                            >
                                <option>Week 34 (22 Aug – 28 Aug 2026)</option>
                                <option>Week 33 (15 Aug – 21 Aug 2026)</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[13px] font-semibold text-[#5a6276]">Year</label>
                        <div className="relative">
                            <select className="h-[44px] w-full appearance-none rounded-[10px] border border-[#e5e9ef] bg-[#f7f8fa] px-4 text-[14px] text-[#101828] outline-none transition-colors focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10">
                                <option>2026</option>
                                <option>2025</option>
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
                        </div>
                    </div>

                    <button
                        className="h-[44px] rounded-[10px] px-8 text-[14px] font-semibold text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                    >
                        {variant === "cv" ? "Search" : "Show CV"}
                    </button>
                </div>
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_400px]">
                {/* ================= LEFT COLUMN ================= */}
                <div className="space-y-6">
                    {/* TC-001 Data Card */}
                    <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#101828]">TC-001</h3>
                            <span className="rounded-full bg-[#f2f4f7] px-3 py-1 text-[12px] font-semibold text-[#667085]">
                                AIA60352S9-001
                            </span>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <div className="border-r border-[#e7e9ee] pr-8">
                                <p className="text-[13px] font-semibold text-[#667085]">Left</p>
                                <p className="mt-1 text-[32px] font-black" style={{ color: INDIGO }}>
                                    630
                                </p>
                            </div>
                            <div className="pl-8">
                                <p className="text-[13px] font-semibold text-[#667085]">Right</p>
                                <p className="mt-1 text-[32px] font-black" style={{ color: INDIGO }}>
                                    1680
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-[13px] font-semibold text-[#667085]">Carry forward</p>
                            <div className="mt-2 flex gap-12">
                                <span className="text-[16px] font-bold text-[#101828]">10390</span>
                                <span className="text-[16px] font-bold text-[#101828]">1325</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#e7e9ee] pt-4 sm:grid-cols-4">
                            <div>
                                <p className="text-[12px] font-semibold text-[#667085]">Paired CV</p>
                                <p className="mt-1 text-[14px] font-bold text-[#101828]">0</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold text-[#667085]">Pairing commission</p>
                                <p className="mt-1 text-[14px] font-bold text-[#101828]">0</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold" style={{ color: EMERALD }}>
                                    Green coins
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#101828]">0</p>
                            </div>
                            <div>
                                <p className="text-[12px] font-semibold" style={{ color: BRASS }}>
                                    Yellow coins
                                </p>
                                <p className="mt-1 text-[14px] font-bold text-[#101828]">0</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Left Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Weekly Trend */}
                        <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-[#101828]">Weekly trend</h3>
                                <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: NAVY }}>
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: NAVY }} />
                                    This week
                                </span>
                            </div>
                            <WeeklyTrendChart />
                        </div>

                        {/* Rank / My Tree */}
                        <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-[#101828]">{variant === "cv" ? "Rank" : "My tree"}</h3>
                                <button className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: NAVY }}>
                                    View rank benefits {variant === "commission" && <span>→</span>}
                                </button>
                            </div>

                            {variant === "cv" ? (
                                <div className="mt-8 flex flex-col items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "#f8f1e4" }}>
                                        <Award className="h-8 w-8" style={{ color: BRASS }} />
                                    </div>
                                    <p className="mt-4 text-[18px] font-bold text-[#101828]">No rank yet</p>
                                </div>
                            ) : (
                                <div className="mt-6">
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#667085]">Total directs</p>
                                            <p className="mt-1 text-[20px] font-black text-[#101828]">0</p>
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-semibold text-[#667085]">Total downline</p>
                                            <p className="mt-1 text-[20px] font-black text-[#101828]">0</p>
                                        </div>
                                    </div>
                                    <button
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-3 text-[13px] font-semibold text-white transition-colors"
                                        style={{ backgroundColor: NAVY }}
                                    >
                                        <GitBranch size={16} />
                                        View genealogy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
                    <h3 className="text-[17px] font-bold text-[#101828]">Commission breakdown</h3>

                    <div className="mt-6 flex items-center justify-center">
                        <DonutChart segments={commissionBreakdown} total={commissionTotal} />
                    </div>

                    <div className="mt-2 flex flex-wrap justify-center gap-4">
                        {commissionBreakdown.map((s) => (
                            <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#667085]">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.label}
                            </span>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-[#e7e9ee] pt-4">
                        <div className="flex justify-between pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
                            <span>Commission type</span>
                            <span>This week</span>
                        </div>
                        {commissionBreakdown.map((s) => (
                            <div key={s.label} className="flex justify-between border-b border-[#f0f2f5] py-3 text-[13px] text-[#475066]">
                                <span className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    {s.label}
                                </span>
                                <span className="font-semibold text-[#101828]">{s.value}</span>
                            </div>
                        ))}

                        <div
                            className="mt-4 flex items-center justify-between rounded-[10px] px-4 py-3"
                            style={{ backgroundColor: NAVY }}
                        >
                            <span className="text-[14px] font-bold text-white">Total</span>
                            <span className="text-[14px] font-bold text-white">{commissionTotal}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingDashboard;
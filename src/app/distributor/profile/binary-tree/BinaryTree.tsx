"use client";

import {
    Users,
    UserCheck,
    UserX,
    BarChart3,
    MoveHorizontal,
    ChevronDown,
    RefreshCw,
    Minimize2,
    Maximize2,
    Fullscreen,
} from "lucide-react";
import { useState } from "react";

const BinaryTree = () => {
    const [invertScroll, setInvertScroll] = useState(false);

    return (
        <div className="rounded-[12px] border border-[#edf0f3] bg-white p-[20px] shadow-sm">
            {/* ================= HEADER ================= */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1a2332]">
                        <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-[20px] font-bold text-[#1a2332]">Binary Tree</h1>
                        <p className="text-[13px] text-[#8a92a6]">
                            Visualize your downline structure and team hierarchy
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-[#5a6276]">MY TCs</span>
                    <button className="flex h-[38px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-4 text-[13px] text-[#1a2332]">
                        TC-001
                        <ChevronDown size={14} className="text-[#8a92a6]" />
                    </button>

                    <button className="flex h-[38px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-4 text-[13px] text-[#1a2332]">
                        +
                    </button>
                    <span className="text-[13px] font-medium text-[#5a6276]">80%</span>
                    <button className="flex h-[38px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-4 text-[13px] text-[#1a2332]">
                        +
                    </button>

                    <button className="flex h-[38px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-4 text-[13px] text-[#5a6276] hover:bg-[#f5f6fa]">
                        <RefreshCw size={14} />
                        Reset
                    </button>

                    <div className="flex h-[38px] items-center gap-2 rounded-[6px] border border-[#e5e9ef] bg-white px-4">
                        <button
                            onClick={() => setInvertScroll(!invertScroll)}
                            className={`relative h-5 w-10 rounded-full transition-all ${invertScroll ? "bg-[#1a2332]" : "bg-[#e5e9ef]"
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${invertScroll ? "left-5" : "left-0.5"
                                    }`}
                            />
                        </button>
                        <span className="text-[13px] font-medium text-[#1a2332]">
                            Invert Scroll
                        </span>
                    </div>
                    <span className="text-[13px] font-medium text-[#5a6276]">My Tree</span>
                </div>
            </div>

            {/* ================= STATS CARDS ================= */}
            <div className="mt-6 flex gap-4">
                {/* Total Members */}
                <div className="flex flex-1 items-center gap-4 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ff]">
                        <Users className="h-5 w-5 text-[#3c78e9]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Total Members</p>
                        <p className="mt-1 text-[20px] font-bold text-[#3c78e9]">15</p>
                    </div>
                </div>

                {/* Active Members */}
                <div className="flex flex-1 items-center gap-4 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                        <UserCheck className="h-5 w-5 text-[#17b963]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Active Members</p>
                        <p className="mt-1 text-[20px] font-bold text-[#17b963]">13</p>
                    </div>
                </div>

                {/* Inactive Members */}
                <div className="flex flex-1 items-center gap-4 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e0]">
                        <UserX className="h-5 w-5 text-[#e3aa00]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Inactive Members</p>
                        <p className="mt-1 text-[20px] font-bold text-[#e3aa00]">2</p>
                    </div>
                </div>

                {/* Levels */}
                <div className="flex flex-1 items-center gap-4 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e8ff]">
                        <BarChart3 className="h-5 w-5 text-[#a855f7]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Levels</p>
                        <p className="mt-1 text-[20px] font-bold text-[#a855f7]">4</p>
                    </div>
                </div>

                {/* Total Width */}
                <div className="flex flex-1 items-center gap-4 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4e0]">
                        <MoveHorizontal className="h-5 w-5 text-[#e3aa00]" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-[#5a6276]">Total Width</p>
                        <p className="mt-1 text-[20px] font-bold text-[#e3aa00]">8</p>
                    </div>
                </div>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="mt-8 flex gap-6">
                {/* Left Levels Panel */}
                <div className="w-[200px] shrink-0 rounded-[12px] border border-[#edf0f3] bg-white p-4">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#1a2332]">
                        LEVELS
                    </h3>
                    <div className="mt-4 space-y-3">
                        {[
                            { label: "Level 1", color: "#a855f7", bg: "#f3e8ff" },
                            { label: "Level 2", color: "#3c78e9", bg: "#edf3ff" },
                            { label: "Level 3", color: "#17b963", bg: "#e8faef" },
                            { label: "Level 4", color: "#f97316", bg: "#fff4e0" },
                        ].map((level) => (
                            <div key={level.label} className="flex items-center gap-2">
                                <span
                                    className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                                    style={{ backgroundColor: level.color }}
                                >
                                    {level.label.split(" ")[1]}
                                </span>
                                <span className="text-[13px] font-medium text-[#5a6276]">
                                    {level.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tree Structure */}
                <div className="min-h-[500px] flex-1 overflow-x-auto rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-8">
                    <div className="flex min-w-[800px] flex-col items-center">
                        {/* Root Node */}
                        <div className="relative">
                            <div className="flex w-[300px] flex-col items-center rounded-[12px] border border-[#3c78e9] bg-white p-4 shadow-sm">
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8faef]">
                                            <Users className="h-6 w-6 text-[#1a2332]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[#8a92a6]">AIA182931-001</p>
                                            <p className="text-[14px] font-bold text-[#1a2332]">Jakies Chan</p>
                                        </div>
                                    </div>
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2332]">
                                        <span className="text-[14px] text-white">★</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <span className="rounded-full bg-[#f0f4ff] px-3 py-1 text-[11px] font-medium text-[#1a2332]">
                                        HEAD
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Connector Line */}
                        <div className="h-[60px] w-[2px] bg-[#3c78e9]" />
                        <div className="h-[2px] w-[500px] bg-[#3c78e9]" />
                        <div className="flex w-[500px] justify-between">
                            <div className="h-[40px] w-[2px] bg-[#3c78e9]" />
                            <div className="h-[40px] w-[2px] bg-[#3c78e9]" />
                        </div>

                        {/* Children Nodes */}
                        <div className="mt-2 flex w-full justify-center gap-10">
                            {/* Left Leg */}
                            <div className="flex w-[240px] flex-col items-center rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                                <div className="flex w-full items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                                        <Users className="h-5 w-5 text-[#1a2332]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8a92a6]">AIA182931-001</p>
                                        <p className="text-[13px] font-bold text-[#1a2332]">Jakies Chan</p>
                                    </div>
                                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded bg-[#17b963] text-[11px] font-bold text-white">
                                        ★
                                    </span>
                                </div>
                                <p className="mt-2 w-full text-left text-[10px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                                    LEFT LEG
                                </p>
                                <span className="mt-2 rounded-full bg-[#e8faef] px-3 py-1 text-[10px] font-semibold text-[#17b963]">
                                    Active
                                </span>
                            </div>

                            {/* Right Leg */}
                            <div className="flex w-[240px] flex-col items-center rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                                <div className="flex w-full items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8faef]">
                                        <Users className="h-5 w-5 text-[#1a2332]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-[#8a92a6]">AIA182931-001</p>
                                        <p className="text-[13px] font-bold text-[#1a2332]">Jakies Chan</p>
                                    </div>
                                    <span className="ml-auto flex h-6 w-6 items-center justify-center rounded bg-[#17b963] text-[11px] font-bold text-white">
                                        ★
                                    </span>
                                </div>
                                <p className="mt-2 w-full text-left text-[10px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                                    RIGHT LEG
                                </p>
                                <span className="mt-2 rounded-full bg-[#e8faef] px-3 py-1 text-[10px] font-semibold text-[#17b963]">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= BOTTOM CONTROLS ================= */}
            <div className="mt-6 flex items-center gap-3 rounded-[12px] border border-[#edf0f3] bg-[#fafcff] p-4">
                <button className="flex items-center gap-2 text-[13px] font-medium text-[#1a2332] hover:text-[#3964FE]">
                    <Maximize2 size={16} />
                    Expand ALL
                </button>
                <button className="flex items-center gap-2 text-[13px] font-medium text-[#1a2332] hover:text-[#3964FE]">
                    <Minimize2 size={16} />
                    Collapse All
                </button>
                <button className="flex items-center gap-2 text-[13px] font-medium text-[#1a2332] hover:text-[#3964FE]">
                    <Fullscreen size={16} />
                    Fit to View
                </button>

                <div className="mx-4 h-6 w-[1px] bg-[#e5e9ef]" />

                {/* Legend */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#17b963]" />
                        <span className="text-[12px] text-[#5a6276]">Activated</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#f97316]" />
                        <span className="text-[12px] text-[#5a6276]">Deactivated</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BinaryTree;
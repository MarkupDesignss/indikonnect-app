"use client";

import {
    Maximize2,
    Minimize2,
    Scan,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState } from "react";

const NAVY = "#0E1B3D";
const BRASS = "#B8935A";
const EMERALD = "#1f9d6b";
const AMBER = "#d97706";

const nodeData = [
    {
        id: "AIA182931-001",
        name: "Saurabh Kainth",
        status: "Silver Activated",
        total: { left: 0, right: 0 },
        carryForward: { left: 0, right: 0 },
        thisWeek: { left: 0, right: 0 },
        isRoot: true,
    },
    {
        id: "AIA182931-002",
        name: "Ravi Mehta",
        status: "Silver Activated",
        total: { left: 0, right: 0 },
        carryForward: { left: 0, right: 0 },
        thisWeek: { left: 0, right: 0 },
    },
    {
        id: "AIA182931-003",
        name: "Priya Nair",
        status: "Deactivated",
        total: { left: 0, right: 0 },
        carryForward: { left: 0, right: 0 },
        thisWeek: { left: 0, right: 0 },
    },
];

const initials = (name) =>
    name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

const StatRow = ({ label, left, right }) => (
    <div className="flex items-center justify-between py-1.5">
        <span className="text-[11.5px] text-[#8a92a6]">{label}</span>
        <div className="flex items-center gap-4">
            <span className="w-8 text-right text-[13px] font-bold text-[#101828]">{left}</span>
            <span className="w-8 text-right text-[13px] font-bold text-[#101828]">{right}</span>
        </div>
    </div>
);

const TreeNode = ({ node }) => {
    const isActive = !node.status.toLowerCase().includes("deactivat");
    const statusColor = isActive ? EMERALD : AMBER;
    const statusBg = isActive ? "#eaf7f0" : "#fdf1e2";

    return (
        <div
            className={[
                "w-[300px] rounded-[16px] border bg-white p-4 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(14,27,61,0.25)]",
                node.isRoot ? "border-[#0E1B3D]/25 shadow-[0_1px_2px_rgba(16,24,40,0.04)]" : "border-[#e7e9ee]",
            ].join(" ")}
        >
            <div className="flex items-center gap-3">
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                    style={{ backgroundColor: node.isRoot ? NAVY : BRASS }}
                >
                    {initials(node.name)}
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-bold text-[#101828]">{node.name}</p>
                    <p className="text-[11px] text-[#98a2b3]">{node.id}</p>
                </div>
            </div>

            <span
                className="mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: statusColor, backgroundColor: statusBg }}
            >
                {node.status}
            </span>

            <div className="mt-3 flex items-center justify-end gap-4 border-b border-[#edf0f4] pb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[#c1c6d0]">
                <span className="w-8 text-right">Left</span>
                <span className="w-8 text-right">Right</span>
            </div>
            <div className="divide-y divide-[#f2f4f7]">
                <StatRow label="Total" left={node.total.left} right={node.total.right} />
                <StatRow label="Carry forward" left={node.carryForward.left} right={node.carryForward.right} />
                <StatRow label="This week" left={node.thisWeek.left} right={node.thisWeek.right} />
            </div>
        </div>
    );
};

const ToolbarButton = ({ icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-[8px] px-3 py-2 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]"
    >
        <Icon size={15} />
        {label}
    </button>
);

const BinaryTreeV2 = () => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div
            style={{ fontFamily: "'Lato', sans-serif" }}
            className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
            `}</style>

            {/* ================= HEADER ================= */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-[19px] font-black tracking-[-0.01em] text-[#101828]">Binary tree</h1>

                <div className="flex items-center gap-1 rounded-[10px] border border-[#e7e9ee] bg-[#f7f8fa] p-1">
                    <ToolbarButton icon={Maximize2} label="Expand all" onClick={() => setExpanded(true)} />
                    <ToolbarButton icon={Minimize2} label="Collapse all" onClick={() => setExpanded(false)} />
                    <ToolbarButton icon={Scan} label="Fit to view" />
                </div>
            </div>

            {/* ================= TREE STRUCTURE ================= */}
            <div className="mt-8 flex min-h-[420px] flex-col items-center overflow-x-auto pb-4">
                <TreeNode node={nodeData[0]} />

                {expanded && (
                    <>
                        {/* Connector lines */}
                        <div className="relative h-[48px] w-[480px]">
                            <div className="absolute left-1/2 top-0 h-[24px] w-[2px] -translate-x-1/2 bg-[#0E1B3D]/25" />
                            <div className="absolute left-[22%] right-[22%] top-[24px] h-[2px] bg-[#0E1B3D]/25" />
                            <div className="absolute left-[22%] top-[24px] h-[24px] w-[2px] bg-[#0E1B3D]/25" />
                            <div className="absolute right-[22%] top-[24px] h-[24px] w-[2px] bg-[#0E1B3D]/25" />
                        </div>

                        {/* Children */}
                        <div className="flex w-full flex-wrap justify-center gap-8">
                            <TreeNode node={nodeData[1]} />
                            <TreeNode node={nodeData[2]} />
                        </div>
                    </>
                )}

                {!expanded && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0E1B3D] hover:underline"
                    >
                        <ChevronDown size={14} />
                        Show 2 downline members
                    </button>
                )}
            </div>

            {/* ================= LEGEND ================= */}
            <div className="mt-4 flex flex-wrap items-center gap-5 rounded-[12px] border border-[#e7e9ee] bg-[#f7f8fa] px-4 py-3">
                <span className="text-[12px] font-semibold text-[#667085]">Status</span>
                <span className="flex items-center gap-2 text-[12px] text-[#344054]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EMERALD }} />
                    Activated
                </span>
                <span className="flex items-center gap-2 text-[12px] text-[#344054]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
                    Deactivated
                </span>
            </div>
        </div>
    );
};

export default BinaryTreeV2;
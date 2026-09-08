"use client";

import {
    BarChart3,
    ChevronDown,
    GitBranch,
    LayoutDashboard,
    Percent,
    ReceiptText,
    UserRound,
    UsersRound,
    WalletCards,
    User,
    Calendar,
    Award,
    Network,
    Share2,
    BadgeDollarSign,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/distributor/dashboard" },
    {
        label: "Profile", icon: UserRound, dropdown: true, href: "/distributor/profile", children: [
            { label: "Weekly Commission", icon: User, href: "/distributor/profile/weekly-commission" },
            { label: "Weekly CV DATE", icon: Calendar, href: "/distributor/profile/weekly-cv-date" },
            { label: "Rank Information", icon: Award, href: "/distributor/profile/rank-information" },
            { label: "Binary Tree", icon: Network, href: "/distributor/profile/binary-tree" },
            { label: "CV Allocation", icon: BadgeDollarSign, href: "/distributor/profile/cv-allocation" },
            { label: "Sponsored", icon: Share2, href: "/distributor/profile/sponsored" },
        ]
    },
    { label: "Wallet", icon: WalletCards, dropdown: true, href: "/distributor/wallet" },
    { label: "Accounts", icon: UsersRound, href: "/distributor/accounts" },
    { label: "My Referral", icon: GitBranch, href: "/distributor/my-referral" },
    { label: "Transactions", icon: ReceiptText, dropdown: true, href: "/distributor/transactions" },
    { label: "Order History", icon: ReceiptText, href: "/distributor/order-history" },
    { label: "Binary Tree", icon: GitBranch, href: "#" },
    { label: "Sponsor Tree", icon: UsersRound, href: "#" },
    { label: "Commission", icon: Percent, href: "/distributor/commissions" },
    { label: "Downline CV Report", icon: BarChart3, href: "#" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

    const toggleDropdown = (label: string) => {
        setOpenDropdowns((prev) =>
            prev.includes(label)
                ? prev.filter((item) => item !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === "#") return false;
        if (href === "/distributor/dashboard") return pathname === "/distributor/dashboard";
        return pathname === href || pathname?.startsWith(href + "/");
    };

    const isParentActive = (item: any) => {
        if (item.href !== "#" && isActive(item.href)) return true;
        if (item.children) {
            return item.children.some((child: any) => isActive(child.href));
        }
        return false;
    };

    return (
        <aside className="relative flex h-full w-[280px] shrink-0 flex-col border-r border-[#e9edf2] bg-white">
            <div className="flex-1 overflow-y-auto px-5 pt-6">
                <div className="flex items-center gap-3 border-b border-[#e9edf2] pb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3964FE] shadow-md shadow-[#3964FE]/30">
                        <LayoutDashboard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-wide text-[#1a2332]">Indie Konnect</h2>
                        <p className="text-[11px] tracking-wider text-[#8a92a6]">DASHBOARD</p>
                    </div>
                </div>

                <nav className="mt-5 space-y-1 pb-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        const parentActive = isParentActive(item);

                        return (
                            <div key={item.label}>
                                {item.dropdown && item.children ? (
                                    <>
                                        <button
                                            onClick={() => toggleDropdown(item.label)}
                                            className={`group relative flex h-12 w-full items-center rounded-xl px-3 text-left transition-all duration-200 ${parentActive
                                                ? "bg-[#3964FE] text-white shadow-lg shadow-[#3964FE]/30"
                                                : "text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE]"
                                                }`}
                                        >
                                            {parentActive && (
                                                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                                            )}
                                            <Icon size={20} strokeWidth={1.7} className={`mr-3 shrink-0 transition-all ${parentActive ? "text-white" : "text-[#8a92a6] group-hover:text-[#3964FE]"}`} />
                                            <span className={`text-sm font-medium ${parentActive ? "text-white" : "text-[#5a6276] group-hover:text-[#3964FE]"}`}>
                                                {item.label}
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                strokeWidth={2}
                                                className={`ml-auto transition-transform ${openDropdowns.includes(item.label) ? "rotate-180" : ""} ${parentActive ? "text-white" : "text-[#b0b8c8] group-hover:text-[#3964FE]"}`}
                                            />
                                        </button>

                                        {openDropdowns.includes(item.label) && (
                                            <div className="mt-1 space-y-1 border-l-2 border-[#e9edf2] pl-4 ml-4">
                                                {item.children.map((child: any) => {
                                                    const ChildIcon = child.icon;
                                                    const childActive = isActive(child.href);
                                                    return (
                                                        <Link
                                                            key={child.label}
                                                            href={child.href}
                                                            className={`flex h-10 items-center gap-2 rounded-lg px-3 text-[13px] transition-all duration-200 ${childActive
                                                                ? "bg-[#f0f4ff] text-[#3964FE] font-medium"
                                                                : "text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE]"
                                                                }`}
                                                        >
                                                            <ChildIcon size={15} strokeWidth={1.7} />
                                                            <span>{child.label}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`group relative flex h-12 w-full items-center rounded-xl px-3 text-left transition-all duration-200 ${active
                                            ? "bg-[#3964FE] text-white shadow-lg shadow-[#3964FE]/30"
                                            : "text-[#5a6276] hover:bg-[#f0f4ff] hover:text-[#3964FE]"
                                            }`}
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-lg" />
                                        )}
                                        <Icon size={20} strokeWidth={1.7} className={`mr-3 shrink-0 transition-all ${active ? "text-white" : "text-[#8a92a6] group-hover:text-[#3964FE]"}`} />
                                        <span className={`text-sm font-medium ${active ? "text-white" : "text-[#5a6276] group-hover:text-[#3964FE]"}`}>{item.label}</span>
                                        {item.dropdown && (
                                            <ChevronDown size={16} strokeWidth={2} className={`ml-auto transition-transform ${active ? "text-white" : "text-[#b0b8c8] group-hover:text-[#3964FE]"}`} />
                                        )}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="shrink-0 px-5 pb-5">
                <div className="rounded-xl border border-[#e9edf2] bg-[#f0f4ff] p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3964FE] shadow-md shadow-[#3964FE]/30">
                            <UserRound className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[#1a2332]">Distributor</p>
                            <p className="text-[11px] text-[#8a92a6]">AIA603525</p>
                        </div>
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
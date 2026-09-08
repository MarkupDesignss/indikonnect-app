"use client";

import {
  Search,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const mockTransactions = [
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank Rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank Rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank Rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank Rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank Rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "",
  },
];

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [category, setCategory] = useState("All Categories");

  return (
    <div className="rounded-[12px] border border-[#edf0f3] bg-white p-[20px] shadow-sm">
      {/* Heading */}
      <h1 className="text-[16px] font-semibold text-[#1a2332]">
        Transactions History
      </h1>

      {/* ================= FILTERS ================= */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative max-w-[300px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b8c8]"
          />
          <input
            type="text"
            placeholder="Quick Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[40px] w-full rounded-[6px] border border-[#edf0f3] bg-white pl-10 pr-4 text-[12px] text-[#1a2332] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
          />
        </div>

        {/* Right side filters */}
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pick Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-[40px] w-[180px] rounded-[6px] border border-[#edf0f3] bg-white px-3 pr-8 text-[12px] text-[#5a6276] outline-none placeholder:text-[#b0b8c8] focus:border-[#3964FE] transition-all"
            />
            <X
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#8a92a6] hover:text-[#5a6276]"
              onClick={() => setDateRange("")}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[40px] w-[160px] rounded-[6px] border border-[#edf0f3] bg-white px-3 text-[12px] text-[#5a6276] outline-none focus:border-[#3964FE] transition-all"
            >
              <option value="All Categories">All Categories</option>
              <option value="Order">Order</option>
              <option value="Reward">Reward</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-5">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
          <span className="flex items-center gap-1">
            Date <ChevronDown size={12} />
          </span>
          <span>Category</span>
          <span>Description</span>
          <span>Wallet</span>
          <span>Green Coin</span>
          <span>Yellow Coin</span>
          <span>Blue Coin</span>
          <span>OrderID</span>
          <span>Related Member</span>
        </div>

        {/* Table Rows */}
        <div className="mt-2">
          {mockTransactions.map((txn, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr] items-center border-b border-dashed border-[#edf0f4] py-4 text-[12px] text-[#1a2332]"
            >
              <span className="text-[#5a6276]">{txn.date}</span>
              <span className="text-[#5a6276]">{txn.category}</span>
              <span className="text-[#5a6276]">{txn.description}</span>
              <span className="text-[#5a6276]">{txn.wallet}</span>
              <span className="text-[#5a6276]">{txn.greenCoin}</span>
              <span className="text-[#5a6276]">{txn.yellowCoin}</span>
              <span className="text-[#5a6276]">{txn.blueCoin}</span>
              <span className="font-medium text-[#3964FE]">{txn.orderId}</span>
              <span className="text-[#5a6276]">{txn.relatedMember}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
        <div className="flex items-center gap-4 text-[12px] text-[#5a6276]">
          <div className="flex items-center gap-2">
            <span>10</span>
            <ChevronDown size={14} className="text-[#8a92a6]" />
          </div>
          <span className="uppercase font-medium tracking-wider">
            Showing 3 to 3
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#3964FE] text-[12px] font-medium text-white shadow-sm shadow-[#3964FE]/30">
            1
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-[4px] text-[#b0b8c8] hover:bg-[#f0f4ff] hover:text-[#3964FE] transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

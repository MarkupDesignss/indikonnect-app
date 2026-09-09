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
    description: "Bank rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "—",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "—",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "—",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "—",
  },
  {
    date: "23/08/2026",
    category: "Order",
    description: "Bank rewards",
    wallet: "0",
    greenCoin: "0",
    yellowCoin: "0",
    blueCoin: "0",
    orderId: "#12345678",
    relatedMember: "—",
  },
];

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [category, setCategory] = useState("All categories");

  return (
    <div
      style={{ fontFamily: "'Lato', sans-serif" }}
      className="rounded-[16px] border border-[#e7e9ee] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
      `}</style>

      {/* Heading */}
      <h1 className="text-[17px] font-bold text-[#101828]">
        Transaction history
      </h1>

      {/* ================= FILTERS ================= */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full max-w-[300px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b6c3]"
          />
          <input
            type="text"
            placeholder="Search transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[40px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] pl-10 pr-4 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
          />
        </div>

        {/* Right side filters */}
        <div className="flex items-center gap-3">
          {/* Date Range */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pick date range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-[40px] w-[180px] rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 pr-8 text-[13px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
            />
            {dateRange && (
              <button
                onClick={() => setDateRange("")}
                aria-label="Clear date range"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a92a6] transition-colors hover:text-[#101828]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-[40px] w-[160px] rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[13px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10"
          >
            <option value="All categories">All categories</option>
            <option value="Order">Order</option>
            <option value="Reward">Reward</option>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Transfer">Transfer</option>
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="mt-6 overflow-x-auto">
        {/* Table Header */}
        <div className="grid min-w-[820px] grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr] gap-2 border-b border-[#e7e9ee] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
          <button className="flex items-center gap-1 text-left transition-colors hover:text-[#0E1B3D]">
            Date <ChevronDown size={12} />
          </button>
          <span>Category</span>
          <span>Description</span>
          <span>Wallet</span>
          <span>Green coin</span>
          <span>Yellow coin</span>
          <span>Blue coin</span>
          <span>Order ID</span>
          <span>Related member</span>
        </div>

        {/* Table Rows */}
        <div className="min-w-[820px]">
          {mockTransactions.map((txn, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_1fr_1fr_1.2fr_1.2fr] items-center gap-2 border-b border-dashed border-[#e7e9ee] py-4 text-[13px] text-[#101828] last:border-b-0"
            >
              <span className="text-[#667085]">{txn.date}</span>
              <span className="text-[#667085]">{txn.category}</span>
              <span className="text-[#667085]">{txn.description}</span>
              <span className="text-[#667085]">{txn.wallet}</span>
              <span className="text-[#667085]">{txn.greenCoin}</span>
              <span className="text-[#667085]">{txn.yellowCoin}</span>
              <span className="text-[#667085]">{txn.blueCoin}</span>
              <span className="font-semibold text-[#0E1B3D]">
                {txn.orderId}
              </span>
              <span className="text-[#667085]">{txn.relatedMember}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
        <div className="flex items-center gap-4 text-[13px] text-[#667085]">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#101828]">10</span>
            <ChevronDown size={14} className="text-[#8a92a6]" />
          </div>
          <span className="font-medium">
            Showing 1–{mockTransactions.length} of {mockTransactions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
            <ChevronLeft size={16} />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#0E1B3D] text-[12px] font-semibold text-white">
            1
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#b0b8c8] transition-colors hover:bg-[#f2f4f7] hover:text-[#0E1B3D]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

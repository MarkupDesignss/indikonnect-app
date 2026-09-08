"use client";

import {
    Wallet,
    TrendingUp,
    Coins,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    X,
} from "lucide-react";
import { useState } from "react";

const transactions = [
    {
        date: "12/05/2026",
        category: "Adjustment",
        description: "Adjustment Wallet",
        walletChange: "0.00",
        greenCoin: 0,
        yellowCoin: 0,
        blueCoin: 0,
        orderId: "#123456",
        member: "",
    },
    {
        date: "12/05/2026",
        category: "Adjustment",
        description: "Adjustment Wallet",
        walletChange: "0.00",
        greenCoin: 0,
        yellowCoin: 0,
        blueCoin: 0,
        orderId: "#123456",
        member: "",
    },
    {
        date: "12/05/2026",
        category: "Adjustment",
        description: "Adjustment Wallet",
        walletChange: "0.00",
        greenCoin: 0,
        yellowCoin: 0,
        blueCoin: 0,
        orderId: "#123456",
        member: "",
    },
];

const WalletPage = () => {
    // State for all modals
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

    // Withdraw Modal States
    const [withdrawAmount, setWithdrawAmount] = useState("100.00");
    const [finalAmount, setFinalAmount] = useState("100.00");
    const [pin, setPin] = useState("");

    // Transfer Modal States
    const [transferAmount, setTransferAmount] = useState("100.00");
    const [recipient, setRecipient] = useState("100.00");
    const [transferPin, setTransferPin] = useState("");

    // Redeem Coin Modal States
    const [yellowRedeem, setYellowRedeem] = useState(0);
    const [greenRedeem, setGreenRedeem] = useState(0);
    const [blueRedeem, setBlueRedeem] = useState(0);
    const [totalUSD, setTotalUSD] = useState("");

    return (
        <div className="space-y-6">
            {/* Heading */}
            <h1 className="text-[20px] font-semibold text-[#20252b]">My Wallet</h1>

            {/* ================= CARDS SECTION ================= */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {/* 1. Available Balance */}
                <div className="relative min-w-[180px] flex-1 rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <span className="absolute right-3 top-3 rounded-full bg-[#fff4e0] px-2 py-0.5 text-[10px] font-medium text-[#e3aa00]">
                        Cash
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8faef]">
                        <Wallet className="h-5 w-5 text-[#17b963]" />
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-[#5a6276]">
                        Available Balance
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-[#17b963]">0</p>
                </div>

                {/* 2. Retail Profit */}
                <div className="relative min-w-[180px] flex-1 rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <span className="absolute right-3 top-3 rounded-full bg-[#f0f4ff] px-2 py-0.5 text-[10px] font-medium text-[#3964FE]">
                        Floating
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff4e0]">
                        <TrendingUp className="h-5 w-5 text-[#e3aa00]" />
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-[#5a6276]">
                        Retail Profit
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-[#e3aa00]">0</p>
                </div>

                {/* 3. Coin Balance */}
                <div className="relative min-w-[180px] flex-1 rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edf3ff]">
                        <Coins className="h-5 w-5 text-[#3c78e9]" />
                    </div>
                    <p className="mt-3 text-[12px] font-medium text-[#5a6276]">
                        Coin Balance
                    </p>
                    <p className="mt-1 text-[20px] font-bold text-[#3c78e9]">0</p>
                </div>

                {/* 4, 5, 6. Yellow, Green, Blue Coins */}
                {[
                    { label: "Yellow Coin", color: "#e3aa00", bg: "#fff4e0" },
                    { label: "Green Coin", color: "#17b963", bg: "#e8faef" },
                    { label: "Blue Coin", color: "#3c78e9", bg: "#edf3ff" },
                ].map((coin) => (
                    <div
                        key={coin.label}
                        className="flex min-w-[160px] flex-1 flex-col items-center justify-center rounded-[12px] border border-[#edf0f3] bg-white p-4 shadow-sm"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#edf0f3] bg-[#fafcff]">
                            <span
                                className="h-4 w-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: coin.color }}
                            />
                        </div>
                        <p className="mt-2 text-[12px] font-medium text-[#5a6276]">
                            {coin.label}
                        </p>
                        <p
                            className="mt-1 text-[20px] font-bold"
                            style={{ color: coin.color }}
                        >
                            0
                        </p>
                    </div>
                ))}
            </div>

            {/* ================= ACTION BUTTONS ================= */}
            <div className="mt-6 flex justify-center gap-3">
                {/* Withdraw button opens the modal */}
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="flex items-center gap-2 rounded-[6px] bg-[#17b963] px-5 py-2.5 text-[12px] font-medium text-white shadow-md shadow-[#17b963]/30 hover:bg-[#129a52] transition-all"
                >
                    <Wallet size={16} />
                    Withdraw
                </button>

                {/* Transfer button opens the modal */}
                <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-2 rounded-[6px] bg-[#f43f5e] px-5 py-2.5 text-[12px] font-medium text-white shadow-md shadow-[#f43f5e]/30 hover:bg-[#e11d48] transition-all"
                >
                    <TrendingUp size={16} />
                    Transfer
                </button>

                {/* Redeem button opens the modal */}
                <button
                    onClick={() => setIsRedeemModalOpen(true)}
                    className="flex items-center gap-2 rounded-[6px] bg-[#8b5cf6] px-5 py-2.5 text-[12px] font-medium text-white shadow-md shadow-[#8b5cf6]/30 hover:bg-[#7c3aed] transition-all"
                >
                    <Coins size={16} />
                    Redeem Coin
                </button>
            </div>

            {/* ================= TRANSACTION TABLE ================= */}
            <div className="mt-8">
                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-[#edf0f3] pb-3">
                    <button className="border-b-2 border-[#3964FE] pb-2 text-[14px] font-semibold text-[#3964FE]">
                        Transaction
                    </button>
                    <button className="pb-2 text-[14px] font-medium text-[#8a92a6] hover:text-[#3964FE]">
                        Withdrawals
                    </button>
                </div>

                {/* Table Header */}
                <div className="mt-4 grid grid-cols-[1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr_1fr] border-b border-[#edf0f4] pb-3 text-[11px] font-semibold uppercase tracking-wider text-[#8a92a6]">
                    <span>Date</span>
                    <span>Category</span>
                    <span>Description</span>
                    <span>Wallet Change</span>
                    <span>Green Coin</span>
                    <span>Yellow Coin</span>
                    <span>Blue Coin</span>
                    <span>Order ID</span>
                    <span>Related Member</span>
                </div>

                {/* Table Rows */}
                <div className="mt-2">
                    {transactions.map((txn, idx) => (
                        <div
                            key={idx}
                            className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr_1fr] items-center border-b border-[#edf0f4] py-4 text-[12px] text-[#1a2332]"
                        >
                            <span className="text-[#5a6276]">{txn.date}</span>
                            <span className="font-medium">{txn.category}</span>
                            <span className="text-[#5a6276]">{txn.description}</span>
                            <span className="text-[#5a6276]">{txn.walletChange}</span>
                            <span className="text-[#5a6276]">{txn.greenCoin}</span>
                            <span className="text-[#5a6276]">{txn.yellowCoin}</span>
                            <span className="text-[#5a6276]">{txn.blueCoin}</span>
                            <span className="font-medium text-[#3964FE]">{txn.orderId}</span>
                            <span className="text-[#5a6276]">{txn.member}</span>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
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

            {/* ================= WITHDRAWAL MODAL ================= */}
            {isWithdrawModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsWithdrawModalOpen(false)}
                >
                    <div
                        className="w-full max-w-[480px] rounded-[12px] bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1a2332]">
                                New Withdrawal Request
                            </h3>
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a92a6] hover:bg-[#f0f4ff] hover:text-[#1a2332] transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Wallet Balance */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Wallet Balance (USD)
                            </label>
                            <input
                                type="text"
                                value="0.00"
                                disabled
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#5a6276] outline-none"
                            />
                        </div>

                        {/* Withdraw Amount */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Withdraw Amount*
                            </label>
                            <input
                                type="text"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Select Withdraw method */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Select Withdraw method
                            </label>
                            <select className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all">
                                <option>USDT Transfer</option>
                                <option>Bank Transfer</option>
                            </select>
                            <p className="mt-1.5 text-[10px] text-[#8a92a6]">
                                Fee (USD) 0.00
                            </p>
                        </div>

                        {/* The payment will be made note */}
                        <div className="mb-4 rounded-[6px] bg-[#f8faff] p-3">
                            <p className="text-[11px] text-[#5a6276]">
                                The payment will be made to the Bank account or USDT Wallet from My Profile page.
                            </p>
                        </div>

                        {/* Final Amount */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Final Amount*
                            </label>
                            <input
                                type="text"
                                value={finalAmount}
                                onChange={(e) => setFinalAmount(e.target.value)}
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* PIN */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                PIN*
                            </label>
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Modal Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="h-[38px] rounded-[6px] border border-[#e5e9ef] bg-white px-5 text-[12px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    alert("Withdrawal request submitted!");
                                    setIsWithdrawModalOpen(false);
                                }}
                                className="h-[38px] rounded-[6px] bg-[#3964FE] px-5 text-[12px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= TRANSFER MODAL ================= */}
            {isTransferModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsTransferModalOpen(false)}
                >
                    <div
                        className="w-full max-w-[480px] rounded-[12px] bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1a2332]">
                                New Transfer
                            </h3>
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a92a6] hover:bg-[#f0f4ff] hover:text-[#1a2332] transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Wallet Balance */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Wallet Balance (USD)
                            </label>
                            <input
                                type="text"
                                value="0.00"
                                disabled
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#5a6276] outline-none"
                            />
                        </div>

                        {/* Transfer Amount */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Transfer Amount (USD)*
                            </label>
                            <input
                                type="text"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Recipient's Member Code or Email Address */}
                        <div className="mb-4">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Enter Recipient&apos;s Member Code or Email Address*
                            </label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Check Button */}
                        <div className="mb-4">
                            <button
                                onClick={() => alert("Recipient verified!")}
                                className="h-[38px] rounded-[6px] bg-[#3964FE] px-6 text-[12px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] transition-all"
                            >
                                Check
                            </button>
                        </div>

                        {/* PIN */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                PIN*
                            </label>
                            <input
                                type="password"
                                value={transferPin}
                                onChange={(e) => setTransferPin(e.target.value)}
                                placeholder="Enter PIN"
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Modal Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsTransferModalOpen(false)}
                                className="h-[38px] rounded-[6px] border border-[#e5e9ef] bg-white px-5 text-[12px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    alert("Transfer request submitted!");
                                    setIsTransferModalOpen(false);
                                }}
                                className="h-[38px] rounded-[6px] bg-[#3964FE] px-5 text-[12px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= REDEEM COIN MODAL ================= */}
            {isRedeemModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsRedeemModalOpen(false)}
                >
                    <div
                        className="w-full max-w-[480px] rounded-[12px] bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-[#1a2332]">
                                Redeem Coins To Wallet
                            </h3>
                            <button
                                onClick={() => setIsRedeemModalOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a92a6] hover:bg-[#f0f4ff] hover:text-[#1a2332] transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Yellow Coin */}
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-bold text-[#e3aa00]">
                                    Yellow Coin Balance
                                </label>
                                <input
                                    type="text"
                                    value="0"
                                    disabled
                                    className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#5a6276] outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                    Redeem Amount*
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={yellowRedeem}
                                        onChange={(e) => setYellowRedeem(Number(e.target.value))}
                                        className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                                    />
                                    <ChevronDown size={16} className="text-[#8a92a6]" />
                                </div>
                            </div>
                        </div>

                        {/* Green Coin */}
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-bold text-[#17b963]">
                                    Green Coin Balance
                                </label>
                                <input
                                    type="text"
                                    value="0"
                                    disabled
                                    className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#5a6276] outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                    Redeem Amount*
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={greenRedeem}
                                        onChange={(e) => setGreenRedeem(Number(e.target.value))}
                                        className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                                    />
                                    <ChevronDown size={16} className="text-[#8a92a6]" />
                                </div>
                            </div>
                        </div>

                        {/* Blue Coin */}
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-bold text-[#3c78e9]">
                                    Blue Coin Balance
                                </label>
                                <input
                                    type="text"
                                    value="0"
                                    disabled
                                    className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#5a6276] outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                    Redeem Amount*
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={blueRedeem}
                                        onChange={(e) => setBlueRedeem(Number(e.target.value))}
                                        className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                                    />
                                    <ChevronDown size={16} className="text-[#8a92a6]" />
                                </div>
                            </div>
                        </div>

                        {/* Total Amount to be Received */}
                        <div className="mb-5">
                            <label className="mb-1.5 block text-[12px] font-medium text-[#5a6276]">
                                Total Amount to be Received (USD)*
                            </label>
                            <input
                                type="text"
                                value={totalUSD}
                                onChange={(e) => setTotalUSD(e.target.value)}
                                placeholder=""
                                className="h-[42px] w-full rounded-[6px] border border-[#e5e9ef] bg-[#f5f6fa] px-3 text-[14px] text-[#1a2332] outline-none focus:border-[#3964FE] focus:ring-2 focus:ring-[#3964FE]/20 transition-all"
                            />
                        </div>

                        {/* Modal Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsRedeemModalOpen(false)}
                                className="h-[38px] rounded-[6px] border border-[#e5e9ef] bg-white px-5 text-[12px] font-medium text-[#5a6276] hover:bg-[#f5f6fa] transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    alert("Coins Redeemed successfully!");
                                    setIsRedeemModalOpen(false);
                                }}
                                className="h-[38px] rounded-[6px] bg-[#3964FE] px-5 text-[12px] font-medium text-white shadow-md shadow-[#3964FE]/30 hover:bg-[#2a4fd8] transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
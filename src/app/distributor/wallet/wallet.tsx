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
    description: "Adjustment wallet",
    walletChange: "0.00",
    greenCoin: 0,
    yellowCoin: 0,
    blueCoin: 0,
    orderId: "#123456",
    member: "—",
  },
  {
    date: "12/05/2026",
    category: "Adjustment",
    description: "Adjustment wallet",
    walletChange: "0.00",
    greenCoin: 0,
    yellowCoin: 0,
    blueCoin: 0,
    orderId: "#123456",
    member: "—",
  },
  {
    date: "12/05/2026",
    category: "Adjustment",
    description: "Adjustment wallet",
    walletChange: "0.00",
    greenCoin: 0,
    yellowCoin: 0,
    blueCoin: 0,
    orderId: "#123456",
    member: "—",
  },
];

const NAVY = "#0E1B3D";

const FieldLabel = ({ children, accent }) => (
  <label
    className="mb-1.5 block text-[12px] font-semibold"
    style={{ color: accent || "#5a6276" }}
  >
    {children}
  </label>
);

const ModalInput = (props) => (
  <input
    {...props}
    className={
      "h-[42px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[14px] text-[#101828] outline-none transition-all placeholder:text-[#b0b6c3] focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10 disabled:text-[#8a92a6] " +
      (props.className || "")
    }
  />
);

const ModalShell = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1B3D]/40 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-[480px] rounded-[16px] bg-white p-7 shadow-[0_24px_60px_-20px_rgba(14,27,61,0.35)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[17px] font-bold text-[#101828]">{title}</h3>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#8a92a6] transition-all hover:bg-[#f2f4f7] hover:text-[#101828]"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

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
  const [recipient, setRecipient] = useState("");
  const [transferPin, setTransferPin] = useState("");

  // Redeem Coin Modal States
  const [yellowRedeem, setYellowRedeem] = useState(0);
  const [greenRedeem, setGreenRedeem] = useState(0);
  const [blueRedeem, setBlueRedeem] = useState(0);
  const [totalUSD, setTotalUSD] = useState("");

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }} className="space-y-7">
      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
            `}</style>

      {/* Heading */}
      <h1 className="text-[22px] font-black tracking-[-0.01em] text-[#101828]">
        My wallet
      </h1>

      {/* ================= CARDS SECTION ================= */}
      <div className="flex gap-4 overflow-x-auto pb-1">
        {/* 1. Available Balance */}
        <div className="relative min-w-[180px] flex-1 rounded-[14px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <span className="absolute right-3 top-3 rounded-full bg-[#eaf7f0] px-2 py-0.5 text-[10px] font-semibold text-[#1f9d6b]">
            Cash
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf7f0]">
            <Wallet className="h-5 w-5 text-[#1f9d6b]" />
          </div>
          <p className="mt-3 text-[12px] font-semibold text-[#667085]">
            Available balance
          </p>
          <p className="mt-1 text-[21px] font-black text-[#101828]">$0.00</p>
        </div>

        {/* 2. Retail Profit */}
        <div className="relative min-w-[180px] flex-1 rounded-[14px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <span className="absolute right-3 top-3 rounded-full bg-[#f8f1e4] px-2 py-0.5 text-[10px] font-semibold text-[#B8935A]">
            Floating
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f1e4]">
            <TrendingUp className="h-5 w-5 text-[#B8935A]" />
          </div>
          <p className="mt-3 text-[12px] font-semibold text-[#667085]">
            Retail profit
          </p>
          <p className="mt-1 text-[21px] font-black text-[#101828]">$0.00</p>
        </div>

        {/* 3. Coin Balance */}
        <div className="relative min-w-[180px] flex-1 rounded-[14px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eceffb]">
            <Coins className="h-5 w-5 text-[#3955A6]" />
          </div>
          <p className="mt-3 text-[12px] font-semibold text-[#667085]">
            Coin balance
          </p>
          <p className="mt-1 text-[21px] font-black text-[#101828]">0</p>
        </div>

        {/* 4, 5, 6. Yellow, Green, Blue Coins */}
        {[
          { label: "Yellow coin", color: "#B8935A", bg: "#f8f1e4" },
          { label: "Green coin", color: "#1f9d6b", bg: "#eaf7f0" },
          { label: "Blue coin", color: "#3955A6", bg: "#eceffb" },
        ].map((coin) => (
          <div
            key={coin.label}
            className="flex min-w-[150px] flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e7e9ee] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: coin.bg }}
            >
              <span
                className="h-4 w-4 rounded-full ring-2 ring-white"
                style={{ backgroundColor: coin.color }}
              />
            </div>
            <p className="mt-2 text-[12px] font-semibold text-[#667085]">
              {coin.label}
            </p>
            <p className="mt-1 text-[19px] font-black text-[#101828]">0</p>
          </div>
        ))}
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="flex items-center gap-2 rounded-[9px] bg-[#0E1B3D] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#132550]"
        >
          <Wallet size={16} />
          Withdraw
        </button>

        <button
          onClick={() => setIsTransferModalOpen(true)}
          className="flex items-center gap-2 rounded-[9px] bg-[#B8935A] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#a37f49]"
        >
          <TrendingUp size={16} />
          Transfer
        </button>

        <button
          onClick={() => setIsRedeemModalOpen(true)}
          className="flex items-center gap-2 rounded-[9px] bg-[#3955A6] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2e4788]"
        >
          <Coins size={16} />
          Redeem coin
        </button>
      </div>

      {/* ================= TRANSACTION TABLE ================= */}
      <div className="rounded-[16px] border border-[#e7e9ee] bg-white p-6">
        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[#edf0f3] pb-3">
          <button className="border-b-2 border-[#0E1B3D] pb-2 text-[14px] font-bold text-[#0E1B3D]">
            Transactions
          </button>
          <button className="pb-2 text-[14px] font-semibold text-[#8a92a6] transition-colors hover:text-[#0E1B3D]">
            Withdrawals
          </button>
        </div>

        {/* Table Header */}
        <div className="mt-4 grid grid-cols-[1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr_1fr] border-b border-[#edf0f4] pb-3 text-[11.5px] font-bold tracking-wide text-[#8a92a6]">
          <span>Date</span>
          <span>Category</span>
          <span>Description</span>
          <span>Wallet change</span>
          <span>Green coin</span>
          <span>Yellow coin</span>
          <span>Blue coin</span>
          <span>Order ID</span>
          <span>Related member</span>
        </div>

        {/* Table Rows */}
        <div>
          {transactions.map((txn, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr_0.8fr_1fr_1fr] items-center border-b border-[#edf0f4] py-4 text-[13px] text-[#101828] last:border-b-0"
            >
              <span className="text-[#667085]">{txn.date}</span>
              <span className="font-semibold">{txn.category}</span>
              <span className="text-[#667085]">{txn.description}</span>
              <span className="text-[#667085]">{txn.walletChange}</span>
              <span className="text-[#667085]">{txn.greenCoin}</span>
              <span className="text-[#667085]">{txn.yellowCoin}</span>
              <span className="text-[#667085]">{txn.blueCoin}</span>
              <span className="font-semibold text-[#0E1B3D]">
                {txn.orderId}
              </span>
              <span className="text-[#667085]">{txn.member}</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f0f2f5] pt-4">
          <div className="flex items-center gap-4 text-[13px] text-[#667085]">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#101828]">10</span>
              <ChevronDown size={14} className="text-[#8a92a6]" />
            </div>
            <span className="font-medium">Showing 1–3 of 3</span>
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

      {/* ================= WITHDRAWAL MODAL ================= */}
      {isWithdrawModalOpen && (
        <ModalShell
          title="New withdrawal request"
          onClose={() => setIsWithdrawModalOpen(false)}
        >
          <div className="mb-4">
            <FieldLabel>Wallet balance (USD)</FieldLabel>
            <ModalInput type="text" value="0.00" disabled />
          </div>

          <div className="mb-4">
            <FieldLabel accent={NAVY}>Withdraw amount*</FieldLabel>
            <ModalInput
              type="text"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>Withdrawal method</FieldLabel>
            <select className="h-[42px] w-full rounded-[8px] border border-[#e5e9ef] bg-[#f7f8fa] px-3 text-[14px] text-[#101828] outline-none transition-all focus:border-[#0E1B3D] focus:bg-white focus:ring-2 focus:ring-[#0E1B3D]/10">
              <option>USDT transfer</option>
              <option>Bank transfer</option>
            </select>
            <p className="mt-1.5 text-[11.5px] text-[#8a92a6]">
              Fee (USD) 0.00
            </p>
          </div>

          <div className="mb-4 rounded-[8px] bg-[#f7f8fa] p-3">
            <p className="text-[12px] leading-relaxed text-[#667085]">
              Funds are sent to the bank account or USDT wallet saved on your
              profile.
            </p>
          </div>

          <div className="mb-4">
            <FieldLabel accent={NAVY}>Final amount*</FieldLabel>
            <ModalInput
              type="text"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <FieldLabel accent={NAVY}>PIN*</FieldLabel>
            <ModalInput
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="h-[40px] rounded-[8px] border border-[#e5e9ef] bg-white px-5 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Withdrawal request submitted!");
                setIsWithdrawModalOpen(false);
              }}
              className="h-[40px] rounded-[8px] bg-[#0E1B3D] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#132550]"
            >
              Submit request
            </button>
          </div>
        </ModalShell>
      )}

      {/* ================= TRANSFER MODAL ================= */}
      {isTransferModalOpen && (
        <ModalShell
          title="New transfer"
          onClose={() => setIsTransferModalOpen(false)}
        >
          <div className="mb-4">
            <FieldLabel>Wallet balance (USD)</FieldLabel>
            <ModalInput type="text" value="0.00" disabled />
          </div>

          <div className="mb-4">
            <FieldLabel accent="#B8935A">Transfer amount (USD)*</FieldLabel>
            <ModalInput
              type="text"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>Recipient&apos;s member code or email*</FieldLabel>
            <ModalInput
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. member@example.com"
            />
          </div>

          <div className="mb-4">
            <button
              onClick={() => alert("Recipient verified!")}
              className="h-[38px] rounded-[8px] border border-[#e5e9ef] bg-white px-5 text-[13px] font-semibold text-[#0E1B3D] transition-colors hover:bg-[#f7f8fa]"
            >
              Verify recipient
            </button>
          </div>

          <div className="mb-6">
            <FieldLabel accent="#B8935A">PIN*</FieldLabel>
            <ModalInput
              type="password"
              value={transferPin}
              onChange={(e) => setTransferPin(e.target.value)}
              placeholder="Enter PIN"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="h-[40px] rounded-[8px] border border-[#e5e9ef] bg-white px-5 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Transfer request submitted!");
                setIsTransferModalOpen(false);
              }}
              className="h-[40px] rounded-[8px] bg-[#B8935A] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#a37f49]"
            >
              Send transfer
            </button>
          </div>
        </ModalShell>
      )}

      {/* ================= REDEEM COIN MODAL ================= */}
      {isRedeemModalOpen && (
        <ModalShell
          title="Redeem coins to wallet"
          onClose={() => setIsRedeemModalOpen(false)}
        >
          {[
            {
              label: "Yellow coin",
              color: "#B8935A",
              value: yellowRedeem,
              set: setYellowRedeem,
            },
            {
              label: "Green coin",
              color: "#1f9d6b",
              value: greenRedeem,
              set: setGreenRedeem,
            },
            {
              label: "Blue coin",
              color: "#3955A6",
              value: blueRedeem,
              set: setBlueRedeem,
            },
          ].map((coin) => (
            <div key={coin.label} className="mb-4 flex items-center gap-4">
              <div className="flex-1">
                <FieldLabel accent={coin.color}>
                  {coin.label} balance
                </FieldLabel>
                <ModalInput type="text" value="0" disabled />
              </div>
              <div className="flex-1">
                <FieldLabel>Redeem amount*</FieldLabel>
                <div className="flex items-center gap-2">
                  <ModalInput
                    type="number"
                    value={coin.value}
                    onChange={(e) => coin.set(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="mb-6">
            <FieldLabel accent={NAVY}>
              Total amount to receive (USD)*
            </FieldLabel>
            <ModalInput
              type="text"
              value={totalUSD}
              onChange={(e) => setTotalUSD(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRedeemModalOpen(false)}
              className="h-[40px] rounded-[8px] border border-[#e5e9ef] bg-white px-5 text-[13px] font-semibold text-[#344054] transition-colors hover:bg-[#f7f8fa]"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert("Coins redeemed successfully!");
                setIsRedeemModalOpen(false);
              }}
              className="h-[40px] rounded-[8px] bg-[#3955A6] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2e4788]"
            >
              Redeem
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default WalletPage;

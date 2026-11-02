"use client";

import "./premium-header.css";

import { Suspense, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTokenCheck } from "@/hooks/useTokenCheck";
import { getAppType } from "@/lib/appConfig";

import {
  Heart,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  UserCircle,
  Search,
  Grid3x3,
  ArrowRight,
  Package,
  LogOut as LogOutIcon,
  AlertCircle,
  Loader2,
  Home,
  Tag,
  UserCircle as UserCircleIcon,
  MapPin,
  LifeBuoy,
  ChevronRight,
  Mic,
  BadgeCheck,
  Headphones,
  ChevronDown,
} from "lucide-react";

import Logo from "../../../public/indiekonnect-web/images/logo.png";
import PlaceholderImage from "../../../public/indiekonnect-web/images/placeholder.jpg";

import { useLogout } from "@/lib/hooks/useLogout";
import { showToast } from "../../lib/slices/toastSlice";

import { useGetCartQuery } from "@/lib/redux/api/cartApi";
import { useGetWishlistQuery } from "@/lib/redux/api/Wishlist/wishlistApi";
import { useGetProductsQuery } from "@/lib/redux/api/productApi";
import { useGetUserProfileQuery } from "@/lib/redux/api/authApi";
import { useGetCategoriesQuery } from "@/lib/redux/api/categoryApi";
import { useGetHeaderQuery } from "@/lib/redux/api/headerApi";

/* =========================================================
   PREMIUM DIWALI EDIT — festive visuals only.
   Set DIWALI_MODE = false after the festival to restore the
   existing non-festive header. All business logic is unchanged.
========================================================= */

const DIWALI_MODE = true;

const FESTIVE_CSS = `
/* Premium Diwali: handcrafted firework bursts, restrained and non-interactive. */
.premium-header--festive {
  --ik-wine: #562438;
  --ik-wine-deep: #361a2b;
  --ik-gold: #dcb778;
  --ik-ink: #292127;
  --ik-ivory: #fcfaf7;
}

/* The announcement collapses correctly with the original scroll behavior */
.premium-header--festive .premium-header-announcement-wrap {
  height: 62px !important;
  max-height: 62px !important;
  overflow: hidden;
  opacity: 1;
  transition: height .24s ease, max-height .24s ease, opacity .2s ease;
}
.premium-header--festive .premium-header-announcement-wrap.is-collapsed {
  height: 0 !important;
  max-height: 0 !important;
  opacity: 0;
  pointer-events: none;
}
.premium-header--festive .premium-benefits.ik-festive-benefits {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 62px;
  height: 62px;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 max(24px, calc((100vw - 1500px) / 2));
  background: linear-gradient(105deg, #351a2b 0%, #59233a 52%, #402031 100%);
  color: #fffaf1;
  border-top: 2px solid #dcb778;
  border-bottom: 1px solid rgba(244, 210, 157, .3);
}
.premium-header--festive .ik-festive-benefits::before,
.premium-header--festive .ik-festive-benefits::after {
  content: "";
  position: absolute;
  width: 180px;
  height: 180px;
  top: -70px;
  border-radius: 50%;
  pointer-events: none;
  background:
    repeating-radial-gradient(circle, transparent 0px, transparent 16px, rgba(229, 192, 136, .19) 17px, transparent 18px),
    repeating-conic-gradient(from 15deg, transparent 0deg, transparent 28deg, rgba(229, 192, 136, .08) 30deg, transparent 32deg);
  opacity: .54;
}
.premium-header--festive .ik-festive-benefits::before { left: -68px; }
.premium-header--festive .ik-festive-benefits::after { right: -75px; }
.premium-header--festive .ik-festive-hero {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 11px;
  height: 100%;
}
.premium-header--festive .ik-festive-diya {
  display: inline-flex;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(231, 189, 125, .5);
  border-radius: 50%;
  background: rgba(244, 209, 150, .07);
  color: #f0ca89;
}
.premium-header--festive .ik-festive-copy {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  gap: 14px;
  letter-spacing: .01em;
}
.premium-header--festive .ik-festive-title {
  flex: 0 0 auto;
  color: #f6dba7;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
  white-space: nowrap;
}
.premium-header--festive .ik-festive-divider {
  flex: 0 0 1px;
  align-self: stretch;
  max-height: 17px;
  margin: auto 0;
  background: rgba(239, 212, 168, .48);
}
.premium-header--festive .ik-festive-subtitle {
  overflow: hidden;
  color: rgba(255, 250, 241, .91);
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.premium-header--festive .ik-festive-shop {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  color: #fae0ad;
  border: 1px solid rgba(241, 204, 144, .4);
  border-radius: 6px;
  background: rgba(255, 255, 255, .07);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
}
.premium-header--festive .ik-festive-shop:hover,
.premium-header--festive .ik-festive-shop:focus-visible {
  background: rgba(255, 255, 255, .15);
  border-color: rgba(241, 204, 144, .8);
}
.premium-header--festive .ik-festive-benefits .premium-deliver.ik-festive-deliver {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  max-width: 250px;
  height: auto;
  padding: 6px 0 6px 17px;
  margin: 0;
  background: transparent;
  color: #fff9ef;
  border: 0;
  border-left: 1px solid rgba(244, 209, 156, .25);
  border-radius: 0;
  box-shadow: none;
  text-align: left;
}
.premium-header--festive .ik-festive-deliver > span { min-width: 0; }
.premium-header--festive .ik-festive-deliver small {
  display: block;
  color: rgba(255, 246, 227, .69);
  font-size: 9px;
  letter-spacing: .09em;
}
.premium-header--festive .ik-festive-deliver b {
  display: block;
  overflow: hidden;
  max-width: 170px;
  color: #fffaf1;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.premium-header--festive .ik-festive-deliver:hover { color: #f3cc8a; }

/* Clean large-commerce main row: logo, search and actions remain unchanged */
.premium-header--festive .premium-main {
  position: relative;
  background: linear-gradient(180deg, #fffdfa 0%, #ffffff 60%);
  box-shadow: inset 0 -1px 0 rgba(92, 47, 58, .075);
}
.premium-header--festive .premium-brand-divider { background: #e8d8c6; }
.premium-header--festive .premium-brand-tagline { color: #65565d; }
.premium-header--festive .premium-search-form {
  background: #fffdfa;
  border: 1px solid #ded2cb;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(76, 37, 48, .035);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.premium-header--festive .premium-search-form:focus-within {
  border-color: #bc9662;
  box-shadow: 0 0 0 3px rgba(214, 179, 126, .16);
}
.premium-header--festive .premium-search-form input {
  background: transparent;
  color: #2f2630;
}
.premium-header--festive .premium-search-form input::placeholder { color: #948b8d; }
.premium-header--festive .premium-search-form > button:first-child { color: #6a3146; }
.premium-header--festive .premium-search-form .premium-search-divider { background: #e9e0d8; }
.premium-header--festive .premium-action { color: #352e35; }
.premium-header--festive .premium-action:hover { color: #843f55; }
.premium-header--festive .premium-icon-wrap i {
  background: #752a45;
  color: #fff;
}


/* -----------------------------------------------------------
   REFINED DIWALI CRACKER / FIREWORKS
   The fireworks render behind all content, do not catch clicks,
   and completely disappear with the announcement on scroll.
----------------------------------------------------------- */
.premium-header--festive .ik-festive-benefits {
  isolation: isolate;
}
.premium-header--festive .ik-cracker-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}
.premium-header--festive .ik-cracker-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 30%, rgba(246, 187, 104, .16), transparent 22%),
    radial-gradient(circle at 89% 70%, rgba(244, 144, 164, .13), transparent 25%),
    linear-gradient(90deg, transparent, rgba(255, 224, 154, .055) 52%, transparent);
}
.premium-header--festive .ik-cracker-burst {
  position: absolute;
  width: 3px;
  height: 3px;
  pointer-events: none;
  color: var(--ik-fire-color, #f6cb88);
  filter: drop-shadow(0 0 4px currentColor);
}
.premium-header--festive .ik-cracker-burst-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff8df;
  box-shadow: 0 0 10px 3px currentColor;
  animation: ik-cracker-core 7.2s ease-out var(--ik-fire-delay, 0s) infinite;
  opacity: 0;
}
.premium-header--festive .ik-cracker-burst-ring {
  position: absolute;
  left: -10px;
  top: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid currentColor;
  box-shadow: 0 0 6px rgba(255, 225, 163, .24);
  animation: ik-cracker-ring 7.2s ease-out var(--ik-fire-delay, 0s) infinite;
  opacity: 0;
}
.premium-header--festive .ik-cracker-ray {
  position: absolute;
  left: -1px;
  top: -3px;
  width: 2px;
  height: 9px;
  border-radius: 8px;
  background: currentColor;
  opacity: 0;
  transform: rotate(var(--ik-angle, 0deg)) translateY(-2px) scale(.1);
  transform-origin: 50% 50%;
  animation: ik-cracker-spark 7.2s cubic-bezier(.12,.65,.3,1) var(--ik-fire-delay, 0s) infinite;
}
.premium-header--festive .ik-cracker-ray:nth-child(3n) {
  color: #fff9e8;
  height: 6px;
  width: 2.5px;
}
.premium-header--festive .ik-cracker-ray:nth-child(4n) {
  color: #f4a99f;
}
.premium-header--festive .ik-cracker-trail {
  position: absolute;
  left: -1px;
  top: 11px;
  width: 2px;
  height: 26px;
  background: linear-gradient(180deg, rgba(255,232,186,.9), transparent);
  transform: rotate(18deg);
  opacity: 0;
  animation: ik-cracker-lift 7.2s ease-in var(--ik-fire-delay, 0s) infinite;
}
.premium-header--festive .ik-cracker-glint {
  position: absolute;
  left: var(--ik-glint-x);
  top: var(--ik-glint-y);
  width: 5px;
  height: 5px;
  opacity: 0;
  transform: rotate(45deg) scale(.4);
  animation: ik-cracker-twinkle var(--ik-glint-time, 3.1s) ease-in-out var(--ik-glint-delay, 0s) infinite;
}
.premium-header--festive .ik-cracker-glint::before,
.premium-header--festive .ik-cracker-glint::after {
  content: "";
  position: absolute;
  inset: 0;
  margin: auto;
  border-radius: 100%;
  background: #ffe6b5;
  box-shadow: 0 0 5px rgba(255, 228, 174, .8);
}
.premium-header--festive .ik-cracker-glint::before { width: 2px; height: 10px; top: -2.5px; }
.premium-header--festive .ik-cracker-glint::after { width: 10px; height: 2px; left: -2.5px; }
/* Delicate glittering line looks like a sparkler; never crosses header controls. */
.premium-header--festive .ik-festive-benefits .ik-cracker-lightline {
  position: absolute;
  z-index: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #d49a58 19%, #fff0c5 50%, #d49a58 81%, transparent 100%);
  background-size: 170% 100%;
  opacity: .8;
  animation: ik-cracker-shimmer 9s linear infinite;
}
.premium-header--festive .ik-festive-diya {
  animation: ik-diya-glow 4.4s ease-in-out infinite;
}
@keyframes ik-cracker-spark {
  0%, 13%, 100% { opacity: 0; transform: rotate(var(--ik-angle)) translateY(-1px) scale(.1); }
  17% { opacity: 1; transform: rotate(var(--ik-angle)) translateY(-8px) scale(.8); }
  24% { opacity: .94; transform: rotate(var(--ik-angle)) translateY(-23px) scale(1); }
  38% { opacity: 0; transform: rotate(var(--ik-angle)) translateY(-36px) scale(.25); }
}
@keyframes ik-cracker-core {
  0%, 12%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(.2); }
  17% { opacity: .95; transform: translate(-50%, -50%) scale(1); }
  28% { opacity: 0; transform: translate(-50%, -50%) scale(1.9); }
}
@keyframes ik-cracker-ring {
  0%, 15%, 100% { opacity: 0; transform: scale(.1); }
  19% { opacity: .5; transform: scale(.7); }
  34% { opacity: 0; transform: scale(3.1); }
}
@keyframes ik-cracker-lift {
  0%, 5%, 100% { opacity: 0; transform: translateY(26px) rotate(14deg) scaleY(.4); }
  8% { opacity: .75; transform: translateY(16px) rotate(14deg) scaleY(1); }
  15% { opacity: .65; transform: translateY(0) rotate(14deg) scaleY(.7); }
  17% { opacity: 0; transform: translateY(-8px) rotate(14deg) scaleY(.1); }
}
@keyframes ik-cracker-twinkle {
  0%, 100% { opacity: 0; transform: rotate(45deg) scale(.3); }
  45% { opacity: .8; transform: rotate(45deg) scale(1); }
  55% { opacity: .85; transform: rotate(45deg) scale(1.12); }
}
@keyframes ik-cracker-shimmer {
  from { background-position: -100% 0; }
  to { background-position: 170% 0; }
}
@keyframes ik-diya-glow {
  0%, 100% { box-shadow: 0 0 0 rgba(242,193,112,0); }
  50% { box-shadow: 0 0 13px rgba(242,193,112,.3); }
}
@media (max-width: 860px) {
  .premium-header--festive .ik-cracker-burst:nth-of-type(3),
  .premium-header--festive .ik-cracker-burst:nth-of-type(4) { display: none; }
  .premium-header--festive .ik-cracker-glint:nth-of-type(even) { display: none; }
}
@media (max-width: 640px) {
  .premium-header--festive .ik-cracker-burst { transform: scale(.57); }
  .premium-header--festive .ik-cracker-glint { opacity: .35; }
}
@media (prefers-reduced-motion: reduce) {
  .premium-header--festive .ik-cracker-layer { display: none; }
  .premium-header--festive .ik-festive-diya { animation: none; }
}

/* Warm navigation with subtle gold and a high-contrast category button */
.premium-header--festive .premium-nav {
  background: #fcf9f4;
  border-top: 1px solid #efe7df;
  border-bottom: 1px solid #eadfce;
}
.premium-header--festive .premium-all-categories {
  color: #fff !important;
  background: #642b42;
  border: 1px solid #642b42;
  border-radius: 7px;
  padding: 9px 13px;
  transition: background .16s ease;
}
.premium-header--festive .premium-all-categories:hover { background: #4e1e33; }
.premium-header--festive .premium-nav-button {
  color: #4d4246;
  transition: color .18s ease, background-color .18s ease;
}
.premium-header--festive .premium-nav-button:hover,
.premium-header--festive .premium-nav-button.premium-nav-active {
  color: #793448;
}
.premium-header--festive .premium-nav-separator { background: #e7dbcf; }
.premium-header--festive .premium-suggestions,
.premium-header--festive .premium-popover,
.premium-header--festive .premium-category-submenu {
  border-color: #eadfd5;
  box-shadow: 0 16px 40px rgba(65, 32, 44, .11);
}
.premium-header--festive .premium-mobile-drawer { background: #fffdfa; }
.premium-header--festive button:focus-visible,
.premium-header--festive a:focus-visible {
  outline: 2px solid #c79a5d;
  outline-offset: 2px;
}

@media (max-width: 1100px) {
  .premium-header--festive .ik-festive-copy { gap: 10px; }
  .premium-header--festive .ik-festive-subtitle { font-size: 11px; }
  .premium-header--festive .ik-festive-shop { font-size: 10px; }
}
@media (max-width: 860px) {
  .premium-header--festive .ik-festive-benefits .premium-deliver.ik-festive-deliver {
    display: none;
  }
  .premium-header--festive .premium-benefits.ik-festive-benefits {
    justify-content: center;
    padding-right: 16px;
    padding-left: 16px;
  }
  .premium-header--festive .ik-festive-hero { justify-content: center; flex: 0 1 auto; }
}
@media (max-width: 640px) {
  .premium-header--festive .premium-header-announcement-wrap {
    height: 46px !important;
    max-height: 46px !important;
  }
  .premium-header--festive .premium-header-announcement-wrap.is-collapsed {
    height: 0 !important;
    max-height: 0 !important;
  }
  .premium-header--festive .premium-benefits.ik-festive-benefits {
    min-height: 46px;
    height: 46px;
    border-top-width: 2px;
  }
  .premium-header--festive .ik-festive-hero { gap: 8px; }
  .premium-header--festive .ik-festive-diya { width: 30px; height: 30px; flex-basis: 30px; }
  .premium-header--festive .ik-festive-title { font-size: 10px; letter-spacing: .085em; }
  .premium-header--festive .ik-festive-subtitle { font-size: 10px; }
  .premium-header--festive .ik-festive-divider { display: none; }
  .premium-header--festive .ik-festive-copy { display: block; }
  .premium-header--festive .ik-festive-title,
  .premium-header--festive .ik-festive-subtitle { display: block; line-height: 1.35; }
  .premium-header--festive .ik-festive-shop { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .premium-header--festive *, .premium-header--festive *::before,
  .premium-header--festive *::after { animation-duration: .01ms !important; }
}
`;


/* CSS-only, decorative fireworks. No timers, no canvas, no overlays. */
const IK_FIREWORKS = [
  { x: "7%", y: "51%", color: "#ffd995", delay: "-1.5s" },
  { x: "94%", y: "44%", color: "#ffc6af", delay: "-4.3s" },
  { x: "24%", y: "41%", color: "#ffd995", delay: "-6.1s" },
  { x: "78%", y: "52%", color: "#ffe8bb", delay: "-3.0s" },
];
const IK_GLINTS = [
  ["2%", "28%", "-2.2s"], ["15%", "68%", "-1.3s"],
  ["30%", "18%", "-2.8s"], ["43%", "76%", "-0.6s"],
  ["56%", "23%", "-1.8s"], ["69%", "67%", "-3.1s"],
  ["85%", "16%", "-2.6s"], ["98%", "77%", "-0.4s"],
];

function FestiveCrackers() {
  return (
    <div className="ik-cracker-layer" aria-hidden="true">
      {IK_FIREWORKS.map((firework, i) => (
        <span
          key={`firework-${i}`}
          className="ik-cracker-burst"
          style={{
            left: firework.x,
            top: firework.y,
            "--ik-fire-color": firework.color,
            "--ik-fire-delay": firework.delay,
          } as React.CSSProperties}
        >
          <span className="ik-cracker-trail" />
          <span className="ik-cracker-burst-ring" />
          <span className="ik-cracker-burst-core" />
          {Array.from({ length: 12 }, (_, ray) => (
            <i
              key={ray}
              className="ik-cracker-ray"
              style={{ "--ik-angle": `${ray * 30}deg` } as React.CSSProperties}
            />
          ))}
        </span>
      ))}
      {IK_GLINTS.map(([x, y, delay], i) => (
        <span
          className="ik-cracker-glint"
          key={`glint-${i}`}
          style={{
            "--ik-glint-x": x,
            "--ik-glint-y": y,
            "--ik-glint-delay": delay,
            "--ik-glint-time": `${2.8 + (i % 3) * .6}s`,
          } as React.CSSProperties}
        />
      ))}
      <span className="ik-cracker-lightline" />
    </div>
  );
}

function FestiveDiyaMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path d="M18 5.3c-3.9 4.5-3.5 7.6-.3 9.1 3.4-1.3 3.8-4.6.3-9.1Z" fill="#F7D69B" />
      <path d="M17.8 10.6c-1.7 2.2-1.4 3.6.1 4.5 1.8-.9 1.9-2.6-.1-4.5Z" fill="#EAA763" />
      <path d="M7 19.2h22c-.9 7.2-5 10.9-11 10.9S7.9 26.4 7 19.2Z" stroke="#F1CC88" strokeWidth="1.6" />
      <path d="M5.3 18.8c4.2 2.1 21.3 2.1 25.4 0" stroke="#F1CC88" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 25.3c3.3 1.7 6.7 1.7 10 0" stroke="#F1CC88" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M9.5 32.3h17" stroke="#F1CC88" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* =========================================================
   SPEECH / LOCATION TYPES
========================================================= */

interface SpeechRecognitionEventLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}
interface LocationInfo {
  locality: string | null;
  state: string | null;
  city: string | null;
  district: string | null;
  postcode: string | null;
  country: string | null;
}

/* =========================================================
   SCROLL CONFIG (hysteresis for no flicker)
========================================================= */

const SCROLL_COLLAPSE_AT = 80;
const SCROLL_EXPAND_AT = 10;

const NAV_COLLAPSE_AT = 260;
const NAV_EXPAND_AT = 140;

/* Initial header height — must match HeaderSkeleton */
const INITIAL_HEADER_HEIGHT = 112;

/* =========================================================
   LOGOUT MODAL
========================================================= */

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-lato"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md overflow-hidden rounded-[10px] border border-[#E4E4E2] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.14)]">
              <div className="relative px-6 pb-5 pt-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F1F0]">
                  <LogOutIcon className="h-7 w-7 text-[#111111]" />
                </div>
                <h3 className="mb-2 text-[20px] font-semibold text-[#171717]">
                  Logout Confirmation
                </h3>
                <p className="text-[13px] leading-relaxed text-[#888888]">
                  Are you sure you want to logout? You&apos;ll need to login
                  again to access your account.
                </p>
              </div>
              <div className="mx-6 flex items-start gap-3 rounded-[7px] border border-[#E4E4E2] bg-[#FAFAF9] p-3.5">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#777777]" />
                <p className="text-[12px] leading-relaxed text-[#666666]">
                  Your session will be ended and you&apos;ll be redirected to
                  the current application home page.
                </p>
              </div>
              <div className="flex gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   EMPTY CART DRAWER (right side, full height)
========================================================= */

const EmptyCartDrawer = ({
  isOpen,
  onClose,
  onContinueShopping,
}: {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="empty-cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[2000] bg-black/35 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Right side panel */}
          <motion.aside
            key="empty-cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[2001] flex h-full w-full max-w-[420px] flex-col border-l border-[#E4E4E2] bg-white font-lato shadow-[-18px_0_60px_rgba(0,0,0,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-[#E6E6E4] px-6 py-5">
              <h3 className="text-[18px] font-semibold text-[#171717]">
                Your Cart
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close cart"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E4E2] bg-white text-[#111111] transition-all duration-200 hover:bg-[#F4F4F3]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#F1F1F0]">
                <ShoppingBag className="h-10 w-10 text-[#111111]" />
              </div>
              <h4 className="mb-2 text-[20px] font-semibold text-[#171717]">
                Your cart is empty
              </h4>
              <p className="text-[13px] leading-relaxed text-[#888888]">
                Looks like you haven&apos;t added anything yet. Please continue
                shopping to discover our latest collections.
              </p>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-3 border-t border-[#E6E6E4] bg-white px-6 py-5">
              <button
                type="button"
                onClick={onContinueShopping}
                className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#111111] px-4 py-3 text-[12px] font-semibold text-white transition-all duration-200 hover:bg-[#292929]"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-[7px] border border-[#D7D7D5] bg-white px-4 py-3 text-[12px] font-medium text-[#555555] transition-all duration-200 hover:bg-[#FAFAF9]"
              >
                Cancel
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

/* =========================================================
   HEADER INNER
========================================================= */

function HeaderInner({
  hideAnnouncement = false,
  hideMenu = false,
}: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { logout } = useLogout();

  /* APP / AUTH */
  const { hasToken, appType } = useTokenCheck();

  const currentAppType = (() => {
    if (typeof window === "undefined") return appType;
    const websitePath = window.location.pathname.toLowerCase();
    if (websitePath.startsWith("/indiekonnect-distributor"))
      return "distributor";
    if (websitePath.startsWith("/indiekonnect-web")) return "customer";
    return getAppType();
  })();

  const isDistributor = currentAppType === "distributor";

  /* STATES */
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  /* Desktop "ALL CATEGORIES" dropdown (portal based, always on top) */
  const [isAllDropdownOpen, setIsAllDropdownOpen] = useState(false);
  const [allDropdownPos, setAllDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 260 });
  const [mobileExpandedCategoryId, setMobileExpandedCategoryId] = useState<
    number | null
  >(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  /* Empty cart right-side drawer */
  const [isEmptyCartDrawerOpen, setIsEmptyCartDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null,
  );

  /* SCROLL STATE */
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(INITIAL_HEADER_HEIGHT);

  /* LOCATION STATES */
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [locationCoordinates, setLocationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* REFS */
  const cartCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const allCategoriesBtnRef = useRef<HTMLButtonElement>(null);
  const allDropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  /* API */
  const { data: cartData, refetch: refetchCart } = useGetCartQuery(undefined, {
    skip: hasToken !== true,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const { data: wishlistData } = useGetWishlistQuery(undefined, {
    skip: hasToken !== true,
  });
  const { data: userProfileData } = useGetUserProfileQuery(undefined, {
    skip: hasToken !== true,
  });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: headerData } = useGetHeaderQuery();
  const { data: productsData, isLoading: isProductsLoading } =
    useGetProductsQuery(
      {
        search:
          debouncedSearchQuery.length >= 1 ? debouncedSearchQuery : undefined,
        limit: 5,
      },
      { skip: debouncedSearchQuery.length < 1 },
    );

  /* SMOOTH SCROLL LISTENER (rAF + hysteresis) */
  useEffect(() => {
    if (typeof window === "undefined") return;

    lastScrollY.current = window.scrollY || 0;

    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled((prev) =>
        prev ? y > SCROLL_EXPAND_AT : y > SCROLL_COLLAPSE_AT,
      );

      setIsNavCollapsed((prev) =>
        prev ? y > NAV_EXPAND_AT : y > NAV_COLLAPSE_AT,
      );
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Measure header height → page ko spacer dena taaki content shift na ho */
  useEffect(() => {
    if (typeof window === "undefined" || !headerRef.current) return;
    const el = headerRef.current;

    const setMeasuredHeight = () => {
      const h = el.getBoundingClientRect().height;
      // Ignore transient 0 values (e.g. before CSS loads)
      if (h > 0) setHeaderHeight(h);
    };

    const ro = new ResizeObserver(() => {
      setMeasuredHeight();
    });
    ro.observe(el);
    setMeasuredHeight();
    return () => ro.disconnect();
  }, []);

  /* Collapse hote hi khule hue dropdowns band */
  useEffect(() => {
    if (isScrolled) {
      setIsAllCategoriesOpen(false);
      setHoveredCategoryId(null);
    }
  }, [isScrolled]);

  /* Nav collapse hone par desktop All Categories dropdown band */
  useEffect(() => {
    if (isNavCollapsed) setIsAllDropdownOpen(false);
  }, [isNavCollapsed]);

  /* ALL CATEGORIES DROPDOWN: position, outside click, escape, resize */
  useEffect(() => {
    if (!isAllDropdownOpen) return;

    const updatePosition = () => {
      const btn = allCategoriesBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setAllDropdownPos({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 260),
      });
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (allDropdownRef.current?.contains(target)) return;
      if (allCategoriesBtnRef.current?.contains(target)) return;
      setIsAllDropdownOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAllDropdownOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAllDropdownOpen]);

  /* EMPTY CART DRAWER: body scroll lock + Escape to close */
  useEffect(() => {
    if (typeof window === "undefined" || !isEmptyCartDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsEmptyCartDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEmptyCartDrawerOpen]);

  /* RESTORE SAVED LOCATION */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedLocation = localStorage.getItem(
        "indiekonnect_delivery_location",
      );
      if (!savedLocation) return;
      const parsed = JSON.parse(savedLocation);
      const savedLatitude = Number(parsed?.latitude);
      const savedLongitude = Number(parsed?.longitude);
      if (
        parsed?.name &&
        Number.isFinite(savedLatitude) &&
        Number.isFinite(savedLongitude)
      ) {
        if (
          String(parsed?.state || "")
            .trim()
            .toLowerCase() === "telangana"
        ) {
          setLocationName(null);
          setDeliveryAvailable(false);
          localStorage.removeItem("indiekonnect_delivery_location");
          return;
        }
        setLocationName(parsed.locality || parsed.name);
        setLocationCoordinates({
          latitude: savedLatitude,
          longitude: savedLongitude,
        });
        setDeliveryAvailable(parsed.deliveryAvailable !== false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* VOICE SUPPORT */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
  }, []);

  /* SEARCH DEBOUNCE */
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  /* DATA */
  const cartItems = cartData?.data?.items || [];
  const cartCount = cartData?.data?.total_items || 0;
  const cartSubtotalFormatted = cartData?.data?.total_formatted || "0.00";
  const wishlistItems = wishlistData?.data || [];
  const wishlistCount = wishlistItems.length;
  const productSuggestions = productsData?.data || [];

  /* Cart bilkul empty hai? (data load ho chuka ho tabhi) */
  const isCartEmpty = !!cartData && cartItems.length === 0 && cartCount === 0;

  const getProductSearchImage = (product: any): string => {
    const fallback =
      typeof PlaceholderImage === "string"
        ? PlaceholderImage
        : PlaceholderImage.src;
    const images = Array.isArray(product?.images) ? product.images : [];
    const primaryImage =
      images.find(
        (image: any) =>
          image?.is_primary === true ||
          image?.is_primary === 1 ||
          image?.is_primary === "1",
      ) || images[0];
    const candidates = [
      primaryImage?.url,
      primaryImage?.image_url,
      primaryImage?.image,
      primaryImage?.path,
      product?.primary_image_url,
      product?.image_url,
      product?.image,
    ];
    return (
      candidates.find(
        (v): v is string => typeof v === "string" && v.trim().length > 0,
      ) || fallback
    );
  };

  const isValidPrice = (value: any) =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0;

  const formatProductPrice = (product: any) => {
    const fmt = (v: any) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(Number(v));

    if (isDistributor) {
      if (isValidPrice(product?.distributor_price))
        return (
          product?.distributor_price_formatted || fmt(product.distributor_price)
        );
      if (isValidPrice(product?.retail_price))
        return product?.retail_price_formatted || fmt(product.retail_price);
      return "₹0";
    }
    if (isValidPrice(product?.retail_price))
      return product?.retail_price_formatted || fmt(product.retail_price);
    return "₹0";
  };

  const hasSuggestions = productSuggestions.length > 0;
  const isSearching = isProductsLoading && debouncedSearchQuery.length >= 1;
  const userProfile = userProfileData?.user;

  const categories = (categoriesData?.data || []).filter(
    (c: any) => c.status === "active",
  );
  const headerMenus = headerData?.data?.menus || [];
  const topFiveCategories = categories.slice(0, 5);
  const allSubcategories = (categoriesData?.subcategories || []).filter(
    (s: any) => s.status === true,
  );

  const getCategorySubcategories = (categoryId: number) => {
    if (!categoryId) return [];
    const category = categories.find(
      (i: any) => Number(i.id) === Number(categoryId),
    );
    const name = String(category?.title || category?.name || "")
      .trim()
      .toLowerCase();
    const isAllWatch = name === "all watch" || name === "all watches";
    return allSubcategories.filter((s: any) => {
      if (Number(s?.category_id) !== Number(categoryId)) return false;
      if (isAllWatch) {
        const n = String(s?.title || s?.name || "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        if (["for him", "for her"].includes(n)) return false;
      }
      return true;
    });
  };

  const getSubcategoryType = (s: any) => {
    const n = String(s?.name || "")
      .trim()
      .toLowerCase();
    if (
      n.includes("for her") ||
      n === "woman" ||
      n === "women" ||
      n.includes("women") ||
      n.includes("girl")
    )
      return "women";
    if (
      n.includes("for him") ||
      n === "man" ||
      n === "men" ||
      n.includes("men") ||
      n.includes("boy")
    )
      return "men";
    return null;
  };

  const menSubcategory =
    allSubcategories.find((s: any) => {
      const t = getSubcategoryType(s);
      return (
        t === "men" &&
        String(s.name || "")
          .toLowerCase()
          .includes("for him")
      );
    }) || allSubcategories.find((s: any) => getSubcategoryType(s) === "men");

  const womenSubcategory =
    allSubcategories.find((s: any) => {
      const t = getSubcategoryType(s);
      return (
        t === "women" &&
        String(s.name || "")
          .toLowerCase()
          .includes("for her")
      );
    }) || allSubcategories.find((s: any) => getSubcategoryType(s) === "women");

  const directCategoryMenus = topFiveCategories.map((c: any) => ({
    label: c.title,
    href: `/products?category=${encodeURIComponent(c.slug || c.title)}`,
    icon: Grid3x3,
    isCategory: true,
    categoryId: c.id,
    subcategories: getCategorySubcategories(c.id),
  }));

  const directSubcategoryMenus: any[] = [];
  if (menSubcategory)
    directSubcategoryMenus.push({
      label: "Men",
      href: `/products?subcategory_ids=${menSubcategory.id}&nav=men`,
      icon: UserCircleIcon,
      isSubcategory: true,
      subcategoryId: menSubcategory.id,
    });
  if (womenSubcategory)
    directSubcategoryMenus.push({
      label: "Women",
      href: `/products?subcategory_ids=${womenSubcategory.id}&nav=women`,
      icon: UserCircleIcon,
      isSubcategory: true,
      subcategoryId: womenSubcategory.id,
    });

  /* CATEGORY HOVER */
  const handleCategoryMouseEnter = (id: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    setHoveredCategoryId(id);
  };
  const handleCategoryMouseLeave = () => {
    if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    categoryCloseTimer.current = setTimeout(
      () => setHoveredCategoryId(null),
      150,
    );
  };
  const handleCategoryPopupEnter = (id: number) => {
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
    setHoveredCategoryId(id);
  };
  const handleCategoryPopupLeave = () => {
    if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
    categoryCloseTimer.current = setTimeout(
      () => setHoveredCategoryId(null),
      150,
    );
  };

  /* ROLE BASED MENUS */
  const getRoleBasedMenus = () => {
    const menus: any[] = [];
    if (
      headerMenus.some(
        (m: any) =>
          m.status === true && (m.slug === "home" || m.title === "Home"),
      )
    )
      menus.push({ label: "Home", href: "/home", icon: Home });
    if (
      headerMenus.some(
        (m: any) =>
          m.status === true && (m.slug === "shop" || m.title === "Shop"),
      )
    )
      menus.push({ label: "Shop", href: "/products", icon: Grid3x3 });

    const menMenu = directSubcategoryMenus.find((i: any) => i.label === "Men");
    if (menMenu) menus.push(menMenu);
    const womenMenu = directSubcategoryMenus.find(
      (i: any) => i.label === "Women",
    );
    if (womenMenu) menus.push(womenMenu);

    if (
      headerMenus.some(
        (m: any) =>
          m.status === true &&
          (m.slug === "new-arrivals" || m.title === "New arrivals"),
      )
    )
      menus.push({
        label: "New arrivals",
        href: "/products?new-arrivals=true",
        icon: Tag,
      });

    menus.push(...directCategoryMenus.slice(0, 5));
    menus.push({
      label: "Support",
      href: "/contact",
      icon: LifeBuoy,
      isSupport: true,
    });
    return menus;
  };

  const desktopNavItems = getRoleBasedMenus();
  const mobileNavItems = getRoleBasedMenus();

  /* CLOSE OVERLAYS */
  const closeHeaderOverlays = () => {
    setIsMobileMenuOpen(false);
    setIsAllCategoriesOpen(false);
    setIsAllDropdownOpen(false);
    setIsEmptyCartDrawerOpen(false);
    setMobileExpandedCategoryId(null);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setHoveredCategoryId(null);
    if (searchCloseTimer.current) {
      clearTimeout(searchCloseTimer.current);
      searchCloseTimer.current = null;
    }
    if (categoryCloseTimer.current) {
      clearTimeout(categoryCloseTimer.current);
      categoryCloseTimer.current = null;
    }
  };

  /* OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
        setIsSearchHovered(false);
        setIsSearchExpanded(false);
        if (searchCloseTimer.current) {
          clearTimeout(searchCloseTimer.current);
          searchCloseTimer.current = null;
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* MOBILE DRAWER */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setMobileExpandedCategoryId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  /* LOCATION FETCHERS */
  const fetchFromBigDataCloud = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    try {
      const url =
        "https://api.bigdatacloud.net/data/reverse-geocode-client" +
        `?latitude=${encodeURIComponent(latitude)}` +
        `&longitude=${encodeURIComponent(longitude)}` +
        "&localityLanguage=en";
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return null;
      const json = await response.json();
      const administrative = Array.isArray(json?.localityInfo?.administrative)
        ? json.localityInfo.administrative
        : [];
      const city =
        json?.locality ||
        json?.city ||
        json?.principalArea ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("city") ||
              item?.description?.toLowerCase()?.includes("town")),
        )?.name ||
        null;
      const state =
        json?.principalSubdivision ||
        json?.principalSubdivisionCode?.replace(/^IN-/i, "")?.trim() ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("state") ||
              item?.description?.toLowerCase()?.includes("province")),
        )?.name ||
        null;
      const district =
        json?.county ||
        json?.district ||
        administrative.find(
          (item: any) =>
            item?.name &&
            (item?.description?.toLowerCase()?.includes("district") ||
              item?.description?.toLowerCase()?.includes("county")),
        )?.name ||
        null;
      const postcode =
        json?.postcode || json?.postCode || json?.postalCode || null;
      const country = json?.countryName || json?.countryCode || null;
      const result: LocationInfo = {
        locality: json?.locality || null,
        state,
        city,
        district,
        postcode,
        country,
      };
      if (!result.city && !result.state && !result.district && !result.country)
        return null;
      return result;
    } catch {
      return null;
    }
  };

  const fetchFromNominatim = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    try {
      const url =
        "https://nominatim.openstreetmap.org/reverse" +
        `?lat=${encodeURIComponent(latitude)}` +
        `&lon=${encodeURIComponent(longitude)}` +
        "&format=jsonv2" +
        "&accept-language=en" +
        "&zoom=14" +
        "&addressdetails=1";
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) return null;
      const json = await response.json();
      const address = json?.address || {};
      const result: LocationInfo = {
        locality:
          address?.suburb ||
          address?.neighbourhood ||
          address?.quarter ||
          address?.city_district ||
          address?.town ||
          address?.city ||
          null,
        state: address?.state || address?.state_district || null,
        city:
          address?.city ||
          address?.town ||
          address?.village ||
          address?.municipality ||
          address?.suburb ||
          address?.county ||
          null,
        district: address?.state_district || address?.county || null,
        postcode: address?.postcode || null,
        country: address?.country || null,
      };
      if (!result.city && !result.state && !result.district && !result.country)
        return null;
      return result;
    } catch {
      return null;
    }
  };

  const getLocationFromCoords = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationInfo | null> => {
    const bigDataCloudResult = await fetchFromBigDataCloud(latitude, longitude);
    if (
      bigDataCloudResult &&
      (bigDataCloudResult.city ||
        bigDataCloudResult.state ||
        bigDataCloudResult.district)
    )
      return bigDataCloudResult;
    return fetchFromNominatim(latitude, longitude);
  };

  /* LOCATION / DELIVERY */
  const handleCheckAvailability = () => {
    if (typeof window === "undefined") return;
    setLocationError(null);
    if (!navigator.geolocation) {
      const message = "Location is not supported by your browser.";
      setLocationError(message);
      dispatch(showToast({ message, type: "error" }));
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocationCoordinates({ latitude, longitude });
        try {
          const location = await getLocationFromCoords(latitude, longitude);
          if (!location) throw new Error("Unable to determine place name.");
          const city =
            location.locality || location.city || location.district || "";
          const state = location.state || "";
          const district = location.district || "";
          const postcode = location.postcode || "";
          const country = location.country || "";
          if (state.trim().toLowerCase() === "telangana") {
            setLocationName(null);
            setDeliveryAvailable(false);
            localStorage.removeItem("indiekonnect_delivery_location");
            setLocationError("Delivery is currently unavailable in Telangana.");
            dispatch(
              showToast({
                message: "Sorry, delivery is not available in Telangana.",
                type: "error",
              }),
            );
            return;
          }
          const formattedLocation = city || state || country || "Your location";
          setLocationName(formattedLocation);
          setDeliveryAvailable(false);
          localStorage.setItem(
            "indiekonnect_delivery_location",
            JSON.stringify({
              name: formattedLocation,
              locality: location.locality || "",
              city: location.city || "",
              state: location.state || "",
              district: location.district || "",
              postcode: postcode || "",
              country: country || "",
              latitude,
              longitude,
              deliveryAvailable: false,
              updatedAt: new Date().toISOString(),
            }),
          );
          dispatch(
            showToast({
              message: `Location set to ${formattedLocation}. Delivery eligibility is subject to confirmation.`,
              type: "success",
            }),
          );
        } catch {
          setLocationName(null);
          setDeliveryAvailable(false);
          const message =
            "We found your location but could not determine the place name.";
          setLocationError(message);
          dispatch(showToast({ message, type: "error" }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        let message = "Unable to detect your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message =
              "Location permission was denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message =
              "Your location is currently unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out. Please try again.";
            break;
          default:
            message = "Unable to detect your location. Please try again.";
        }
        setLocationError(message);
        dispatch(showToast({ message, type: "error" }));
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );
  };

  /* VOICE SEARCH */
  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      dispatch(
        showToast({
          message: "Voice search is not supported in this browser.",
          type: "error",
        }),
      );
      return;
    }
    if (isVoiceSearching) {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      setIsVoiceSearching(false);
      return;
    }
    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
    voiceRecognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setIsVoiceSearching(true);
      setIsSearchOpen(true);
      setIsSearchFocused(true);
      setIsSearchHovered(true);
      setIsSearchExpanded(true);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
      if (transcript) {
        setSearchQuery(transcript);
        setDebouncedSearchQuery(transcript);
        setIsSearchOpen(true);
        setIsSearchExpanded(true);
        setIsSearchFocused(true);
        setIsSearchHovered(true);
        setTimeout(() => {
          const input = searchInputRef.current;
          if (input) {
            input.focus();
            input.setSelectionRange(transcript.length, transcript.length);
          }
        }, 50);
      }
    };
    recognition.onerror = (event) => {
      setIsVoiceSearching(false);
      if (event.error === "aborted") return;
      let message = "Unable to hear you. Please try again.";
      if (event.error === "not-allowed")
        message = "Please allow microphone permission for voice search.";
      else if (event.error === "no-speech")
        message = "No speech detected. Please try again.";
      else if (event.error === "audio-capture")
        message = "No microphone was found on this device.";
      else if (event.error === "network")
        message = "Voice search network error. Please try again.";
      dispatch(showToast({ message, type: "error" }));
    };
    recognition.onend = () => {
      setIsVoiceSearching(false);
      voiceRecognitionRef.current = null;
    };
    try {
      recognition.start();
    } catch {
      setIsVoiceSearching(false);
      voiceRecognitionRef.current = null;
      dispatch(
        showToast({
          message: "Unable to start voice search. Please try again.",
          type: "error",
        }),
      );
    }
  };

  /* CLEANUP */
  useEffect(() => {
    return () => {
      try {
        voiceRecognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      voiceRecognitionRef.current = null;
      if (categoryCloseTimer.current) clearTimeout(categoryCloseTimer.current);
      if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
      if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
      if (searchCloseTimer.current) clearTimeout(searchCloseTimer.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* CART REFRESH LISTENER */
  useEffect(() => {
    const handleCartRefresh = () => {
      if (hasToken === true) {
        refetchCart();
      }
    };
    window.addEventListener("cart:refresh", handleCartRefresh);
    return () => {
      window.removeEventListener("cart:refresh", handleCartRefresh);
    };
  }, [hasToken, refetchCart]);

  /* AUTH / LOGIN */
  const getLoginPath = () =>
    currentAppType === "distributor"
      ? "/auth/distributor/login"
      : "/auth/customer/login";

  const goToLogin = () => {
    router.push(getLoginPath());
    closeHeaderOverlays();
  };

  /* NAVIGATION */
  const goToHome = () => {
    router.push("/home");
    closeHeaderOverlays();
  };
  const goToProducts = (category?: string) => {
    let url = "/products";
    if (category && category !== "all") {
      const params = new URLSearchParams();
      params.append("category", category);
      url += `?${params.toString()}`;
    }
    router.push(url);
    closeHeaderOverlays();
  };
  const goToSubcategory = (sub: any) => {
    const params = new URLSearchParams();
    params.append("subcategory_ids", String(sub.id));
    params.set("nav", "category");
    router.push(`/products?${params.toString()}`);
    closeHeaderOverlays();
  };
  const goToNewArrivals = () => {
    router.push("/products?new-arrivals=true");
    closeHeaderOverlays();
  };
  const goToWishlist = () => {
    if (hasToken !== true) return goToLogin();
    router.push("/wishlist");
    closeHeaderOverlays();
  };

  /* CART CLICK:
     - login nahi hai → login page
     - cart empty hai → right side "Your cart is empty" drawer
     - cart me items hain → checkout */
  const goToCart = () => {
    setIsCartOpen(false);
    if (hasToken !== true) return goToLogin();
    if (isCartEmpty) {
      setIsMobileMenuOpen(false);
      setIsEmptyCartDrawerOpen(true);
      return;
    }
    router.push("/checkout");
    closeHeaderOverlays();
  };

  /* Empty cart drawer actions */
  const closeEmptyCartDrawer = () => setIsEmptyCartDrawerOpen(false);
  const handleContinueShopping = () => {
    setIsEmptyCartDrawerOpen(false);
    router.push("/products");
    closeHeaderOverlays();
  };

  const goToTrackOrder = () => {
    if (hasToken !== true) return goToLogin();
    if (currentAppType === "distributor")
      router.push("/distributor/order-history/");
    else router.push("/profile/?tab=orders");
    closeHeaderOverlays();
  };
  const goToProfile = () => {
    if (hasToken !== true) {
      setIsProfileOpen(false);
      return goToLogin();
    }
    if (currentAppType === "distributor")
      router.push("/distributor/dashboard/");
    else router.push("/profile/");
    setIsProfileOpen(false);
    closeHeaderOverlays();
  };
  const goToProductDetail = (slug: string) => {
    router.push(`/product/${slug}`);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    closeHeaderOverlays();
  };

  const handleNavigation = (item: any) => {
    if (item.isSubcategory) {
      const navSource = String(item.label || "")
        .trim()
        .toLowerCase();
      const params = new URLSearchParams();
      params.set("subcategory_ids", String(item.subcategoryId));
      if (navSource === "men" || navSource === "women")
        params.set("nav", navSource);
      router.push(`/products?${params.toString()}`);
      closeHeaderOverlays();
      return;
    }
    if (item.isCategory) {
      const category = categories.find(
        (cat: any) => cat.id === item.categoryId,
      );
      return goToProducts(category?.slug || item.label);
    }
    if (item.label === "Home") return goToHome();
    if (item.label === "Shop") return goToProducts();
    if (item.label === "New arrivals") return goToNewArrivals();
    if (item.label === "Support") {
      router.push("/contact");
      closeHeaderOverlays();
      return;
    }
    router.push(item.href);
    closeHeaderOverlays();
  };

  /* LOGOUT */
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout({
        callApi: true,
        clearReduxState: true,
        clearPersistedState: true,
        redirectTo: "/",
        onSuccess: () => {
          dispatch(
            showToast({
              message: "Successfully logged out! See you soon",
              type: "success",
            }),
          );
          setIsLoggingOut(false);
          setShowLogoutModal(false);
          setIsProfileOpen(false);
          setIsMobileMenuOpen(false);
        },
        onError: () => {
          dispatch(
            showToast({
              message: "Logout failed. Please try again.",
              type: "error",
            }),
          );
          setIsLoggingOut(false);
          setShowLogoutModal(false);
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      dispatch(
        showToast({
          message: "Something went wrong. Please try again.",
          type: "error",
        }),
      );
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };
  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setIsProfileOpen(false);
  };
  const closeLogoutModal = () => {
    if (!isLoggingOut) setShowLogoutModal(false);
  };

  /* CART / PROFILE DROPDOWNS */
  const openCartDropdown = () => {
    if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
    setIsCartOpen(true);
  };
  const scheduleCloseCartDropdown = () => {
    if (cartCloseTimer.current) clearTimeout(cartCloseTimer.current);
    cartCloseTimer.current = setTimeout(() => setIsCartOpen(false), 200);
  };
  const openProfileDropdown = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    setIsProfileOpen(true);
  };
  const scheduleCloseProfileDropdown = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    profileCloseTimer.current = setTimeout(() => setIsProfileOpen(false), 200);
  };

  /* MOBILE MENU */
  const handleMobileMenuToggle = () => {
    setIsSearchOpen(false);
    setIsSearchFocused(false);
    setIsSearchHovered(false);
    setIsSearchExpanded(false);
    setIsMobileMenuOpen((prev) => !prev);
    if (isMobileMenuOpen) setMobileExpandedCategoryId(null);
  };

  /* SEARCH */
  const toggleSearch = () => {
    if (isSearchExpanded) {
      if (isVoiceSearching) {
        try {
          voiceRecognitionRef.current?.stop();
        } catch {
          /* ignore */
        }
        setIsVoiceSearching(false);
      }
      setIsSearchExpanded(false);
      setIsSearchFocused(false);
      setIsSearchHovered(false);
      setIsSearchOpen(false);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      if (searchCloseTimer.current) {
        clearTimeout(searchCloseTimer.current);
        searchCloseTimer.current = null;
      }
    } else {
      setIsSearchOpen(true);
      setIsSearchExpanded(true);
      setIsSearchFocused(true);
      setIsSearchHovered(true);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams();
    params.append("search", searchQuery.trim());
    if (searchCategory && searchCategory !== "all")
      params.append("category", searchCategory);
    router.push(`/products?${params.toString()}`);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    closeHeaderOverlays();
  };

  /* PROFILE MENU */
  const profileMenuItems = (() => {
    const items: any[] = [];
    if (hasToken === true) {
      items.push({
        icon: UserCircle,
        label: isDistributor ? "Dashboard" : "My Profile",
        onClick: goToProfile,
      });
      items.push({
        icon: LogOutIcon,
        label: "Logout",
        onClick: openLogoutModal,
        isDanger: true,
      });
    } else {
      items.push({
        icon: UserCircle,
        label:
          currentAppType === "distributor"
            ? "Distributor Login"
            : "Customer Login",
        onClick: goToLogin,
      });
    }
    return items;
  })();

  const navClass = "premium-header-nav-button";

  /* ACTIVE NAV LOGIC */
  const activeSubcategoryIds = searchParams
    .getAll("subcategory_ids")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const currentPath = (pathname || "/").replace(/\/+$/, "") || "/";
  const isProductsRoute = currentPath === "/products";
  const activeCategoryParam = (searchParams.get("category") || "")
    .trim()
    .toLowerCase();
  const selectedSubcategories = allSubcategories.filter((sub: any) =>
    activeSubcategoryIds.includes(String(sub.id)),
  );
  const activeNavSource = (searchParams.get("nav") || "").toLowerCase();
  const isSubmenuActive = (sub: any): boolean =>
    isProductsRoute &&
    activeNavSource !== "women" &&
    activeNavSource !== "men" &&
    activeSubcategoryIds.includes(String(sub.id));
  const isParentCategoryActive = (item: any): boolean => {
    if (
      !item.isCategory ||
      !isProductsRoute ||
      activeNavSource === "women" ||
      activeNavSource === "men"
    )
      return false;
    const matchingCategory = categories.find(
      (category: any) => String(category.id) === String(item.categoryId),
    );
    const categoryLabels = [
      item.label,
      matchingCategory?.slug,
      matchingCategory?.title,
      matchingCategory?.name,
      String(item.categoryId),
    ]
      .filter(Boolean)
      .map((v) => String(v).trim().toLowerCase());
    if (activeCategoryParam && categoryLabels.includes(activeCategoryParam))
      return true;
    return (
      selectedSubcategories.some(
        (sub: any) =>
          String(sub.category_id ?? sub.category?.id ?? "") ===
          String(item.categoryId),
      ) || (item.subcategories || []).some((sub: any) => isSubmenuActive(sub))
    );
  };
  const isNavItemActive = (item: any): boolean => {
    const label = String(item.label || "")
      .trim()
      .toLowerCase();
    if (label === "home") return currentPath === "/" || currentPath === "/home";
    if (label === "support") return currentPath === "/contact";
    if (label === "new arrivals")
      return isProductsRoute && searchParams.get("new-arrivals") === "true";
    if (item.isSubcategory)
      return (
        isProductsRoute &&
        activeNavSource === label &&
        activeSubcategoryIds.includes(String(item.subcategoryId))
      );
    if (item.isCategory) return isParentCategoryActive(item);
    if (label === "shop")
      return (
        isProductsRoute &&
        !activeCategoryParam &&
        !activeSubcategoryIds.length &&
        searchParams.get("new-arrivals") !== "true"
      );
    const hrefPath = String(item.href || "")
      .split("?")[0]
      .replace(/\/+$/, "");
    return !!hrefPath && currentPath === hrefPath;
  };

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* EMPTY CART DRAWER — header ke bahar render hota hai taaki
          header ke `willChange: transform` se fixed positioning na toote */}
      <EmptyCartDrawer
        isOpen={isEmptyCartDrawerOpen}
        onClose={closeEmptyCartDrawer}
        onContinueShopping={handleContinueShopping}
      />

      {/* ALL CATEGORIES DROPDOWN — portal to <body>, so it is never clipped
          by header overflow and always renders above every other element */}
      {isAllDropdownOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={allDropdownRef}
            role="menu"
            aria-label="All categories"
            className="font-lato"
            style={{
              position: "fixed",
              top: allDropdownPos.top,
              left: allDropdownPos.left,
              minWidth: allDropdownPos.width,
              maxHeight: `calc(100vh - ${allDropdownPos.top + 16}px)`,
              overflowY: "auto",
              zIndex: 2147483000,
              background: "#ffffff",
              border: "1px solid #E4E4E2",
              borderRadius: 8,
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              padding: "6px 0",
            }}
          >
            {categories.length === 0 && (
              <p
                style={{
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "#777777",
                }}
              >
                No categories available
              </p>
            )}
            {categories.map((category: any) => (
              <button
                key={category.id}
                type="button"
                role="menuitem"
                onClick={() =>
                  goToProducts(category.slug || category.title || category.name)
                }
                className="flex w-full items-center justify-between gap-6 px-4 py-2.5 text-left text-[13px] font-medium text-[#222222] transition-colors duration-150 hover:bg-[#F4F4F3]"
              >
                {category.title || category.name}
                <ChevronRight size={15} />
              </button>
            ))}
          </div>,
          document.body,
        )}

      {/* Spacer to prevent layout shift — ALWAYS renders with a valid height
          (initial height matches HeaderSkeleton / default header size) */}
      <div
        style={{ height: headerHeight }}
        aria-hidden="true"
        className="premium-header-spacer"
      />

      <header
        ref={headerRef}
        className={`premium-header premium-header-fixed font-lato ${isScrolled ? "premium-header-compact" : ""
          } ${DIWALI_MODE ? "premium-header--festive" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          willChange: "transform",
        }}
      >
        {/* Themed styles are local to this header; original CSS stays in use. */}
        {DIWALI_MODE && <style>{FESTIVE_CSS}</style>}

        {/* Top announcement: premium festive ribbon or standard store benefits */}
        {!hideAnnouncement && (
          <div
            className={`premium-header-announcement-wrap ${isScrolled ? "is-collapsed" : ""}`}
            aria-hidden={isScrolled}
            style={{ position: "relative" }}
          >
            <div
              className={`premium-benefits premium-benefits-refreshed ${DIWALI_MODE ? "ik-festive-benefits" : ""
                }`}
            >
              {DIWALI_MODE && <FestiveCrackers />}
              {DIWALI_MODE ? (
                <div className="ik-festive-hero">
                  <span className="ik-festive-diya" aria-hidden="true">
                    <FestiveDiyaMark />
                  </span>
                  <div className="ik-festive-copy">
                    <strong className="ik-festive-title">Diwali Dhamaka</strong>
                    <span className="ik-festive-divider" aria-hidden="true" />
                    <span className="ik-festive-subtitle">
                      Festive finds. Sparkling celebrations. Only at IndieKonnect.
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ik-festive-shop"
                    onClick={() => {
                      router.push("/products");
                      closeHeaderOverlays();
                    }}
                    tabIndex={isScrolled ? -1 : 0}
                  >
                    Shop the edit <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <div className="premium-benefits-marquee" aria-label="Store benefits">
                  <div className="premium-benefits-track">
                    {[0, 1].map((copy) => (
                      <div
                        className="premium-benefits-group"
                        key={copy}
                        aria-hidden={copy === 1}
                      >
                        <span className="premium-benefit-item">
                          <Grid3x3 size={15} /> Explore premium collections
                        </span>
                        <span className="premium-benefit-item">
                          <BadgeCheck size={15} /> 100% genuine products
                        </span>
                        <span className="premium-benefit-item">
                          <Tag size={15} /> Discover new arrivals
                        </span>
                        <span className="premium-benefit-item">
                          <Headphones size={15} /> Dedicated customer support
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={locationLoading}
                className={`premium-deliver premium-deliver-refreshed ${DIWALI_MODE ? "ik-festive-deliver" : ""
                  }`}
                title={locationError || "Detect delivery location"}
                tabIndex={isScrolled ? -1 : 0}
              >
                {locationLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                <span>
                  <small>DELIVER TO</small>
                  <b>{locationName || "Select location"}</b>
                </span>
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── MAIN ROW (hamesha visible) ── */}
        <div className="premium-main">
          <div className="premium-shell premium-main-content">
            {/* LEFT: Brand Logo */}
            <Link
              href="/home"
              onClick={(e) => {
                e.preventDefault();
                goToHome();
              }}
              className="premium-brand"
              aria-label="IndieKonnect home"
            >
              <Image
                src={Logo}
                alt="IndieKonnect"
                width={88}
                height={106}
                priority
                className="premium-brand-logo"
              />
              <span className="premium-brand-divider" />
              <span
                style={{ fontSize: "8px" }}
                className="premium-brand-tagline"
              >
                CONNECT
                <br />
                BEYOND
                <br />
                BOUNDARIES
              </span>
            </Link>

            {/* DESKTOP SEARCH (mobile par hidden) */}
            <div
              className="premium-search-wrap"
              ref={searchRef}
              style={{ position: "relative" }}
            >
              <form onSubmit={handleSearch} className="premium-search-form">
                <button type="submit" aria-label="Search products">
                  <Search size={26} />
                </button>
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setIsSearchExpanded(true);
                  }}
                  placeholder="Search for products, brands, collections..."
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                    }}
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
                <span className="premium-search-divider" />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={!voiceSupported}
                  aria-label="Voice search"
                  className={isVoiceSearching ? "premium-mic-on" : ""}
                >
                  <Mic size={25} />
                </button>
              </form>
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="premium-suggestions">
                  {isSearching && (
                    <p className="premium-suggestion-message">
                      <Loader2 size={16} className="animate-spin" />{" "}
                      Searching...
                    </p>
                  )}
                  {!isSearching &&
                    (Array.isArray(productSuggestions)
                      ? productSuggestions
                      : []
                    )
                      .slice(0, 5)
                      .map((product: any) => (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => goToProductDetail(product.slug)}
                        >
                          <img
                            src={getProductSearchImage(product)}
                            alt={product.name || "Product"}
                            loading="lazy"
                            onError={(event) => {
                              const fallback =
                                typeof PlaceholderImage === "string"
                                  ? PlaceholderImage
                                  : PlaceholderImage.src;
                              if (
                                event.currentTarget.getAttribute("src") !==
                                fallback
                              ) {
                                event.currentTarget.src = fallback;
                              }
                            }}
                          />
                          <span>
                            <b>{product.name}</b>
                            <small>{formatProductPrice(product)}</small>
                          </span>
                          <ArrowRight size={16} />
                        </button>
                      ))}
                  {!isSearching && !hasSuggestions && (
                    <p className="premium-suggestion-message">
                      No matching products. Press Enter to search.
                    </p>
                  )}
                  <button
                    className="premium-see-all"
                    type="submit"
                    onClick={() => {
                      router.push(
                        `/products?search=${encodeURIComponent(
                          searchQuery.trim(),
                        )}`,
                      );
                      closeHeaderOverlays();
                    }}
                  >
                    View all results <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT: Actions & Mobile Menu */}
            <div className="premium-actions">
              {/* ACCOUNT / PROFILE */}
              <div
                className="premium-action-holder"
                onMouseEnter={openProfileDropdown}
                onMouseLeave={scheduleCloseProfileDropdown}
              >
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToProfile}
                  aria-label="Account"
                >
                  <UserCircle size={31} />
                  <span style={{ fontSize: "10px" }}>Account</span>
                </button>
                {isProfileOpen && (
                  <div className="premium-popover premium-profile-popover">
                    {hasToken && (
                      <div className="premium-profile-name">
                        Hello, {userProfile?.full_name || "User"}
                        <small>{userProfile?.email || ""}</small>
                      </div>
                    )}
                    {profileMenuItems.map((item: any, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsProfileOpen(false);
                        }}
                      >
                        <item.icon size={17} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* TRACK ORDER (Mobile par hide) */}
              <button
                type="button"
                className="premium-action premium-track-desktop"
                onClick={goToTrackOrder}
                aria-label="Track order"
              >
                <Package size={31} />
                <span style={{ fontSize: "10px" }}>Track</span>
              </button>

              {/* WISHLIST */}
              <button
                type="button"
                className="premium-action"
                onClick={goToWishlist}
                aria-label="Wishlist"
              >
                <span className="premium-icon-wrap">
                  <Heart size={32} />
                  {wishlistCount > 0 && <i>{wishlistCount}</i>}
                </span>
                <span style={{ fontSize: "10px" }}>Wishlist</span>
              </button>

              {/* CART */}
              <div
                className="premium-action-holder"
                onMouseEnter={openCartDropdown}
                onMouseLeave={scheduleCloseCartDropdown}
              >
                <button
                  type="button"
                  className="premium-action"
                  onClick={goToCart}
                  aria-label="Cart"
                >
                  <span className="premium-icon-wrap">
                    <ShoppingBag size={31} />
                    {cartCount > 0 && <i>{cartCount}</i>}
                  </span>
                  <span style={{ fontSize: "10px" }}>Cart</span>
                </button>
                {isCartOpen && (
                  <div className="premium-popover premium-cart-popover">
                    <b>Your Cart ({cartCount})</b>
                    {cartItems.length === 0 ? (
                      <p>Your shopping bag is empty.</p>
                    ) : (
                      <>
                        {cartItems
                          .slice(0, 3)
                          .map((item: any, index: number) => (
                            <div
                              className="premium-cart-item"
                              key={item.id || index}
                            >
                              <img
                                src={
                                  item.image_url ||
                                  (typeof PlaceholderImage === "string"
                                    ? PlaceholderImage
                                    : PlaceholderImage.src)
                                }
                                alt=""
                              />
                              <span>
                                {item.product?.name || "Product"}
                                <small>Qty: {item.quantity}</small>
                              </span>
                            </div>
                          ))}
                        <p>Subtotal: ₹{cartSubtotalFormatted}</p>
                      </>
                    )}
                    <button
                      className="premium-cart-link"
                      type="button"
                      onClick={goToCart}
                    >
                      View Cart <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE MENU TOGGLE (SABSE LAST RIGHT ME) */}
              <button
                type="button"
                className="premium-mobile-menu"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* ── NAV BAR (scroll par hide) ── */}
        {!hideMenu && (
          <div
            className={`premium-header-nav-wrap ${isNavCollapsed ? "is-collapsed" : ""}`}
            aria-hidden={isNavCollapsed}
          >
            <nav className="premium-nav">
              <div className="premium-shell premium-nav-inner">
                <div className="premium-nav-category">
                  <button
                    ref={allCategoriesBtnRef}
                    type="button"
                    className="premium-all-categories"
                    onClick={() => setIsAllDropdownOpen((prev) => !prev)}
                    aria-expanded={isAllDropdownOpen}
                    aria-haspopup="true"
                    tabIndex={isNavCollapsed ? -1 : 0}
                  >
                    <Menu size={22} /> ALL CATEGORIES
                  </button>
                </div>
                <span className="premium-nav-separator" />
                <div className="premium-nav-links">
                  {desktopNavItems.map((item: any, index: number) => (
                    <div
                      className="premium-nav-link-wrap"
                      key={`${item.label}-${index}`}
                      onMouseEnter={() =>
                        item.isCategory &&
                        handleCategoryMouseEnter(item.categoryId)
                      }
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      <button
                        type="button"
                        onClick={() => handleNavigation(item)}
                        aria-current={isNavItemActive(item) ? "page" : undefined}
                        tabIndex={isNavCollapsed ? -1 : 0}
                        className={`${navClass} ${isNavItemActive(item) ? "premium-nav-active" : ""
                          }`}
                      >
                        {item.label}
                      </button>
                      {item.isCategory &&
                        hoveredCategoryId === item.categoryId &&
                        item.subcategories?.length > 0 && (
                          <div
                            className="premium-category-submenu"
                            onMouseEnter={() =>
                              handleCategoryPopupEnter(item.categoryId)
                            }
                            onMouseLeave={handleCategoryPopupLeave}
                          >
                            {item.subcategories.map((sub: any) => (
                              <button
                                type="button"
                                key={sub.id}
                                className={
                                  isSubmenuActive(sub)
                                    ? "premium-submenu-active"
                                    : ""
                                }
                                aria-current={
                                  isSubmenuActive(sub) ? "page" : undefined
                                }
                                onClick={() => goToSubcategory(sub)}
                              >
                                {sub.title || sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* ── MOBILE DRAWER ── */}
        {isMobileMenuOpen && (
          <div className="premium-mobile-drawer">
            <button
              type="button"
              className="premium-mobile-location"
              onClick={handleCheckAvailability}
            >
              <MapPin size={18} />
              {locationName || "Choose delivery location"}
            </button>
            <button
              type="button"
              onClick={() => setIsAllCategoriesOpen((prev) => !prev)}
              aria-expanded={isAllCategoriesOpen}
            >
              All Categories <ChevronDown size={15} />
            </button>
            {isAllCategoriesOpen &&
              categories.map((category: any) => (
                <button
                  className="premium-mobile-sub"
                  key={`all-category-${category.id}`}
                  type="button"
                  onClick={() =>
                    goToProducts(category.slug || category.title || category.name)
                  }
                >
                  {category.title || category.name}
                </button>
              ))}
            {mobileNavItems.map((item: any, index: number) => (
              <div key={`${item.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.isCategory && item.subcategories?.length) {
                      setMobileExpandedCategoryId(
                        mobileExpandedCategoryId === item.categoryId
                          ? null
                          : item.categoryId,
                      );
                    } else {
                      handleNavigation(item);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  <span
                    className={
                      isNavItemActive(item)
                        ? "premium-mobile-parent-active"
                        : ""
                    }
                  >
                    {item.label}
                  </span>
                  {item.isCategory && item.subcategories?.length > 0 && (
                    <ChevronDown size={15} />
                  )}
                </button>
                {item.isCategory &&
                  (mobileExpandedCategoryId === item.categoryId ||
                    isParentCategoryActive(item)) &&
                  item.subcategories?.map((sub: any) => (
                    <button
                      className={`premium-mobile-sub ${isSubmenuActive(sub) ? "premium-submenu-active" : ""
                        }`}
                      aria-current={isSubmenuActive(sub) ? "page" : undefined}
                      key={sub.id}
                      onClick={() => {
                        goToSubcategory(sub);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {sub.title || sub.name}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

/* =========================================================
   DEFAULT EXPORT — Suspense wrapper
========================================================= */

function HeaderSkeleton() {
  return (
    <header
      style={{
        height: INITIAL_HEADER_HEIGHT,
        background: "#fff",
        borderBottom: "1px solid #EAEAEA",
      }}
      aria-hidden="true"
    />
  );
}

export default function Header(props: {
  hideAnnouncement?: boolean;
  hideMenu?: boolean;
  showSidebarMenu?: boolean;
  onSidebarMenuClick?: () => void;
}) {
  return (
    <Suspense fallback={<HeaderSkeleton />}>
      <HeaderInner
        hideAnnouncement={props.hideAnnouncement}
        hideMenu={props.hideMenu}
      />
    </Suspense>
  );
}

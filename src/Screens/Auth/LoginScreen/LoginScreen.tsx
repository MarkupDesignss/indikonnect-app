"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from ""
export default function LoginScreen() {
    const router = useRouter();

    // ----- Global State -----
    const [view, setView] = useState("login"); // 'login' | 'register'
    const [mobile, setMobile] = useState("");
    const [mobileError, setMobileError] = useState("");

    // ----- Login State -----
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [otpError, setOtpError] = useState("");
    const [timer, setTimer] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const otpRefs = useRef([]);

    // ----- Registration State -----
    const [regTab, setRegTab] = useState("customer"); // 'customer' | 'distributor'
    const canvasRef = useRef(null);

    // Customer
    const [custSuccess, setCustSuccess] = useState(false);

    // Distributor
    const [distStep, setDistStep] = useState(1);
    const [sponsorVerified, setSponsorVerified] = useState(false);
    const [distSuccess, setDistSuccess] = useState(false);

    // ----- OTP Timer Effect -----
    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // ----- Canvas Animation Effect (Runs only on registration view) -----
    useEffect(() => {
        if (view !== "register") return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const parent = canvas.parentElement;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w, h, dpr;
        let nodes = [];
        const NODE_COUNT = 22;
        const LINK_DIST = 130;
        let animationFrameId;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = parent.clientWidth;
            h = parent.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const makeNodes = () => {
            nodes = [];
            for (let i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.16,
                    vy: (Math.random() - 0.5) * 0.16,
                    r: Math.random() < 0.16 ? 3.4 : 1.8,
                });
            }
        };

        const step = () => {
            ctx.clearRect(0, 0, w, h);
            // links
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        const alpha = (1 - dist / LINK_DIST) * 0.35;
                        ctx.strokeStyle = `rgba(255, 199, 44, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }
            // nodes
            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = n.r > 3 ? "#ffc72c" : "rgba(238,242,251,0.75)";
                ctx.fill();

                if (!reduceMotion) {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > w) n.vx *= -1;
                    if (n.y < 0 || n.y > h) n.vy *= -1;
                }
            });
            if (!reduceMotion) animationFrameId = requestAnimationFrame(step);
        };

        resize();
        makeNodes();
        step();

        const handleResize = () => {
            resize();
            makeNodes();
            if (reduceMotion) step();
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [view]);

    // ----- Login Logic -----
    const handleGetOTP = (e) => {
        e?.preventDefault();
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            setMobileError("Enter a valid 10-digit mobile number.");
            return;
        }
        setMobileError("");
        setIsSubmitting(true);

        // Simulate API Call
        setTimeout(() => {
            setIsSubmitting(false);
            setOtpSent(true);
            setTimer(30);
            setOtp(Array(6).fill(""));

            // Focus first OTP field
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }, 1200);
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const currentOtp = otp.join("");
        if (currentOtp.length !== 6) {
            setOtpError("Enter the full 6-digit OTP.");
            return;
        }
        setOtpError("");
        setIsSubmitting(true);

        // Simulate OTP Verification
        setTimeout(() => {
            setIsSubmitting(false);
            // Here you would redirect based on API response (existing user vs new user)
            // For this demo, we assume they are a new user and route them to registration
            setView("register");
        }, 900);
    };

    const handleOtpChange = (index, value) => {
        const val = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Move to next input automatically
        if (val && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasteData) return;

        const newOtp = [...otp];
        pasteData.split("").forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pasteData.length, 5);
        otpRefs.current[nextIndex]?.focus();
    };

    const maskMobile = (num) => (num ? num.slice(0, 5) + "•••••" + num.slice(-2) : "");

    return (
        <>
            {/* --- Raw CSS Injection for 1:1 Styling Match --- */}
            <style dangerouslySetInnerHTML={{
                __html: `
          :root {
            --gold: #ffc72c; --gold-deep: #e2a30f; --gold-pale: #ffedb0; --gold-wash: #fff8e6;
            --navy: #003da5; --navy-deep: #002a73; --navy-darker: #001438;
            --ink: #333f48; --ink-soft: #5c6771;
            --paper: #fffcf5; --surface: #ffffff;
            --line: #ebe2c9; --line-strong: #ddcf9f;
            --text-muted: #7a7561;
            --leaf: #1f8a56; --leaf-wash: #e4f5ec;
            --rose: #c4432b; --rose-wash: #fbeae5;
            --radius: 18px; --radius-sm: 11px;
            --shadow-card: 0 1px 2px rgba(0, 33, 92, 0.04), 0 30px 60px -30px rgba(0, 33, 92, 0.35);
            --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
            --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          * { box-sizing: border-box; }
          .auth-wrapper {
            background: var(--paper); color: var(--ink);
            font-family: "Lato", system-ui, sans-serif;
            -webkit-font-smoothing: antialiased;
            min-height: 100vh;
            background-image: radial-gradient(circle at 8% 0%, rgba(255, 199, 44, 0.16), transparent 42%),
                              radial-gradient(circle at 100% 12%, rgba(0, 61, 165, 0.07), transparent 38%);
            position: relative;
          }
          ::selection { background: var(--gold-pale); }
          
          /* Animations */
          @keyframes riseIn {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.94); }
            to { opacity: 1; transform: scale(1); }
          }
          .stagger > * { animation: riseIn 0.6s var(--ease-out) both; }
          .stagger > *:nth-child(1) { animation-delay: 0.02s; }
          .stagger > *:nth-child(2) { animation-delay: 0.08s; }
          .stagger > *:nth-child(3) { animation-delay: 0.14s; }
          .stagger > *:nth-child(4) { animation-delay: 0.2s; }
          
          .page { max-width: 1120px; margin: 0 auto; padding: 30px 20px 80px; }
          .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; animation: fadeScaleIn 0.7s var(--ease-out) both; }
          .topbar img { height: 50px; width: auto; object-fit: contain; filter: drop-shadow(0 6px 14px rgba(255, 199, 44, 0.35)); }
          .topbar-tag {
            font-family: "Arimo", sans-serif; font-size: 11.5px; font-weight: 700;
            letter-spacing: 0.14em; text-transform: uppercase; color: var(--navy);
            padding: 5px 11px; border: 1.5px solid var(--navy); border-radius: 999px; opacity: 0.85;
          }

          /* Shell & Context */
          .shell {
            display: grid; grid-template-columns: 0.86fr 1.14fr; gap: 0;
            background: var(--surface); border: 1px solid var(--line); border-radius: 22px;
            box-shadow: var(--shadow-card); overflow: hidden; min-height: 660px;
            animation: riseIn 0.55s var(--ease-out) both;
          }
          @media (max-width: 860px) { .shell { grid-template-columns: 1fr; } }
          
          .context {
            background: radial-gradient(130% 150% at 100% 0%, #0a4fc4 0%, var(--navy) 42%, var(--navy-deep) 78%, var(--navy-darker) 100%);
            color: #eef2fb; padding: 46px 40px 34px; position: relative; overflow: hidden; display: flex; flex-direction: column;
          }
          .context canvas { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.9; }
          .context-glow {
            position: absolute; inset: auto -25% -35% auto; width: 380px; height: 380px;
            border-radius: 50%; background: radial-gradient(circle, rgba(255, 199, 44, 0.4) 0%, rgba(255, 199, 44, 0) 68%);
            pointer-events: none;
          }
          .context-content { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; }
          .context-eyebrow {
            font-family: "Arimo", sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
            text-transform: uppercase; color: var(--gold); margin-bottom: 16px; display: inline-flex; align-items: center; gap: 8px;
          }
          .context-eyebrow::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 0 4px rgba(255, 199, 44, 0.22); }
          .context-head { font-family: "Arimo", sans-serif; font-size: 31px; line-height: 1.16; font-weight: 800; letter-spacing: -0.01em; margin: 0 0 14px; max-width: 21ch; }
          .context-sub { font-size: 14.5px; line-height: 1.62; color: #c3cdea; max-width: 33ch; margin: 0 0 30px; }
          .context-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
          .context-list li { display: flex; gap: 14px; padding: 13px 0; border-top: 1px solid rgba(238, 242, 251, 0.14); font-size: 13.5px; line-height: 1.5; color: #dbe2f5; }
          .context-list li:last-child { border-bottom: 1px solid rgba(238, 242, 251, 0.14); }
          .node-num {
            font-family: "Arimo", sans-serif; font-size: 11.5px; font-weight: 700; color: var(--navy-deep);
            background: var(--gold); flex-shrink: 0; width: 21px; height: 21px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          }
          .context-foot { margin-top: auto; padding-top: 24px; font-size: 12px; color: #93a0c7; }
          .context-foot b { color: #eef2fb; font-weight: 700; }

          /* Form Styles */
          .formside { padding: 46px 44px 40px; display: flex; flex-direction: column; }
          @media (max-width: 520px) { .formside { padding: 30px 22px 36px; } .context { padding: 34px 26px 26px; } }
          
          .tabs { position: relative; display: inline-flex; background: var(--gold-wash); border: 1px solid var(--line); border-radius: 999px; padding: 4px; gap: 2px; margin-bottom: 30px; width: fit-content; }
          .tab { position: relative; z-index: 1; appearance: none; border: none; background: transparent; font-family: "Arimo", sans-serif; font-size: 13.5px; font-weight: 700; color: var(--ink-soft); padding: 9px 22px; border-radius: 999px; cursor: pointer; transition: color 0.25s ease; }
          .tab[aria-selected="true"] { color: #fff9ea; background: var(--navy); box-shadow: 0 6px 16px -6px rgba(0, 42, 115, 0.55); }
          .tab:not([aria-selected="true"]):hover { color: var(--ink); }
          
          .title { font-family: "Arimo", sans-serif; font-size: 27px; font-weight: 800; margin: 0 0 6px; letter-spacing: -0.01em; }
          .lede { font-size: 14px; color: var(--text-muted); margin: 0 0 28px; line-height: 1.55; }
          
          form { display: flex; flex-direction: column; gap: 18px; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          @media (max-width: 480px) { .row { grid-template-columns: 1fr; } }
          
          .field { display: flex; flex-direction: column; gap: 6px; }
          .field label { font-family: "Arimo", sans-serif; font-size: 12.5px; font-weight: 700; color: var(--ink); }
          .input {
            font-family: "Lato", inherit; font-size: 14.5px; padding: 12px 13px; border: 1.5px solid var(--line-strong);
            border-radius: var(--radius-sm); background: #fff; color: var(--ink); outline: none; width: 100%; transition: all 0.15s ease;
          }
          .input:focus { border-color: var(--navy); box-shadow: 0 0 0 4px rgba(0, 61, 165, 0.12); }
          .input.error { border-color: var(--rose); }
          .input:read-only { background: var(--gold-wash); color: var(--ink-soft); cursor: not-allowed; }
          .error-msg { font-size: 12px; color: var(--rose); min-height: 14px; font-weight: 600; }
          .hint { font-size: 11.5px; color: var(--text-muted); font-weight: 400; }
          
          .phone-input { display: flex; gap: 8px; }
          .phone-prefix {
            flex-shrink: 0; display: flex; align-items: center; padding: 0 13px; border: 1.5px solid var(--line-strong);
            border-radius: var(--radius-sm); font-family: "Arimo", sans-serif; font-size: 14px; font-weight: 700;
            color: var(--navy); background: var(--gold-wash);
          }
          
          .otp-row { display: flex; gap: 9px; }
          .otp-box {
            width: 44px; height: 52px; text-align: center; font-family: "Arimo", sans-serif; font-size: 20px; font-weight: 700;
            border: 1.5px solid var(--line-strong); border-radius: var(--radius-sm); color: var(--navy-deep); outline: none;
            transition: all 0.15s ease;
          }
          .otp-box:focus { border-color: var(--navy); box-shadow: 0 0 0 4px rgba(0, 61, 165, 0.12); transform: translateY(-1px); }
          .otp-box.filled { border-color: var(--navy); background: var(--gold-wash); }
          @media (max-width: 380px) { .otp-box { width: 38px; height: 46px; font-size: 17px; } }
          
          .actions { display: flex; gap: 10px; margin-top: 6px; align-items: center; }
          .btn {
            font-family: "Arimo", sans-serif; font-size: 14.5px; font-weight: 700; padding: 14px 22px;
            border-radius: var(--radius-sm); border: none; cursor: pointer; transition: all 0.18s ease; position: relative;
          }
          .btn-primary { background: var(--navy); color: #fff9ea; flex: 1; box-shadow: 0 10px 22px -10px rgba(0, 42, 115, 0.55); }
          .btn-primary:hover { background: #0048bd; transform: translateY(-1px); box-shadow: 0 14px 26px -10px rgba(0, 42, 115, 0.6); }
          .btn-primary:active { transform: translateY(0px) scale(0.99); }
          .btn-primary:disabled { background: var(--line-strong); color: #fff; cursor: not-allowed; box-shadow: none; transform: none; }
          
          .switch-line { font-size: 13px; color: var(--text-muted); text-align: center; margin-top: 4px; }
          .switch-line a, .switch-line button { background: none; border: none; padding:0; cursor:pointer; color: var(--navy); font-weight: 700; text-decoration: none; border-bottom: 1.5px solid var(--gold); }
          
          /* Progress Rail */
          .rail { display: flex; align-items: center; margin-bottom: 30px; }
          .rail-step { display: flex; align-items: center; gap: 8px; font-family: "Arimo", sans-serif; font-size: 12px; font-weight: 700; color: var(--line-strong); }
          .rail-dot { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--line-strong); display: flex; align-items: center; justify-content: center; font-size: 11px; color: var(--text-muted); background: #fff; flex-shrink: 0; transition: all 0.35s var(--ease-spring); }
          .rail-step.done .rail-dot { background: var(--navy); border-color: var(--navy); color: #fff; transform: scale(1.02); }
          .rail-step.active .rail-dot { background: var(--gold); border-color: var(--gold); color: var(--navy-deep); box-shadow: 0 0 0 5px var(--gold-wash); transform: scale(1.08); }
          .rail-step.active { color: var(--ink); }
          .rail-step.done { color: var(--ink-soft); }
          .rail-line { flex: 1; height: 2px; background: var(--line-strong); margin: 0 6px; position: relative; border-radius: 2px; }
          .rail-line::after { content: ""; position: absolute; inset: 0; width: 0%; background: linear-gradient(90deg, var(--navy), var(--gold)); transition: width 0.5s var(--ease-out); }
          .rail-line.done::after { width: 100%; }
          
          /* Login Specific */
          .login-container { max-width: 460px; margin: 40px auto 0; padding: 0 20px; position: relative; }
          .login-blob {
            position: absolute; top: -70px; right: -60px; width: 220px; height: 220px; border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 199, 44, 0.5), rgba(255, 199, 44, 0) 70%);
            pointer-events: none; z-index: 0; animation: driftGlow 9s ease-in-out infinite;
          }
          @keyframes driftGlow { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-14px, 16px) scale(1.08); } }
          .login-box { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 36px 32px; box-shadow: var(--shadow-card); position: relative; z-index: 1; animation: riseIn 0.5s var(--ease-out) both; }
          .login-mark { width: 52px; height: 52px; border-radius: 15px; background: linear-gradient(135deg, var(--gold), var(--gold-deep)); display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; box-shadow: 0 12px 22px -10px rgba(226, 163, 15, 0.6); animation: fadeScaleIn 0.6s var(--ease-spring) both; }
          
          /* Verified Banner */
          .registration-banner { background: var(--leaf-wash); border: 1px solid var(--leaf); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink); animation: riseIn 0.4s var(--ease-out) both; }
          .registration-banner svg { flex-shrink: 0; color: var(--leaf); }
          .verified-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--leaf-wash); color: var(--leaf); font-family: "Arimo", sans-serif; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 999px; border: 1px solid var(--leaf); }

          .success { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; padding-top: 8px; animation: riseIn 0.45s var(--ease-out) both; }
          .success-badge { width: 56px; height: 56px; border-radius: 16px; background: var(--leaf-wash); display: flex; align-items: center; justify-content: center; }
          
          .checkline { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--text-muted); line-height: 1.5; padding-top: 4px; }
          .checkline input { margin-top: 3px; accent-color: var(--navy); flex-shrink: 0; }
          
          .btn-ghost { background: transparent; color: var(--ink-soft); border: 1.5px solid var(--line-strong); }
          .btn-ghost:hover { border-color: var(--navy); color: var(--navy); }
          
          .leg-options { display: flex; gap: 10px; flex-wrap: wrap; }
          .leg-opt { flex: 1; min-width: 130px; border: 1.5px solid var(--line-strong); border-radius: var(--radius-sm); padding: 13px 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; }
          .leg-opt:hover { transform: translateY(-1px); }
          .leg-opt.checked { border-color: var(--navy); background: var(--gold-wash); }
          
          .sponsor-row { display: flex; gap: 8px; }
          .sponsor-row .input { flex: 1; }
          .btn-inline { flex-shrink: 0; font-family: "Arimo", sans-serif; font-size: 13px; font-weight: 700; padding: 0 18px; border-radius: var(--radius-sm); border: 1.5px solid var(--navy); background: #fff; color: var(--navy); cursor: pointer; }
          .btn-inline:hover { background: var(--navy); color: #fff; }
        `
            }} />

            <div className="auth-wrapper">
                <div className="page">

                    {/* Topbar */}
                    <div className="topbar">
                        <img style={{ height: '50px', width: '50px' }} src="../../../../public/images/logo.png" alt="Indiekonnect logo" />
                       
                    </div>

                    {/* ================= LOGIN VIEW ================= */}
                    {view === "login" && (
                        <div className="login-container">
                            <div className="login-blob"></div>
                            <div className="login-box stagger">
                                <div className="login-mark">
                                    {/* Decorative Icon inside gradient box */}
                                </div>
                                <h1 className="title" style={{ textAlign: 'center' }}>Welcome back</h1>
                                <p className="lede" style={{ textAlign: 'center' }}>
                                    Enter your mobile number to receive a one-time password.
                                </p>

                                <form noValidate onSubmit={otpSent ? handleVerifyOTP : handleGetOTP}>
                                    <div className="field">
                                        <label htmlFor="loginMobile">Mobile number</label>
                                        <div className="phone-input">
                                            <span className="phone-prefix">+91</span>
                                            <input
                                                className={`input ${mobileError ? 'error' : ''}`}
                                                type="tel"
                                                id="loginMobile"
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                                required
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                                readOnly={otpSent}
                                            />
                                        </div>
                                        {mobileError && <span className="error-msg">{mobileError}</span>}
                                    </div>

                                    {otpSent && (
                                        <div style={{ marginTop: '4px' }}>
                                            <div className="field">
                                                <label>Enter OTP</label>
                                                <div className="otp-row" onPaste={handlePaste}>
                                                    {otp.map((digit, index) => (
                                                        <input
                                                            key={index}
                                                            ref={el => (otpRefs.current[index] = el)}
                                                            className={`otp-box ${digit ? 'filled' : ''}`}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            value={digit}
                                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        />
                                                    ))}
                                                </div>
                                                {otpError && <span className="error-msg">{otpError}</span>}
                                                <span className="hint" style={{ marginTop: '4px', display: 'block' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleGetOTP()}
                                                        disabled={timer > 0 || isSubmitting}
                                                        style={{
                                                            background: 'none', border: 'none', color: timer > 0 ? 'gray' : 'var(--navy)',
                                                            fontFamily: 'Arimo', fontWeight: 700, cursor: timer > 0 ? 'not-allowed' : 'pointer',
                                                            textDecoration: 'underline', fontSize: '12px', padding: 0
                                                        }}
                                                    >
                                                        Resend OTP
                                                    </button>
                                                    {timer > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>({timer}s)</span>}
                                                </span>
                                            </div>
                                            <div className="actions" style={{ marginTop: '12px' }}>
                                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                                    {isSubmitting ? "Verifying..." : "Verify & continue"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!otpSent && (
                                        <div className="actions" style={{ marginTop: '12px' }}>
                                            <button type="submit" className="btn btn-primary" disabled={isSubmitting || mobile.length !== 10}>
                                                {isSubmitting ? "Sending..." : "Get OTP"}
                                            </button>
                                        </div>
                                    )}

                                    <p className="switch-line" style={{ marginTop: '16px' }}>
                                        New to Indiekonnect?{" "}
                                        <button type="button" onClick={() => setView("register")}>
                                            Create account
                                        </button>
                                    </p>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ================= REGISTRATION VIEW ================= */}
                    {view === "register" && (
                        <div className="shell">
                            {/* Context Panel (Left) */}
                            <aside className="context">
                                <canvas ref={canvasRef}></canvas>
                                <div className="context-glow"></div>
                                <div className="context-content stagger">
                                    <div className="context-eyebrow">
                                        {regTab === "customer" ? "Retail account" : "Distributor application"}
                                    </div>
                                    <h2 className="context-head">
                                        {regTab === "customer" ? "Complete your registration" : "Become a distributor with Indiekonnect"}
                                    </h2>
                                    <p className="context-sub">
                                        {regTab === "customer"
                                            ? "Your mobile number is already verified. Just fill in your details to get started."
                                            : "Complete all steps to start building your network. Mobile is already verified."}
                                    </p>

                                    <ul className="context-list">
                                        {regTab === "customer" ? (
                                            <>
                                                <li><span className="node-num">1</span><span>Enter your name and email.</span></li>
                                                <li><span className="node-num">2</span><span>Agree to terms & conditions.</span></li>
                                                <li><span className="node-num">3</span><span>Create your account instantly!</span></li>
                                            </>
                                        ) : (
                                            <>
                                                <li><span className="node-num">1</span><span>Personal details (mobile verified).</span></li>
                                                <li><span className="node-num">2</span><span>Sponsor and placement preferences.</span></li>
                                                <li><span className="node-num">3</span><span>Identity and bank verification.</span></li>
                                                <li><span className="node-num">4</span><span>Submit and await admin review.</span></li>
                                            </>
                                        )}
                                    </ul>

                                    <div className="context-foot">
                                        Already registered? <b style={{ cursor: 'pointer' }} onClick={() => setView('login')}>Sign in with OTP</b> from the login screen.
                                    </div>
                                </div>
                            </aside>

                            {/* Form Panel (Right) */}
                            <div className="formside">
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                                    {/* Verified Banner */}
                                    <div className="registration-banner">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        <span>
                                            Mobile number <strong>+91 {maskMobile(mobile || "9876543210")}</strong> has been verified via OTP
                                        </span>
                                    </div>

                                    {/* Tabs */}
                                    {!(custSuccess || distSuccess) && (
                                        <div className="tabs" role="tablist">
                                            <button
                                                className="tab"
                                                role="tab"
                                                aria-selected={regTab === "customer"}
                                                onClick={() => { setRegTab("customer"); setDistStep(1); }}
                                            >
                                                Customer
                                            </button>
                                            <button
                                                className="tab"
                                                role="tab"
                                                aria-selected={regTab === "distributor"}
                                                onClick={() => setRegTab("distributor")}
                                            >
                                                Distributor
                                            </button>
                                        </div>
                                    )}

                                    {/* ---------- CUSTOMER FLOW ---------- */}
                                    {regTab === "customer" && !custSuccess && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                            <div>
                                                <h1 className="title">Create your customer account</h1>
                                                <p className="lede">Your mobile is verified. Fill in your details to complete registration.</p>
                                            </div>
                                            <form noValidate onSubmit={(e) => { e.preventDefault(); setCustSuccess(true); }}>
                                                <div className="field">
                                                    <label>Full name</label>
                                                    <input className="input" type="text" placeholder="As you'd like it on your orders" required />
                                                </div>
                                                <div className="field">
                                                    <label>Email address</label>
                                                    <input className="input" type="email" placeholder="you@example.com" required />
                                                </div>
                                                <div className="field">
                                                    <label>Mobile number</label>
                                                    <div className="phone-input">
                                                        <span className="phone-prefix">+91</span>
                                                        <input className="input" type="tel" value={mobile} readOnly required />
                                                    </div>
                                                    <span className="hint">✓ Verified via OTP on login. This cannot be changed.</span>
                                                </div>
                                                <label className="checkline">
                                                    <input type="checkbox" required />
                                                    <span>I agree to the <Link href="#">Terms of Use</Link> and <Link href="#">Privacy Policy</Link>.</span>
                                                </label>
                                                <div className="actions">
                                                    <button type="submit" className="btn btn-primary">Create account</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}

                                    {regTab === "customer" && custSuccess && (
                                        <div className="success">
                                            <div className="success-badge">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" width="26" height="26">
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            </div>
                                            <h2 className="title" style={{ marginTop: '10px' }}>Registration complete!</h2>
                                            <p className="lede" style={{ marginBottom: '10px' }}>Your account has been created successfully. You can now start shopping.</p>
                                            <button type="button" className="btn btn-primary" onClick={() => router.push("/")}>
                                                Go to dashboard
                                            </button>
                                        </div>
                                    )}

                                    {/* ---------- DISTRIBUTOR FLOW ---------- */}
                                    {regTab === "distributor" && !distSuccess && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                            {/* Rail */}
                                            <div className="rail">
                                                <div className={`rail-step ${distStep === 1 ? 'active' : 'done'}`}>
                                                    <span className="rail-dot">1</span><span>Details</span>
                                                </div>
                                                <div className={`rail-line ${distStep > 1 ? 'done' : ''}`}></div>
                                                <div className={`rail-step ${distStep === 2 ? 'active' : (distStep > 2 ? 'done' : '')}`}>
                                                    <span className="rail-dot">2</span><span>Sponsor</span>
                                                </div>
                                                <div className={`rail-line ${distStep > 2 ? 'done' : ''}`}></div>
                                                <div className={`rail-step ${distStep === 3 ? 'active' : ''}`}>
                                                    <span className="rail-dot">3</span><span>KYC</span>
                                                </div>
                                            </div>

                                            {/* Step 1 */}
                                            {distStep === 1 && (
                                                <form noValidate onSubmit={(e) => { e.preventDefault(); setDistStep(2); }}>
                                                    <h1 className="title">Start your application</h1>
                                                    <p className="lede">You must be 18 or over to apply.</p>
                                                    <div className="field">
                                                        <label>Full name</label>
                                                        <input className="input" type="text" placeholder="As per your ID documents" required />
                                                    </div>
                                                    <div className="row">
                                                        <div className="field">
                                                            <label>Date of birth</label>
                                                            <input className="input" type="date" required />
                                                        </div>
                                                        <div className="field">
                                                            <label>Email address</label>
                                                            <input className="input" type="email" placeholder="you@example.com" required />
                                                        </div>
                                                    </div>
                                                    <div className="field">
                                                        <label>Mobile number</label>
                                                        <div className="phone-input">
                                                            <span className="phone-prefix">+91</span>
                                                            <input className="input" type="tel" value={mobile} readOnly required />
                                                        </div>
                                                    </div>
                                                    <div className="actions" style={{ marginTop: '20px' }}>
                                                        <button type="submit" className="btn btn-primary">Continue</button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Step 2 */}
                                            {distStep === 2 && (
                                                <form noValidate onSubmit={(e) => { e.preventDefault(); setDistStep(3); }}>
                                                    <h1 className="title">Sponsor & placement</h1>
                                                    <p className="lede">Leave blank if you don't have a sponsor.</p>

                                                    <div className="field">
                                                        <label>Sponsor ID <span style={{ fontWeight: 400, color: 'gray' }}>(optional)</span></label>
                                                        <div className="sponsor-row">
                                                            <input className="input" type="text" placeholder="e.g. IK-104822" />
                                                            <button type="button" className="btn-inline" onClick={() => setSponsorVerified(true)}>Verify</button>
                                                        </div>
                                                        {sponsorVerified && (
                                                            <div style={{ color: 'var(--leaf)', fontWeight: 700, fontSize: '13px', marginTop: '6px' }}>
                                                                ✓ Sponsor confirmed: Anita Sharma
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="field" style={{ marginTop: '10px' }}>
                                                        <label>Placement leg</label>
                                                        <div className="leg-options">
                                                            <label className="leg-opt checked"><input type="radio" name="leg" defaultChecked /><span>Auto</span></label>
                                                            <label className="leg-opt"><input type="radio" name="leg" /><span>Left</span></label>
                                                            <label className="leg-opt"><input type="radio" name="leg" /><span>Right</span></label>
                                                        </div>
                                                    </div>

                                                    <label className="checkline">
                                                        <input type="checkbox" required />
                                                        <span>I agree to the Distributor Agreement.</span>
                                                    </label>

                                                    <div className="actions" style={{ marginTop: '20px' }}>
                                                        <button type="button" className="btn btn-ghost" onClick={() => setDistStep(1)}>Back</button>
                                                        <button type="submit" className="btn btn-primary">Continue</button>
                                                    </div>
                                                </form>
                                            )}

                                            {/* Step 3 */}
                                            {distStep === 3 && (
                                                <form noValidate onSubmit={(e) => { e.preventDefault(); setDistSuccess(true); }}>
                                                    <h1 className="title">Identity & bank details</h1>
                                                    <p className="lede">Provide details for commission payouts.</p>

                                                    <div className="field">
                                                        <label>Aadhaar number</label>
                                                        <input className="input" type="text" placeholder="[Aadhaar Redacted]" maxLength="12" required />
                                                    </div>
                                                    <label className="checkline" style={{ marginBottom: '12px' }}>
                                                        <input type="checkbox" required />
                                                        <span>I consent to verification for fraud prevention.</span>
                                                    </label>

                                                    <div className="field">
                                                        <label>PAN number</label>
                                                        <input className="input" type="text" placeholder="10-character PAN" maxLength="10" required />
                                                    </div>

                                                    <div style={{ fontFamily: 'Arimo', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--navy)', marginTop: '15px', marginBottom: '5px' }}>
                                                        Bank account details
                                                    </div>
                                                    <div className="field">
                                                        <label>Account holder name</label>
                                                        <input className="input" type="text" placeholder="Exactly as per PAN/Bank records" required />
                                                    </div>
                                                    <div className="row">
                                                        <div className="field">
                                                            <label>Account number</label>
                                                            <input className="input" type="password" placeholder="Account number" required />
                                                        </div>
                                                        <div className="field">
                                                            <label>IFSC code</label>
                                                            <input className="input" type="text" placeholder="e.g. HDFC0001234" required />
                                                        </div>
                                                    </div>

                                                    <div className="actions" style={{ marginTop: '20px' }}>
                                                        <button type="button" className="btn btn-ghost" onClick={() => setDistStep(2)}>Back</button>
                                                        <button type="submit" className="btn btn-primary">Submit Application</button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    )}

                                    {regTab === "distributor" && distSuccess && (
                                        <div className="success">
                                            <div className="success-badge" style={{ background: 'var(--gold-wash)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold-deep)" strokeWidth="2.4" width="26" height="26">
                                                    <path d="M12 8v4l3 3" />
                                                    <circle cx="12" cy="12" r="9" />
                                                </svg>
                                            </div>
                                            <span style={{ fontFamily: 'Arimo', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', background: 'var(--gold-wash)', color: 'var(--gold-deep)', padding: '5px 11px', borderRadius: '999px', marginTop: '10px' }}>
                                                Status: Draft submitted
                                            </span>
                                            <h2 className="title" style={{ marginTop: '10px' }}>Application submitted successfully</h2>
                                            <p className="lede" style={{ marginBottom: '10px' }}>Your identity documents and bank details have been forwarded for KYC verification.</p>
                                            <button type="button" className="btn btn-primary" onClick={() => router.push("/")}>
                                                Return to dashboard
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
'use client';

import React, { useEffect, useRef } from 'react';

interface ContextPanelProps {
    tab: 'customer' | 'distributor';
    onSwitchTab: (tab: 'customer' | 'distributor') => void;
    onViewChange: (view: 'login') => void;
}

export default function ContextPanel({ tab, onSwitchTab, onViewChange }: ContextPanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const parent = canvas.parentElement;
        if (!parent) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let w: number, h: number, dpr: number;
        let nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];
        const NODE_COUNT = 22;
        const LINK_DIST = 130;
        let animationFrameId: number;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = parent.clientWidth;
            h = parent.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
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

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
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

            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = n.r > 3 ? '#ffc72c' : 'rgba(238,242,251,0.75)';
                ctx.fill();

                if (!reduceMotion) {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > w) n.vx *= -1;
                    if (n.y < 0 || n.y > h) n.vy *= -1;
                }
            });

            if (!reduceMotion) {
                animationFrameId = requestAnimationFrame(step);
            }
        };

        resize();
        makeNodes();
        step();

        const handleResize = () => {
            resize();
            makeNodes();
            if (reduceMotion) step();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <aside className="relative bg-gradient-to-br from-[#0a4fc4] via-[#003da5] to-[#001438] text-[#eef2fb] p-[46px_40px_34px] overflow-hidden flex flex-col">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90"></canvas>
            <div className="absolute inset-auto -right-1/4 -bottom-[35%] w-[380px] h-[380px] rounded-full bg-radial-gradient from-[rgba(255,199,44,0.4)] to-[rgba(255,199,44,0)] pointer-events-none"></div>

            <div className="relative z-[2] flex flex-col h-full stagger">
                <div className="flex items-center gap-2 font-['Arimo',sans-serif] text-[11px] font-bold tracking-[0.16em] uppercase text-[#ffc72c] mb-4">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#ffc72c] shadow-[0_0_0_4px_rgba(255,199,44,0.22)]"></span>
                    {tab === 'customer' ? 'Retail account' : 'Distributor application'}
                </div>

                <h2 className="font-['Arimo',sans-serif] text-[31px] leading-[1.16] font-extrabold tracking-[-0.01em] m-0 mb-3.5 max-w-[21ch]">
                    {tab === 'customer'
                        ? 'Complete your registration'
                        : 'Become a distributor with Indiekonnect'}
                </h2>

                <p className="text-[14.5px] leading-[1.62] text-[#c3cdea] max-w-[33ch] m-0 mb-[30px]">
                    {tab === 'customer'
                        ? 'Your mobile number is already verified. Just fill in your details to get started.'
                        : 'Complete all steps to start building your network. Mobile is already verified.'}
                </p>

                <ul className="list-none m-0 p-0 flex flex-col">
                    {tab === 'customer' ? (
                        <>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">1</span>
                                <span>Enter your name and email.</span>
                            </li>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">2</span>
                                <span>Agree to terms & conditions.</span>
                            </li>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">3</span>
                                <span>Create your account instantly!</span>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">1</span>
                                <span>Personal details (mobile verified).</span>
                            </li>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">2</span>
                                <span>Sponsor and placement preferences.</span>
                            </li>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">3</span>
                                <span>Identity and bank verification.</span>
                            </li>
                            <li className="flex gap-3.5 py-[13px] border-t border-[rgba(238,242,251,0.14)] text-[13.5px] leading-[1.5] text-[#dbe2f5] last:border-b">
                                <span className="font-['Arimo',sans-serif] text-[11.5px] font-bold text-[#002a73] bg-[#ffc72c] flex-shrink-0 w-[21px] h-[21px] rounded-full flex items-center justify-center">4</span>
                                <span>Submit and await admin review.</span>
                            </li>
                        </>
                    )}
                </ul>

                <div className="mt-auto pt-6 text-xs text-[#93a0c7]">
                    Already registered?{' '}
                    <b className="text-[#eef2fb] font-bold cursor-pointer" onClick={() => onViewChange('login')}>
                        Sign in with OTP
                    </b>{' '}
                    from the login screen.
                </div>
            </div>
        </aside>
    );
}
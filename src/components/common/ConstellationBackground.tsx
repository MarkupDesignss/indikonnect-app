// components/common/ConstellationBackground.tsx

"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

interface ConstellationPoint {
    id: number;
    x: number;
    y: number;
    size: number;
    pulseDelay: number;
    pulseDuration: number;
    glowIntensity: number;
    connections: number[];
    isMainStar?: boolean;
    beamHeight?: number;
}

interface ConstellationBackgroundProps {
    className?: string;
    starColor?: string;
    connectionColor?: string;
    // Legacy callers pass these options. Keep compatibility with the existing visual implementation.
    starCount?: number;
    connectionDistance?: number;
    animationSpeed?: number;
    showParticles?: boolean;
    particleCount?: number;
    showShootingStars?: boolean;
    shootingStarCount?: number;
    glowIntensity?: number;
    interactive?: boolean;
    onStarClick?: (starId: number) => void;
}

function buildConstellation(): ConstellationPoint[] {
    // Deterministic pseudo-random sequence keeps SSR and browser hydration aligned.
    let seed = 19391;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
        const newPoints: ConstellationPoint[] = [];

        // 1. DEFINE SAPTRISHI (CENTER) - Spreads from 30% to 70%
        const saptrishiShape = [
            { x: 35, y: 35 }, { x: 45, y: 30 }, { x: 55, y: 38 },
            { x: 60, y: 50 }, { x: 72, y: 55 }, { x: 82, y: 48 }, { x: 90, y: 42 }
        ];

        // Add the 7 main golden stars
        saptrishiShape.forEach((pos, index) => {
            newPoints.push({
                id: index,
                x: pos.x + (random() - 0.5) * 1.5,
                y: pos.y + (random() - 0.5) * 1.5,
                size: 4.5 + random() * 2.5,
                pulseDelay: random() * 2,
                pulseDuration: 2 + random(),
                glowIntensity: 1,
                connections: [],
                isMainStar: true,
                beamHeight: 30 + random() * 40,
            });
        });

        // 2. GENERATE SIDE & FULL SCREEN NODES
        const totalNodes = 120;
        for (let i = 7; i < totalNodes; i++) {
            let x = random() * 100;
            let y = random() * 100;

            if (i < 20) {
                x = random() * 10;
                y = random() * 100;
            } else if (i < 40) {
                x = 90 + random() * 10;
                y = random() * 100;
            }

            newPoints.push({
                id: i,
                x: Math.max(1, Math.min(99, x)),
                y: Math.max(1, Math.min(99, y)),
                size: 1.2 + random() * 2,
                pulseDelay: random() * 3,
                pulseDuration: 2.5 + random() * 3,
                glowIntensity: 0.3 + random() * 0.5,
                connections: [],
                isMainStar: false,
            });
        }

        // 3. CREATE CONNECTIONS (Network Lines)
        // Connect the 7 Saptrishi stars to each other
        for (let i = 0; i < 6; i++) {
            if (!newPoints[i].connections.includes(i + 1)) {
                newPoints[i].connections.push(i + 1);
            }
        }

        // Connect EVERY node to nearby nodes
        for (let i = 0; i < newPoints.length; i++) {
            for (let j = i + 1; j < newPoints.length; j++) {
                const dx = newPoints[i].x - newPoints[j].x;
                const dy = newPoints[i].y - newPoints[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 20 && random() < 0.4) {
                    // Avoid duplicate connections
                    if (!newPoints[i].connections.includes(j)) {
                        newPoints[i].connections.push(j);
                    }
                }
            }
        }

        return newPoints;
}

const ConstellationBackground: React.FC<ConstellationBackgroundProps> = ({
    className = "",
    starColor = "#F9C744",
    connectionColor = "#4FC3F7",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [animation, setAnimation] = useState(() => ({ points: buildConstellation(), time: 0 }));
    const { points, time } = animation;

    // Animation state is published only from a browser animation callback.
    useEffect(() => {
        let frame = 0;
        let previous = 0;
        let time = 0;
        const animate = (now: number) => {
            if (now - previous >= 1000 / 30) {
                previous = now;
                time += 0.02;
                const nextTime = time;
                setAnimation(prev => ({
                    time: nextTime,
                    points: prev.points.map(point => ({
                        ...point,
                        x: point.x + Math.sin(nextTime * 0.2 + point.id) * 0.02,
                        y: point.y + Math.cos(nextTime * 0.15 + point.id) * 0.02,
                    })),
                }));
            }
            frame = requestAnimationFrame(animate);
        };
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            frame = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(frame);
    }, []);

    // Calculate opacity for lines
    const getConnectionOpacity = (p1: ConstellationPoint, p2: ConstellationPoint) => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 25;
        const opacity = Math.max(0, 1 - (distance / maxDist));
        const pulse = 0.6 + 0.4 * Math.sin(time * 0.8 + p1.id + p2.id);
        return opacity * pulse * 0.6;
    };

    // Generate unique connection keys using Set to avoid duplicates
    const getConnectionKey = (pointId: number, targetId: number) => {
        return `conn-${Math.min(pointId, targetId)}-${Math.max(pointId, targetId)}`;
    };

    // Collect all unique connections
    const uniqueConnections = useMemo(() => {
        const connSet = new Set<string>();
        const conns: Array<{ source: ConstellationPoint; target: ConstellationPoint }> = [];

        const pointById = new Map(points.map(point => [point.id, point]));
        points.forEach((point) => {
            point.connections.forEach((targetId) => {
                const target = pointById.get(targetId);
                if (target) {
                    const key = getConnectionKey(point.id, targetId);
                    if (!connSet.has(key)) {
                        connSet.add(key);
                        conns.push({ source: point, target });
                    }
                }
            });
        });

        return conns;
    }, [points]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-[#060d1a] ${className}`}
        >
            {/* Deep space glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(79,195,247,0.05)_0%,_transparent_70%)]" />

            {/* Connection Lines (Network) - Using unique connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {uniqueConnections.map(({ source, target }) => {
                    const opacity = getConnectionOpacity(source, target);
                    const isMainConnection = source.isMainStar && target.isMainStar;
                    return (
                        <line
                            key={getConnectionKey(source.id, target.id)}
                            x1={`${source.x}%`}
                            y1={`${source.y}%`}
                            x2={`${target.x}%`}
                            y2={`${target.y}%`}
                            stroke={isMainConnection ? starColor : connectionColor}
                            strokeWidth={isMainConnection ? 1.5 : 0.6}
                            opacity={opacity}
                            className="transition-opacity duration-500"
                        />
                    );
                })}
            </svg>

            {/* Vertical Data Beams */}
            {points.filter(p => p.isMainStar).map((point) => (
                <div
                    key={`beam-${point.id}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: '1.5px',
                        height: `${point.beamHeight}px`,
                        background: `linear-gradient(to top, transparent, ${connectionColor}40, ${starColor}80, transparent)`,
                        animation: `beam-pulse ${2 + point.pulseDelay}s ease-in-out infinite`,
                    }}
                />
            ))}

            {/* The Stars / Nodes */}
            {points.map((point) => (
                <div
                    key={`star-${point.id}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        width: `${point.size}px`,
                        height: `${point.size}px`,
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: 'translate(-50%, -50%)',
                        background: point.isMainStar
                            ? `radial-gradient(circle, #fff 0%, ${starColor} 40%, transparent 100%)`
                            : `radial-gradient(circle, ${connectionColor} 0%, transparent 100%)`,
                        boxShadow: point.isMainStar
                            ? `0 0 20px ${starColor}, 0 0 60px ${starColor}40`
                            : `0 0 6px ${connectionColor}30`,
                        animation: `pulse-node ${point.pulseDuration}s ease-in-out ${point.pulseDelay}s infinite`,
                        zIndex: point.isMainStar ? 10 : 1,
                    }}
                />
            ))}

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse-node {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                    50% { transform: translate(-50%, -50%) scale(1.6); opacity: 1; }
                }
                @keyframes beam-pulse {
                    0%, 100% { opacity: 0.2; height: 30px; }
                    50% { opacity: 1; height: 80px; }
                }
            `}</style>
        </div>
    );
};

export default ConstellationBackground;
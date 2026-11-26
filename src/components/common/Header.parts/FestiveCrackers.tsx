"use client";

import React from "react";
import { IK_FIREWORKS, IK_GLINTS } from "@/components/common/Header.parts/support";


export function FestiveCrackers() {
  return (
    <div className="ik-cracker-layer" aria-hidden="true">
      {IK_FIREWORKS.map((firework, i) => (
        <span
          key={`firework-${i}`}
          className="ik-cracker-burst"
          style={
            {
              left: firework.x,
              top: firework.y,
              "--ik-fire-color": firework.color,
              "--ik-fire-delay": firework.delay,
            } as React.CSSProperties
          }
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
          style={
            {
              "--ik-glint-x": x,
              "--ik-glint-y": y,
              "--ik-glint-delay": delay,
              "--ik-glint-time": `${2.8 + (i % 3) * 0.6}s`,
            } as React.CSSProperties
          }
        />
      ))}
      <span className="ik-cracker-lightline" />
    </div>
  );
}

"use client";

export default function ProductAnimations() {
  return (
<style jsx global>{`
        .ik-ripple {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: currentColor;
          opacity: 0.28;
          pointer-events: none;
          animation: ikRipple 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes ikRipple {
          to {
            transform: scale(15);
            opacity: 0;
          }
        }

        .ik-heart-pop {
          animation: ikHeart 0.55s cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        @keyframes ikHeart {
          0% {
            transform: scale(1);
          }

          40% {
            transform: scale(1.45);
          }

          70% {
            transform: scale(0.9);
          }

          100% {
            transform: scale(1);
          }
        }

        .ik-bump {
          animation: ikBump 0.5s cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        @keyframes ikBump {
          0% {
            transform: scale(1);
          }

          45% {
            transform: scale(1.45);
          }

          100% {
            transform: scale(1);
          }
        }

        .ik-fly-ghost {
          position: fixed;
          z-index: 9997;
          border-radius: 12px;
          pointer-events: none;
          background-size: cover;
          background-position: center;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
        }

        @media (prefers-reduced-motion: reduce) {
          .ik-ripple,
          .ik-heart-pop,
          .ik-bump {
            display: none;
            animation: none;
          }
        }
      `}</style>
  );
}

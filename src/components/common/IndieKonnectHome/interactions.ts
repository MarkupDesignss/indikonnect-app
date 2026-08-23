"use client";
import m from "./motion.module.css";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ripple on click — onClick={ripple}. Button par position:relative chahiye (m.glass deta hai). */
export function ripple(e: React.MouseEvent<HTMLElement>) {
  if (reduced()) return;
  const btn = e.currentTarget;
  const r = btn.getBoundingClientRect();
  const s = document.createElement("span");
  s.className = m.rippleDot;
  s.style.left = e.clientX - r.left - 7 + "px";
  s.style.top = e.clientY - r.top - 7 + "px";
  btn.appendChild(s);
  setTimeout(() => s.remove(), 720);
}

/**
 * Add-to-cart fly: product image cart icon tak udti hai.
 * Card wrapper par data-card, header cart icon par id="cart-icon".
 *
 *   onClick={(e) => { ripple(e); flyToCart(e); handleAddToCart(...); }}
 */
export function flyToCart(e: React.MouseEvent<HTMLElement>, targetSelector = "#cart-icon") {
  if (reduced()) return;
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const card = e.currentTarget.closest("[data-card]");
  const img = ((card && card.querySelector("img")) || e.currentTarget) as HTMLImageElement;
  const a = img.getBoundingClientRect();
  const b = target.getBoundingClientRect();

  const ghost = document.createElement("div");
  ghost.className = m.flyGhost;
  ghost.style.left = a.left + "px";
  ghost.style.top = a.top + "px";
  ghost.style.width = a.width + "px";
  ghost.style.height = a.height + "px";
  ghost.style.backgroundImage = "url(" + (img.currentSrc || img.src) + ")";
  document.body.appendChild(ghost);

  const dx = b.left - a.left + b.width / 2 - a.width / 2;
  const dy = b.top - a.top + b.height / 2 - a.height / 2;

  const anim = ghost.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      {
        transform: "translate(" + dx * 0.5 + "px," + (dy * 0.35 - 90) + "px) scale(.6)",
        opacity: 0.95,
        offset: 0.55,
      },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.06)", opacity: 0 },
    ],
    { duration: 900, easing: "cubic-bezier(.5,-0.2,.35,1)" }
  );
  anim.onfinish = () => ghost.remove();
}

/** Cart badge bump — cart count badhne par call karo (fly ke ~780ms baad). */
export function bumpBadge(selector = "#cart-badge") {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  el.classList.remove(m.bump);
  void el.offsetWidth;
  el.classList.add(m.bump);
}

/** Wishlist heart pop — toggle ke saath call karo. */
export function heartPop(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.classList.remove(m.heartPop);
  void el.offsetWidth;
  el.classList.add(m.heartPop);
}

/** Banner hover: 3D tilt + cursor-follow spotlight. onMouseMove par lagao. */
export function bannerMove(e: React.MouseEvent<HTMLElement>) {
  if (reduced()) return;
  const el = e.currentTarget;
  const b = el.getBoundingClientRect();
  const nx = (e.clientX - b.left) / b.width - 0.5;
  const ny = (e.clientY - b.top) / b.height - 0.5;
  el.style.transform =
    "perspective(1100px) rotateX(" + (-ny * 5).toFixed(2) + "deg) rotateY(" +
    (nx * 7).toFixed(2) + "deg) translateY(-6px)";
  el.style.boxShadow = "0 34px 70px rgba(7,26,65,.28)";

  const spot = el.querySelector<HTMLElement>("[data-spot]");
  if (spot) {
    spot.style.opacity = "1";
    spot.style.transform =
      "translate3d(" + (e.clientX - b.left) + "px," + (e.clientY - b.top) + "px,0)";
  }
}

/** Banner hover exit — onMouseLeave par lagao. */
export function bannerLeave(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.transform = "";
  el.style.boxShadow = "";
  const spot = el.querySelector<HTMLElement>("[data-spot]");
  if (spot) spot.style.opacity = "0";
}

# IndieKonnect — motion layer: apne code mein kaise lagayein

Ye folder `components/IndieKonnectHome/` ke andar rakho (jahan `IndieKonnectHome.tsx` hai).
Aapka existing Framer Motion / Redux / CSS-module code jaisa hai waisa rehta hai — ye
sirf upar se motion layer add karta hai.

    motion.module.css        micro-interaction CSS (glass, ripple, reveal, cursor, spotlight)
    useReveal.ts             scroll reveal + stagger (non-Framer sections)
    useMagnetic.ts           magnetic buttons
    useParallax.ts           banner image parallax
    useHeroScrollZoom.ts     hero pinned scroll-zoom sequence
    interactions.ts          ripple, flyToCart, bumpBadge, heartPop, bannerMove/Leave
    CursorFX.tsx             custom cursor (layout mein ek baar)
    GrowthLadderScroll.tsx   growth ladder ka pinned 01→04 version

---

## 0. Imports

`IndieKonnectHome.tsx` ke top par:

```tsx
import m from "./motion.module.css";
import useMagnetic from "./useMagnetic";
import useParallax from "./useParallax";
import useHeroScrollZoom from "./useHeroScrollZoom";
import { ripple, flyToCart, bumpBadge, heartPop, bannerMove, bannerLeave } from "./interactions";
import GrowthLadderScroll from "./GrowthLadderScroll";
```

`app/layout.tsx` mein ek baar:

```tsx
import CursorFX from "@/components/IndieKonnectHome/CursorFX";
// ...
<body>{children}<CursorFX /></body>
```

---

## 1. Glass reflection — Add to Cart buttons

Aapne jo maanga tha: hover par button ke andar soft diagonal light 0.5s mein pass ho.
Teen jagah button ki className mein `m.glass` add karo — Feature Products, Popular
Products, aur Tabs grid (New Arrivals / Best Seller / Best Offers).

Pehle:

```tsx
className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#071a41] ..."
```

Baad mein:

```tsx
className={`${m.glass} mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#071a41] ...`}
```

`m.glass` khud `position:relative; overflow:hidden` lagata hai, to alag se add karne
ki zaroorat nahi.

---

## 2. Add to cart → cart fly + badge bump

**Header.tsx** — cart icon par `id="cart-icon"`, count badge par `id="cart-badge"`.

**Product card wrapper** par `data-card` (fly ke liye source image yahan se milti hai):

```tsx
<motion.div key={p.id} data-card variants={scaleIn} ...>
```

**Button onClick:**

```tsx
onClick={(e) => {
  e.stopPropagation();
  ripple(e);
  flyToCart(e);
  handleAddToCart(p.id, p.name, image, price);
}}
```

**handleAddToCart** ke success branch mein, `setCartSidebarOpen(true)` ke baad:

```tsx
setTimeout(() => bumpBadge(), 780);   // fly khatam hone par badge bounce
```

---

## 3. Wishlist heart pop

Dono jagah (Popular Products + Tabs grid):

```tsx
onClick={(e) => { heartPop(e); handleToggleWishlist(product.id, product.name); }}
```

---

## 4. Magnetic hero buttons + ripple

```tsx
const shopBtn = useMagnetic();
const exploreBtn = useMagnetic();
```

```tsx
<motion.button
  ref={shopBtn}
  type="button"
  onClick={(e) => { ripple(e); router.push("/products"); }}
  className={`${m.glass} font-serif group inline-flex h-[52px] ...`}
>
```

`whileHover={{ y: -3 }}` hata do — magnetic transform ke saath conflict karta hai.

---

## 5. Banner parallax + hover tilt + spotlight (Today's Best Deal)

`useParallax` hook ko `.map()` ke andar call nahi kar sakte (hooks rule), to banner
ko chhota child component bana lo:

```tsx
function DealBanner({ rawProduct, index, router }: any) {
  const product = rawProduct?.product || rawProduct;
  const px = useParallax(index === 0 ? 26 : 38);

  const productImage =
    product?.primary_image_url ||
    product?.images?.find((img: any) => img?.is_primary)?.image_url ||
    product?.images?.[0]?.image_url ||
    "/images/placeholder-promo.jpg";

  const discountPercent =
    rawProduct?.discounts?.retail?.discount_percentage ??
    product?.retail_discount_percentage ?? 0;

  return (
    <motion.div
      onMouseMove={bannerMove}
      onMouseLeave={bannerLeave}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: 0.12 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative h-[300px] overflow-hidden rounded-[20px] bg-[#dfe8f0] [transform-style:preserve-3d] shadow-[0_8px_30px_rgba(7,26,65,0.08)] sm:h-[360px] lg:h-[390px] xl:h-[420px]"
    >
      <div ref={px} className={m.pxFrame}>
        <img
          src={productImage}
          alt={product?.name || "Product"}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.src = "/images/placeholder-promo.jpg"; }}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />
      <div data-spot className={index === 0 ? m.spot : `${m.spot} ${m.spotGold}`} />

      {/* ...aapka existing content block (Today's Best Deal, heading, Shop now)... */}
    </motion.div>
  );
}
```

Aur map:

```tsx
{dealProducts.map((p: any, i: number) => (
  <DealBanner key={p?.product?.id || p?.id || i} rawProduct={p} index={i} router={router} />
))}
```

Important: `whileHover={{ y: -4 }}` hata do — `bannerMove` ka tilt transform usse ladta hai.

Lifestyle banner (`home-page-second-banner`) par bhi wahi treatment: image ko
`<div ref={px} className={m.pxFrame}>` mein wrap karke `useParallax(46)`.

---

## 6. Hero — cinematic scroll zoom (100% → 125%)

```tsx
const z = useHeroScrollZoom();
```

```tsx
<div ref={z.wrap} className="relative h-[210vh]">
  <section className="sticky top-0 flex h-screen min-h-[620px] items-center overflow-hidden bg-[#eee7dc]">

    {/* background image — 100% → 125% zoom */}
    <div ref={z.art} className="absolute inset-0 origin-[70%_45%] will-change-transform">
      <img src={heroImage} alt={heroImageAlt} className="h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f8f2e9]/[0.85] via-[#f8f2e9]/[0.45] via-[10%] to-transparent" />
    </div>

    {/* text — fade + slide up + blur */}
    <div ref={z.text} className="relative z-20 mx-auto w-full max-w-[1900px] px-6 lg:px-14">
      {/* aapka existing heading / description / CTAs / 4 perks */}
    </div>

    {/* 40% badge — shrink + exit */}
    <div ref={z.badge} className="absolute left-[8%] top-[15%] z-30">
      {/* existing discount badge */}
    </div>
  </section>
</div>

{/* baaki poora page isme wrap karo — hero ke upar se reveal hoga */}
<div className="relative z-[3] -mt-[100vh] overflow-clip rounded-t-[34px] bg-white shadow-[0_-34px_70px_rgba(20,16,8,.22)]">
  {/* "Shop Deals by Category" se Footer tak sab kuch */}
</div>
```

**Do gotchas — inhi par main atka tha, aapko bacha rahe hain:**

1. Lift wrapper par `overflow-hidden` **nahi** — `overflow-clip` use karo. `hidden`
   scroll container banata hai jisse andar ke sticky sections (growth ladder) toot jaate hain.
2. Hero image par Framer ka `animate={{ scale: 1 }}` mat rakho — wo scroll transform
   se ladta hai. Entry animation chahiye to `z.art` ke *parent* par lagao.

---

## 7. Growth ladder — pinned 01 → 02 → 03 → 04

Purana `level` state + prev/next buttons wala poora block replace karo:

```tsx
<GrowthLadderScroll title={growthTitle} steps={growthSteps} />
```

`growthSteps` items se `title` (ya `name`) aur `description` (ya `text`) padhe jaate hain;
number automatic banta hai. Ab `level`, `setLevel`, `activeLevel`,
`handlePreviousLevel`, `handleNextLevel` delete kar sakte ho.

---

## 8. Reels — 3D tilt + hover autoplay feel

Reel card ko chhota component banao:

```tsx
function ReelCard({ reel }: any) {
  const card = useRef<HTMLDivElement>(null);
  const [prog, setProg] = useState(0);
  const t = useRef<any>(null);

  const onEnter = () => {
    let p = 0;
    t.current = setInterval(() => { p = (p + 2) % 102; setProg(p); }, 60);
  };
  const onMove = (e: React.MouseEvent) => {
    const el = card.current!;
    const b = el.getBoundingClientRect();
    const rx = ((e.clientY - b.top) / b.height - 0.5) * -12;
    const ry = ((e.clientX - b.left) / b.width - 0.5) * 14;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.03)`;
  };
  const onLeave = () => {
    clearInterval(t.current);
    setProg(0);
    card.current!.style.transform = "";
  };

  return (
    <div ref={card} data-card onMouseEnter={onEnter} onMouseMove={onMove} onMouseLeave={onLeave}
      className="group relative overflow-hidden rounded-2xl transition-[transform,box-shadow] duration-500">
      <div className="absolute inset-x-3 top-3 z-10 h-[2.5px] overflow-hidden rounded bg-white/30">
        <div className="h-full bg-white transition-[width] duration-200 ease-linear" style={{ width: prog + "%" }} />
      </div>
      {/* existing reel content */}
    </div>
  );
}
```

---

## 9. Skeleton → content, aur fail-safe

Aapka `isLoading` block already skeleton dikhata hai. Ek zaroori baat: `motion.module.css`
ka `.reveal` 2.6s baad khud visible ho jaata hai, chahe JS ruk jaye. Yeh fail-safe
rakhna — warna JS error par poora page blank dikhta hai.

Framer sections par `viewport={{ once: true, amount: 0.08 }}` hi rakho (aapne kiya hai).
`amount` zyada karne se chhoti screens par sections chhupe reh jaate hain.

---

## 10. Performance — ye skip mat karo

Aapke page par ek saath bahut kuch chalta hai. Teen rules:

1. **Har scroll/mousemove handler rAF-throttled ho.** Is folder ke saare hooks already
   hain. Naya handler likho to `if (!raf) raf = requestAnimationFrame(...)`.
2. **Layout reads cache karo.** `getBoundingClientRect()` har mousemove par mat chalao
   (`useMagnetic` ka pattern dekho) — warna main thread block hota hai aur page freeze lagta hai.
3. **`prefers-reduced-motion`** — saare hooks respect karte hain; naye effect mein bhi check lagao.

---

## Kaunsa effect kahan (checklist)

| Effect | Kahan | File |
|---|---|---|
| Glass reflection sweep | Add to Cart × 3 | `motion.module.css` → `m.glass` |
| Ripple | hero CTAs, Shop now buttons | `interactions.ts` → `ripple` |
| Cart fly + badge bump | saare Add to Cart | `interactions.ts` → `flyToCart`, `bumpBadge` |
| Heart pop | wishlist buttons | `interactions.ts` → `heartPop` |
| Magnetic pull | hero CTAs | `useMagnetic.ts` |
| Custom cursor | global | `CursorFX.tsx` |
| Banner parallax | deal banners, lifestyle banner | `useParallax.ts` |
| Banner tilt + spotlight | deal banners | `interactions.ts` → `bannerMove/Leave` |
| Hero scroll zoom + text exit | hero | `useHeroScrollZoom.ts` |
| Pinned 01→04 ladder | growth ladder | `GrowthLadderScroll.tsx` |
| Reveal + stagger | non-Framer sections | `useReveal.ts` + `m.reveal` |
| Reels 3D tilt + scrub | reels | PATCH section 8 |

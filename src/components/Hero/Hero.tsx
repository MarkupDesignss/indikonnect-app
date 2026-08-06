import Image from "next/image";
import Link from "next/link";
import Taj from "../../../public/images/taj.jpeg"
import Logo from "../../../public/images/logo.png"
const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Opportunity", href: "/opportunity" },
  { label: "Journal", href: "/journal" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-ink-950">
      {/* ---------- Background image ---------- */}
      <div className="absolute inset-0">
        <Image
          src={Taj} // replace with your background asset
          alt="Hawa Mahal, Jaipur"
          fill
          priority
          className="object-cover object-[70%_30%]"
        />
        {/* Navy gradient overlay — strongest at left, fading toward the image on the right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/85 to-ink-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
      </div>

      {/* ---------- Nav ---------- */}
      <header className="relative z-20 flex items-center justify-between px-8 py-6 md:px-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={Logo} // replace with your logo asset
            alt="IndieKonnect"
            width={56}
            height={56}
            className="h-12 w-auto"
          />
        </Link>

        {/* Center nav links */}
        <nav className="hidden items-center gap-10 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium uppercase tracking-widest2 text-cream/90 transition hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-4 md:gap-6">
          <button
            aria-label="Cart"
            className="flex items-center gap-1.5 text-cream/90 transition hover:text-gold"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M6 8h12l-1 12H7L6 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="text-sm">(0)</span>
          </button>

          <Link
            href="/join"
            className="flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Join
            <span aria-hidden>→</span>
          </Link>
        </div>
      </header>

      {/* ---------- Hero content ---------- */}
      <div className="relative z-10 mx-auto flex max-w-[1400px] flex-col px-8 pb-24 pt-8 md:px-16 lg:pt-16">
        {/* Eyebrow */}
        <p className="text-xs font-medium uppercase tracking-widest2 text-gold/90 md:text-sm">
          One Nation &middot; One Network &middot; Endless Possibilities
        </p>

        {/* Headline */}
        <h1 className="mt-4 leading-[0.92]">
          <span className="block font-display text-[64px] font-normal text-cream sm:text-[84px] lg:text-[104px]">
            Art of
          </span>
          <span className="-mt-2 block font-script text-[76px] italic text-gold sm:text-[100px] lg:text-[130px]">
            Opportunity
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-xl text-base leading-relaxed text-mist md:text-lg">
          A modern Indian movement built on Connection, Opportunity, Growth
          and Trust, where the spirit of 1.4 billion meets the power of
          entrepreneurship.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/join"
            className="flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Join the Movement
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/collections"
            className="flex items-center gap-2 rounded-full border border-cream/40 px-8 py-4 text-sm font-semibold text-cream transition hover:border-cream hover:bg-cream/5"
          >
            Shop the Collections
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* ---------- Model photo in red arch ---------- */}
      <div className="pointer-events-none absolute bottom-0 right-[6%] z-10 hidden h-[88%] w-[300px] md:block lg:right-[10%] lg:w-[360px]">
        <div className="relative h-full w-full overflow-hidden rounded-t-[180px] bg-crimson shadow-2xl">
          <Image
            src={Logo}// replace with your model photo asset
            alt="Model wearing a traditional silk saree"
            fill
            className="object-cover object-top"
          />
        </div>
      </div>

      {/* ---------- Scroll indicator ---------- */}
      <div className="absolute bottom-10 left-8 z-20 hidden items-center gap-3 md:flex md:left-16">
        <span className="h-10 w-px bg-cream/40" />
        <span className="vertical-text text-[11px] font-medium uppercase tracking-widest2 text-cream/70">
          Scroll
        </span>
      </div>
    </section>
  );
}

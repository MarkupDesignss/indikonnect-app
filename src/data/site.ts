export const U = (id: string, w: number, q = 80) =>
  "https://images.unsplash.com/photo-" + id + "?w=" + w + "&q=" + q + "&auto=format&fit=crop";

export const nav = [
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/wishlist" },
  { label: "Opportunity", href: "/" },
  { label: "Journal", href: "/Products" }
];

export const nationColumns = [
  { drift: -14, images: ["1610030469983-98e550d6193c", "1573496359142-b8d87734a5a2", "1583391733956-3750e0ff4e8b"] },
  { drift: 18, images: ["1587574293340-e0011c4e8ecf", "1600880292203-757bb62b4baf", "1477587458883-47145ed94245"] },
  { drift: -22, images: ["1548013146-72479768bada", "1583391733956-3750e0ff4e8b", "1552664730-d307ca884978"] },
  { drift: 16, images: ["1524492412937-b28074a5d7da", "1610030469983-98e550d6193c", "1587574293340-e0011c4e8ecf"] },
  { drift: -16, images: ["1600880292203-757bb62b4baf", "1548013146-72479768bada", "1573496359142-b8d87734a5a2"] }
];

export type Tier = "l" | "m" | "s";

export type Product = {
  num: string;
  tier: Tier;
  category: string;
  ghost: string;
  name: string;
  price: string;
  badge?: string;
  shop: boolean;
  image: string;
  alt: string;
};

export const ghostWords = [
  { category: "Timeless Horology", word: "Horology" },
  { category: "Elegant Jewellery", word: "Jewellery" },
  { category: "Beauty & Care", word: "Beauty" },
  { category: "Lifestyle Dining", word: "Dining" }
];

export const products: Product[] = [
  {
    num: "01",
    tier: "l",
    category: "Timeless Horology",
    ghost: "Horology",
    name: "Aurelia Chronograph",
    price: "\u20B9 12,999",
    badge: "Best Seller",
    shop: true,
    image: "1524805444758-089113d48a6d",
    alt: "Aurelia Chronograph wristwatch on a dark reflective surface"
  },
  {
    num: "02",
    tier: "m",
    category: "Elegant Jewellery",
    ghost: "Jewellery",
    name: "Celeste Necklace",
    price: "\u20B9 8,499",
    shop: true,
    image: "1515562141207-7a88fb7ce338",
    alt: "Celeste pearl necklace resting in a jewellery box"
  },
  {
    num: "03",
    tier: "s",
    category: "Beauty & Care",
    ghost: "Beauty",
    name: "Radiance Serum",
    price: "\u20B9 2,199",
    shop: false,
    image: "1611930022073-b7a4ba5fcccd",
    alt: "Radiance Serum bottles balanced on a neutral background"
  },
  {
    num: "04",
    tier: "m",
    category: "Lifestyle Dining",
    ghost: "Dining",
    name: "Nova Dinner Set",
    price: "\u20B9 6,999",
    shop: true,
    image: "1610701596007-11502861dcfa",
    alt: "Nova Dinner Set ceramic vessels in warm neutral tones"
  },
  {
    num: "05",
    tier: "l",
    category: "Timeless Horology",
    ghost: "Horology",
    name: "Meridian Automatic",
    price: "\u20B9 18,499",
    badge: "New",
    shop: true,
    image: "1523170335258-f5ed11844a49",
    alt: "Meridian Automatic steel wristwatch, close detail"
  },
  {
    num: "06",
    tier: "s",
    category: "Elegant Jewellery",
    ghost: "Jewellery",
    name: "Solene Chain",
    price: "\u20B9 9,750",
    shop: false,
    image: "1602173574767-37ac01994b2a",
    alt: "Solene gold chain bracelet on a soft surface"
  }
];

export const values = [
  {
    idx: "01",
    chip: "navy",
    title: "Trust & Stability",
    colour: "Blue.",
    body: "We operate with professional vision and steady confidence in every relationship we build, from the first order to the hundredth."
  },
  {
    idx: "02",
    chip: "gold",
    title: "Energy & Growth",
    colour: "Yellow.",
    body: "We foster a culture of positivity, ambition and warmth that keeps people moving forward together."
  },
  {
    idx: "03",
    chip: "white",
    title: "Integrity & Transparency",
    colour: "White.",
    body: "Our foundation is ethical values and honest, simple business practice. Nothing hidden in the fine print."
  }
] as const;

export const compliance = [
  { idx: "i", title: "Regulatory Alignment", body: "Actively aligning with India's evolving direct-selling frameworks." },
  { idx: "ii", title: "Robust Compensation", body: "A transparent structure focused on leadership development." },
  { idx: "iii", title: "Corporate Governance", body: "The highest standards of ethics, compliance and accountability." }
];

export const steps = [
  {
    mark: "I",
    level: "Level 01",
    title: "Associate",
    body: "Begin your journey with curated products, structured training and a community that answers when you ask."
  },
  {
    mark: "II",
    level: "Level 02",
    title: "Builder",
    body: "Grow your network and unlock deeper mentorship as your circle expands beyond the people you already knew."
  },
  {
    mark: "III",
    level: "Level 03",
    title: "Leader",
    body: "Guide your own team with recognition, tools and rewards designed around leadership rather than volume alone."
  },
  {
    mark: "IV",
    level: "Level 04",
    title: "Director",
    body: "Shape regional growth, mentor other leaders and champion the values that hold the movement together."
  },
  {
    mark: "V",
    level: "Level 05",
    title: "Ambassador",
    body: "Stand among the faces of a new India, inspiring the generation that comes next."
  }
];

export const voices = [
  {
    quote: "IndieKonnect gave me more than products. It gave me a community, and the confidence to build something that is genuinely my own.",
    name: "Ananya R.",
    role: "Builder \u00B7 Jaipur",
    avatar: "1583391733956-3750e0ff4e8b"
  },
  {
    quote: "The transparency and the ethics won my trust first. This feels like a brand building for the long term, not the quarter.",
    name: "Vikram S.",
    role: "Leader \u00B7 Pune",
    avatar: "1600880292203-757bb62b4baf"
  },
  {
    quote: "From homemaker to team leader. My own journey is the proof that the possibilities really are endless here.",
    name: "Meera K.",
    role: "Director \u00B7 Indore",
    avatar: "1573496359142-b8d87734a5a2"
  },
  {
    quote: "I joined for the catalogue. I stayed for the mentorship, which is the part nobody advertises and everybody needs.",
    name: "Priya N.",
    role: "Associate \u00B7 Kochi",
    avatar: "1610030469983-98e550d6193c"
  }
];

export const footerColumns = [
  { title: "Customer Service", links: ["Assistance", "FAQs", "Returns & Refund", "Contact"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Preferences"] },
  { title: "Follow Us", links: ["Instagram", "LinkedIn", "YouTube"] }
];

export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  {
    name: "Shop",
    href: "/shop",
  },
  {
    name: "Collections",
    href: "/collections",
  },
  {
    name: "Opportunity",
    href: "/opportunity",
  },
  {
    name: "Journal",
    href: "/journal",
  },
];

export const footerNav = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Contact", href: "/contact" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Returns", href: "/returns" },
    { name: "Shipping", href: "/shipping" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

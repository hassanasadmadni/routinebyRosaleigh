import { useEffect, useState } from "react";
import { Search, User, ShoppingCart, ArrowUp } from "lucide-react";
import logoWordmark from "@/assets/logo-wordmark.png";

/* ---------------------------------------------------------------------------
   Rosaleigh theme tokens — copied from the Shopify theme settings
--------------------------------------------------------------------------- */
const T = {
  // General
  bg: "#FFFFFF",
  heading: "#231F20",
  text: "#4A4546",
  link: "#9A5A22",
  line: "#E6E1DE",
  cartDot: "#F0C020",
  cartDotText: "#231F20",
  // Secondary
  secondaryBg: "#F7F1EE",
  // Buttons
  btn: "#231F20",
  btnText: "#FFFFFF",
  btnHover: "#F0C020",
  btnHoverText: "#231F20",
  // Footer
  footerBg: "#231F20",
  footerHeading: "#FFFFFF",
  footerText: "#D9D3D0",
  footerLink: "#F0C020",
  footerLine: "#3A3435",
} as const;

const BODY_FONT = "Figtree, sans-serif";
const HEADING_FONT = "'Instrument Serif', serif";
const BASE_SIZE = "15.4px"; // body base size 110%
const PAGE_WIDTH = 1300;

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";

function useThemeFonts() {
  useEffect(() => {
    if (document.getElementById("rl-theme-fonts")) return;
    const link = document.createElement("link");
    link.id = "rl-theme-fonts";
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);
}

/* ---------------------------------------------------------------------------
   HEADER
--------------------------------------------------------------------------- */
const ANNOUNCEMENTS = ["10% off your first order", "Free UK shipping over £70"];

const NAV_LINKS = [
  { label: "Skin care", href: "https://www.rosaleigh.co.uk/collections/skin-care" },
  { label: "Beauty", href: "https://www.rosaleigh.co.uk/collections/beauty" },
  { label: "Our story", href: "https://www.rosaleigh.co.uk/pages/our-story" },
  { label: "Ingredients", href: "https://www.rosaleigh.co.uk/pages/ingredients" },
];

export function Header() {
  useThemeFonts();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div
        className="flex items-center justify-center px-5"
        style={{
          background: T.footerBg,
          color: "#FFFFFF",
          fontFamily: BODY_FONT,
          fontSize: BASE_SIZE,
          minHeight: 42,
        }}
      >
        <span key={index}>{ANNOUNCEMENTS[index]}</span>
      </div>

      {/* Main header */}
      <header
        style={{
          background: T.bg,
          color: T.heading,
          fontFamily: BODY_FONT,
          fontSize: BASE_SIZE,
          borderBottom: `1px solid ${T.line}`,
        }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: PAGE_WIDTH, padding: "18px 28px 0" }}
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <a href="https://www.rosaleigh.co.uk" className="shrink-0" aria-label="Rosaleigh home">
              <img
                src={logoWordmark}
                alt="Rosaleigh"
                style={{ height: 48, width: "auto", filter: "brightness(0)" }}
              />
            </a>

            {/* Search */}
            <form
              action="https://www.rosaleigh.co.uk/search"
              method="get"
              className="order-3 flex w-full items-center gap-3 md:order-none md:w-auto md:flex-1"
              style={{
                background: T.secondaryBg,
                borderRadius: 999,
                height: 56,
                padding: "0 24px",
              }}
            >
              <Search className="h-5 w-5 shrink-0" style={{ color: T.text }} />
              <input
                type="search"
                name="q"
                placeholder="Search skin care and beauty"
                aria-label="Search"
                className="w-full bg-transparent focus:outline-none"
                style={{ color: T.heading, fontFamily: BODY_FONT, fontSize: BASE_SIZE }}
              />
            </form>

            {/* Icons */}
            <div className="ml-auto flex items-center gap-6 md:ml-0">
              <a
                href="https://www.rosaleigh.co.uk/account"
                aria-label="Account"
                className="transition-opacity hover:opacity-70"
                style={{ color: T.heading }}
              >
                <User className="h-6 w-6" />
              </a>
              <a
                href="https://www.rosaleigh.co.uk/cart"
                aria-label="Cart"
                className="transition-opacity hover:opacity-70"
                style={{ color: T.heading }}
              >
                <ShoppingCart className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Nav */}
          <nav
            className="flex items-center gap-8 overflow-x-auto"
            style={{ padding: "16px 0 14px" }}
            aria-label="Main"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="whitespace-nowrap transition-opacity hover:opacity-70"
                style={{ color: T.heading, fontFamily: BODY_FONT, fontSize: BASE_SIZE }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://www.rosaleigh.co.uk/pages/routine-finder"
              className="whitespace-nowrap font-medium transition-opacity hover:opacity-90"
              style={{
                background: T.btnHover,
                color: T.btnHoverText,
                borderRadius: 999,
                padding: "10px 24px",
                fontFamily: BODY_FONT,
                fontSize: BASE_SIZE,
              }}
            >
              AI Routine
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

/* ---------------------------------------------------------------------------
   FOOTER
--------------------------------------------------------------------------- */
export const DISCLAIMER =
  "This analysis is generated by AI for general skincare guidance only. It is not a medical or dermatological diagnosis. Individual results vary. If you have a diagnosed skin condition, please consult a dermatologist before starting a new routine.";

const GOOD_TO_KNOW =
  "Food supplements: not medicines; do not exceed the recommended daily dose; not a substitute for a varied diet; keep out of reach of children; consult a professional if pregnant, breastfeeding or taking medication. Skincare: patch test before first use. AI images for illustration.";

const SHOP_LINKS = [
  { label: "Skin care", href: "https://www.rosaleigh.co.uk/collections/skin-care" },
  { label: "Beauty", href: "https://www.rosaleigh.co.uk/collections/beauty" },
  { label: "The Trio", href: "https://www.rosaleigh.co.uk/collections/bundles" },
  { label: "Shop all", href: "https://www.rosaleigh.co.uk/collections/all" },
];

const HELP_LINKS = [
  { label: "Contact us", href: "https://www.rosaleigh.co.uk/pages/contact" },
  { label: "FAQ", href: "https://www.rosaleigh.co.uk/pages/faq" },
  { label: "Shipping", href: "https://www.rosaleigh.co.uk/policies/shipping-policy" },
  { label: "Returns & refunds", href: "https://www.rosaleigh.co.uk/policies/refund-policy" },
];

const ABOUT_LINKS = [
  { label: "Our story", href: "https://www.rosaleigh.co.uk/pages/our-story" },
  { label: "Ingredients", href: "https://www.rosaleigh.co.uk/pages/ingredients" },
  { label: "Routine Finder", href: "https://www.rosaleigh.co.uk/pages/routine-finder" },
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "https://www.rosaleigh.co.uk/policies/privacy-policy" },
  { label: "Terms", href: "https://www.rosaleigh.co.uk/policies/terms-of-service" },
  { label: "Cookies", href: "https://www.rosaleigh.co.uk/pages/cookies-policy" },
  { label: "Legal notice", href: "https://www.rosaleigh.co.uk/policies/legal-notice" },
];

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/rosaleighuk",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12",
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/rosaleighuk",
    path: "M12 2a10 10 0 0 0-3.65 19.3c-.05-.83-.09-2.1.02-3 .1-.8.66-5.14.66-5.14s-.17-.34-.17-.83c0-.78.45-1.36 1.02-1.36.48 0 .71.36.71.79 0 .48-.31 1.2-.46 1.87-.13.56.28 1.02.83 1.02 1 0 1.77-1.06 1.77-2.58 0-1.35-.97-2.29-2.35-2.29-1.6 0-2.54 1.2-2.54 2.44 0 .48.18.99.42 1.27a.17.17 0 0 1 .04.16l-.16.66c-.03.11-.09.14-.2.08-.77-.36-1.25-1.48-1.25-2.38 0-1.94 1.41-3.72 4.06-3.72 2.13 0 3.79 1.52 3.79 3.55 0 2.12-1.34 3.82-3.19 3.82-.62 0-1.21-.32-1.41-.71l-.38 1.47c-.14.53-.51 1.2-.76 1.6A10 10 0 1 0 12 2",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/rosaleigh_uk",
    path: "M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44.54c.64-.25 1.37-.42 2.43-.47C8.94.02 9.28.01 12 .01Zm0 3.6a6.39 6.39 0 1 0 0 12.78 6.39 6.39 0 0 0 0-12.78Zm0 10.55a4.16 4.16 0 1 1 0-8.32 4.16 4.16 0 0 1 0 8.32Zm6.65-10.8a1.49 1.49 0 1 1-2.98 0 1.49 1.49 0 0 1 2.98 0Z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@rosaleigh_uk",
    path: "M16.6 2h-3.2v13.2a2.9 2.9 0 1 1-2.05-2.77V9.1a6.1 6.1 0 1 0 5.25 6.05V8.3a7.9 7.9 0 0 0 4.4 1.34V6.4a4.5 4.5 0 0 1-4.4-4.4Z",
  },
];

function PayBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        background: "#FFFFFF",
        borderRadius: 4,
        width: 46,
        height: 30,
        fontFamily: BODY_FONT,
      }}
    >
      {children}
    </span>
  );
}

function PaymentBadges() {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Accepted payment methods">
      <PayBadge>
        <span style={{ color: "#1A1F71", fontWeight: 800, fontStyle: "italic", fontSize: 12 }}>
          VISA
        </span>
      </PayBadge>
      <PayBadge>
        <svg width="28" height="18" viewBox="0 0 28 18" aria-label="Mastercard">
          <circle cx="10" cy="9" r="8" fill="#EB001B" />
          <circle cx="18" cy="9" r="8" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      </PayBadge>
      <PayBadge>
        <span style={{ color: "#FFFFFF", background: "#2E77BC", fontWeight: 800, fontSize: 9, padding: "4px 5px", borderRadius: 2 }}>
          AMEX
        </span>
      </PayBadge>
      <PayBadge>
        <span style={{ color: "#003087", fontWeight: 800, fontStyle: "italic", fontSize: 11 }}>
          PayPal
        </span>
      </PayBadge>
      <PayBadge>
        <span style={{ color: "#0079BE", fontWeight: 700, fontSize: 9 }}>Diners</span>
      </PayBadge>
      <PayBadge>
        <span style={{ color: "#E55C20", fontWeight: 800, fontSize: 7 }}>DISCOVER</span>
      </PayBadge>
    </div>
  );
}

export function Footer() {
  useThemeFonts();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const colHeading = {
    color: T.footerLink,
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  };

  const linkClass = "transition-colors hover:text-[#F0C020]";
  const linkStyle = { color: T.footerText, fontFamily: BODY_FONT, fontSize: BASE_SIZE };

  return (
    <footer style={{ background: T.footerBg, color: T.footerText, fontFamily: BODY_FONT, fontSize: BASE_SIZE }}>
      <div className="mx-auto" style={{ maxWidth: PAGE_WIDTH, padding: "0 28px" }}>
        {/* Subscribe band */}
        <div
          className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16"
          style={{ padding: "72px 0 56px", borderBottom: `1px solid ${T.footerLine}` }}
        >
          <div>
            <h2
              style={{
                color: T.footerHeading,
                fontFamily: HEADING_FONT,
                fontWeight: 400,
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                lineHeight: 1.05,
                letterSpacing: 0,
                margin: 0,
              }}
            >
              Get{" "}
              <em style={{ fontStyle: "italic", color: T.footerLink }}>10% off</em> your first order
            </h2>
            <p style={{ marginTop: 16, maxWidth: 520, color: T.footerText, lineHeight: 1.6 }}>
              Routine tips, new launches and members-only offers. Unsubscribe anytime.
            </p>
          </div>

          <div>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="w-full flex-1 bg-transparent focus:outline-none"
                style={{
                  border: `1px solid ${T.footerText}`,
                  borderRadius: 999,
                  height: 64,
                  padding: "0 28px",
                  color: T.footerHeading,
                  fontFamily: BODY_FONT,
                  fontSize: BASE_SIZE,
                }}
              />
              <button
                type="submit"
                className="transition-opacity hover:opacity-90"
                style={{
                  background: T.btnHover,
                  color: T.btnHoverText,
                  borderRadius: 999,
                  height: 64,
                  padding: "0 36px",
                  fontFamily: BODY_FONT,
                  fontSize: BASE_SIZE,
                  fontWeight: 600,
                }}
              >
                Subscribe
              </button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13.5, color: T.footerText, lineHeight: 1.6 }}>
              By subscribing you agree to receive marketing emails from Rosaleigh. See our{" "}
              <a
                href="https://www.rosaleigh.co.uk/policies/privacy-policy"
                className="underline hover:text-[#F0C020]"
                style={{ color: T.footerHeading }}
              >
                Privacy policy
              </a>
              .
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div
          className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]"
          style={{ padding: "56px 0 0" }}
        >
          <div className="col-span-2 md:col-span-1">
            <a href="https://www.rosaleigh.co.uk" aria-label="Rosaleigh home">
              <img src={logoWordmark} alt="Rosaleigh" style={{ height: 56, width: "auto" }} />
            </a>
            <p style={{ marginTop: 16, maxWidth: 420, color: T.footerText, lineHeight: 1.6 }}>
              We stand by every drop. UK-based skincare you can believe in.
            </p>
            <div className="flex items-center gap-3" style={{ marginTop: 24 }}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex items-center justify-center transition-colors hover:border-[#F0C020] hover:text-[#F0C020]"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 999,
                    border: `1px solid ${T.footerLine}`,
                    color: T.footerHeading,
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 style={colHeading}>Shop</h3>
            <ul style={{ marginTop: 24, display: "grid", gap: 20 }}>
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkClass} style={linkStyle}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={colHeading}>Help</h3>
            <ul style={{ marginTop: 24, display: "grid", gap: 20 }}>
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkClass} style={linkStyle}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={colHeading}>About</h3>
            <ul style={{ marginTop: 24, display: "grid", gap: 20 }}>
              {ABOUT_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={linkClass} style={linkStyle}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Good to know */}
          <div
            className="col-span-2 md:col-span-3"
            style={{
              border: `1px solid ${T.footerLine}`,
              borderRadius: 28,
              padding: "28px 32px",
            }}
          >
            <p style={{ ...colHeading, margin: 0 }}>Good to know</p>
            <p style={{ marginTop: 12, color: T.footerText, lineHeight: 1.7, fontSize: 14.5 }}>
              {GOOD_TO_KNOW}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center"
          style={{ marginTop: 40, padding: "28px 0", borderTop: `1px solid ${T.footerLine}` }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2" style={{ fontSize: 14.5 }}>
            <span>© 2026 Rosaleigh</span>
            {BOTTOM_LINKS.map((l) => (
              <span key={l.label} className="flex items-center gap-3">
                <span aria-hidden="true">·</span>
                <a href={l.href} className={linkClass} style={{ color: T.footerText }}>
                  {l.label}
                </a>
              </span>
            ))}
          </div>
          <PaymentBadges />
        </div>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-40 flex items-center justify-center transition-opacity hover:opacity-90"
          style={{
            right: 28,
            bottom: 28,
            width: 60,
            height: 60,
            borderRadius: 999,
            background: T.btnHover,
            color: T.btnHoverText,
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </footer>
  );
}

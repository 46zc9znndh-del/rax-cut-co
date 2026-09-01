import type {
  FooterSettings,
  NavLink,
  ReviewsSettings,
  SitePopupSettings,
  SiteSettings,
  StoreSettings,
  EmailSettings,
} from "./types";

export const DEFAULT_NAV_LINKS: NavLink[] = [
  { href: "/shop", label: "Shop Boards" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/our-story", label: "Inside RAX" },
  { href: "/care", label: "Care" },
  { href: "/guarantee", label: "Guarantee" },
];

export const DEFAULT_FOOTER: FooterSettings = {
  tagline:
    "Handcrafted American hardwood. Precision-milled, finished by hand, built to take a lifetime of honest kitchen work.",
  locationLine: "Est. 2026 · Washington, USA",
  newsletterHeadline: "Join the RAX Crew",
  newsletterDescription:
    "Exclusive drops, mill notes, and first crack at limited boards.",
  newsletterSuccess: "You're on the list. Check your inbox.",
  employeeLoginLabel: "Employee Login",
  employeeLoginHref: "/admin",
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
  },
};

export const DEFAULT_REVIEWS: ReviewsSettings = {
  kicker: "From the Crew",
  headline: "In the Kitchen",
  items: [
    {
      id: "r1",
      name: "Marcus Hale",
      location: "Boise, ID",
      rating: 5,
      title: "Brisket juices stay in the tray",
      body: "I sliced a 14-pound brisket and every drop went through the board into the drip tray. Counters stayed clean. This is the board I should've bought years ago.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/brisket-service.jpg",
      date: "Aug 2026",
    },
    {
      id: "r2",
      name: "Elena Voss",
      location: "Austin, TX",
      rating: 5,
      title: "Steak night without the mess",
      body: "Resting steaks used to mean a puddle on the counter. The removable tray catches everything. Guests notice the bull stamp before dinner hits the table.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/steak-rest.jpg",
      date: "Aug 2026",
    },
    {
      id: "r3",
      name: "Jonah Pratt",
      location: "Spokane, WA",
      rating: 5,
      title: "Built for wild game",
      body: "Processing deer used to wreck my old boards. The drainage system and heavy 2-inch build handle it. Slide the tray, rinse, done.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/smokehouse-cut.jpg",
      date: "Jul 2026",
    },
    {
      id: "r4",
      name: "Priya Nandakumar",
      location: "Denver, CO",
      rating: 5,
      title: "Thanksgiving turkey, zero overflow",
      body: "Carved the bird on the Original Drip Board. Juice groove would've overflowed — the tray never did. Already telling the family.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/juice-groove.jpg",
      date: "Jul 2026",
    },
    {
      id: "r5",
      name: "Cole Brennan",
      location: "Nashville, TN",
      rating: 5,
      title: "Smoker-side workhorse",
      body: "Lives next to the offset. Drain and tray caught every drop from a long cook. Hardwood hides the scars the way it should.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/drip-tray.jpg",
      date: "Jun 2026",
    },
    {
      id: "r6",
      name: "Hannah Ruiz",
      location: "Portland, OR",
      rating: 5,
      title: "Maple build, serious feel",
      body: "Went with maple for the launch. Same drip system, heavy 2-inch build, still feels like a serious tool.",
      product: "RAX Original Drip Board — Maple",
      image: "/images/portfolio/carving-line.jpg",
      date: "Jun 2026",
    },
  ],
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThreshold: 150,
  standardShippingRate: 18,
  lowStockThreshold: 10,
  lowStockMessage: "Limited stock — order soon",
};

export const DEFAULT_SITE_POPUP: SitePopupSettings = {
  enabled: false,
  headline: "Launch offer",
  body: "Free shipping on orders over $150. Limited launch boards available.",
  ctaText: "Shop boards",
  ctaHref: "/shop",
};

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  brandName: "RAX Cut Co.",
  footerTagline: "Handcrafted hardwood boards built for the cut.",
  locationLine: "Est. 2026 · Washington, USA",
  supportMessage: "Questions? Reply to this email and we'll get back to you.",
  orderConfirmation: {
    subject: "Order confirmed — {{orderNumber}}",
    headline: "Order Confirmed",
    intro:
      "{{greeting}} your order is confirmed. We're prepping your board for shipment from Washington.",
    closing: "Thanks for supporting American hardwood.",
    ctaText: "Shop RAX",
  },
  orderShipped: {
    subject: "Your order has shipped — {{orderNumber}}",
    headline: "On The Way",
    intro: "{{greeting}} your RAX order is on the way.",
    trackingFallback: "Your board has shipped. Tracking will follow if available.",
    closing: "We hope it earns a permanent spot in your kitchen.",
    ctaText: "Shop RAX",
  },
  newsletterWelcome: {
    subject: "Welcome to the RAX Crew",
    headline: "You're In",
    intro:
      "You're on the RAX Crew list. We'll send drops, mill notes, and first crack at limited boards.",
    closing: "Built for people who take meat seriously.",
    ctaText: "Shop Boards",
  },
};

export function withSiteDefaults(site: SiteSettings): SiteSettings {
  const footer = site.footer ?? DEFAULT_FOOTER;
  const emailSettings = site.emailSettings ?? DEFAULT_EMAIL_SETTINGS;
  return {
    ...site,
    nav: site.nav ?? { links: DEFAULT_NAV_LINKS },
    footer: {
      ...DEFAULT_FOOTER,
      ...footer,
      social: { ...DEFAULT_FOOTER.social, ...footer.social },
      employeeLoginLabel: footer.employeeLoginLabel ?? DEFAULT_FOOTER.employeeLoginLabel,
      employeeLoginHref: footer.employeeLoginHref ?? DEFAULT_FOOTER.employeeLoginHref,
    },
    reviews: site.reviews ?? DEFAULT_REVIEWS,
    storeSettings: {
      ...DEFAULT_STORE_SETTINGS,
      ...(site.storeSettings ?? {}),
    },
    popup: {
      ...DEFAULT_SITE_POPUP,
      ...(site.popup ?? {}),
    },
    emailSettings: {
      ...DEFAULT_EMAIL_SETTINGS,
      ...emailSettings,
      orderConfirmation: {
        ...DEFAULT_EMAIL_SETTINGS.orderConfirmation,
        ...emailSettings.orderConfirmation,
      },
      orderShipped: {
        ...DEFAULT_EMAIL_SETTINGS.orderShipped,
        ...emailSettings.orderShipped,
      },
      newsletterWelcome: {
        ...DEFAULT_EMAIL_SETTINGS.newsletterWelcome,
        ...emailSettings.newsletterWelcome,
      },
    },
  };
}

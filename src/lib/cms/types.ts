import type { Product, Review, WoodType } from "@/types";

export type CtaLink = {
  text: string;
  href: string;
};

export type AnnouncementSettings = {
  line1: string;
  line2: string;
  ctaText: string;
  ctaHref: string;
};

export type HeroSettings = {
  kicker: string;
  headline: string;
  subheadline: string;
  image: string;
  imagePosition: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
};

export type CollectionBarSettings = {
  left: CtaLink;
  right: CtaLink;
};

export type TrustBadge = {
  id: string;
  title: string;
  copy: string;
};

export type FeatureSection = {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  image: string;
  imagePosition: string;
  variant: "charcoal" | "black" | "ember";
  imageSide: "left" | "right";
  bullets?: string[];
  quote?: string;
  cta?: CtaLink;
};

export type FeaturedSectionSettings = {
  kicker: string;
  headline: string;
  linkText: string;
  linkHref: string;
};

export type ShopPageSettings = {
  kicker: string;
  headline: string;
  description: string;
};

export type PortfolioCategory = "In Action" | "Craft & Detail" | "The Mark";

export type PortfolioItem = {
  id: string;
  title: string;
  category: PortfolioCategory;
  image: string;
  imagePosition: string;
};

export type PortfolioPageSettings = {
  kicker: string;
  headline: string;
  description: string;
};

export type PortfolioSettings = {
  page: PortfolioPageSettings;
  homeKicker: string;
  homeHeadline: string;
  homeDescription: string;
  homeLinkText: string;
  homeLinkHref: string;
  featuredIds: string[];
  items: PortfolioItem[];
};

export type NavLink = {
  href: string;
  label: string;
};

export type FooterSettings = {
  tagline: string;
  locationLine: string;
  newsletterHeadline: string;
  newsletterDescription: string;
  newsletterSuccess: string;
  employeeLoginLabel: string;
  employeeLoginHref: string;
  social: {
    instagram: string;
    facebook: string;
    youtube: string;
  };
};

export type ReviewsSettings = {
  kicker: string;
  headline: string;
  items: Review[];
};

export type Coupon = {
  id: string;
  code: string;
  label: string;
  percentOff: number;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
};

export type StoreSettings = {
  freeShippingThreshold: number;
  standardShippingRate: number;
  lowStockThreshold: number;
  lowStockMessage: string;
  coupons: Coupon[];
};

export type SitePopupSettings = {
  enabled: boolean;
  headline: string;
  body: string;
  ctaText: string;
  ctaHref: string;
};

export type EmailTemplateSettings = {
  subject: string;
  headline: string;
  intro: string;
  closing: string;
  ctaText: string;
};

export type EmailSettings = {
  brandName: string;
  footerTagline: string;
  locationLine: string;
  supportMessage: string;
  orderConfirmation: EmailTemplateSettings;
  orderShipped: EmailTemplateSettings & { trackingFallback: string };
  newsletterWelcome: EmailTemplateSettings;
};

export type SiteSettings = {
  announcement: AnnouncementSettings;
  hero: HeroSettings;
  collectionBar: CollectionBarSettings;
  featuredSection: FeaturedSectionSettings;
  trustBadges: TrustBadge[];
  featureSections: FeatureSection[];
  shopPage: ShopPageSettings;
  portfolio: PortfolioSettings;
  nav: { links: NavLink[] };
  footer: FooterSettings;
  reviews: ReviewsSettings;
  storeSettings: StoreSettings;
  popup: SitePopupSettings;
  emailSettings: EmailSettings;
};

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  "In Action",
  "Craft & Detail",
  "The Mark",
];

export type CmsProduct = Product;

export type CmsData = {
  version: number;
  updatedAt: string;
  site: SiteSettings;
  products: CmsProduct[];
};

export type CmsProductInput = Omit<CmsProduct, "id" | "slug"> & {
  id?: string;
  slug?: string;
};

export const WOOD_TYPES: WoodType[] = ["Maple", "Walnut", "Cherry", "Oak"];

"use client";

import {
  AdminPanel,
  FieldLabel,
  ImagePicker,
} from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  CmsData,
  FeatureSection,
  NavLink,
} from "@/lib/cms/types";
import type { Review } from "@/types";
import { PORTFOLIO_CATEGORIES } from "@/lib/cms/types";

type EditorProps = {
  cms: CmsData;
  setCms: React.Dispatch<React.SetStateAction<CmsData | null>>;
  images: string[];
  onUploaded?: (url: string) => void;
};

function updateSite(setCms: EditorProps["setCms"], patch: Partial<CmsData["site"]>) {
  setCms((current) =>
    current ? { ...current, site: { ...current.site, ...patch } } : current
  );
}

export function CollectionBarPanel({ cms, setCms }: EditorProps) {
  const { collectionBar: bar } = cms.site;
  return (
    <AdminPanel title="Collection Bar">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Left Text</FieldLabel>
          <Input
            value={bar.left.text}
            onChange={(e) =>
              updateSite(setCms, {
                collectionBar: { ...bar, left: { ...bar.left, text: e.target.value } },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Left Link</FieldLabel>
          <Input
            value={bar.left.href}
            onChange={(e) =>
              updateSite(setCms, {
                collectionBar: { ...bar, left: { ...bar.left, href: e.target.value } },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Right Text</FieldLabel>
          <Input
            value={bar.right.text}
            onChange={(e) =>
              updateSite(setCms, {
                collectionBar: { ...bar, right: { ...bar.right, text: e.target.value } },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Right Link</FieldLabel>
          <Input
            value={bar.right.href}
            onChange={(e) =>
              updateSite(setCms, {
                collectionBar: { ...bar, right: { ...bar.right, href: e.target.value } },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
      </div>
    </AdminPanel>
  );
}

export function FeaturedSectionPanel({ cms, setCms }: EditorProps) {
  const featured = cms.site.featuredSection;
  return (
    <AdminPanel title="Featured Products Section">
      <div className="grid gap-4 md:grid-cols-2">
        {(["kicker", "headline"] as const).map((key) => (
          <div key={key}>
            <FieldLabel>{key === "kicker" ? "Kicker" : "Headline"}</FieldLabel>
            <Input
              value={featured[key]}
              onChange={(e) =>
                updateSite(setCms, { featuredSection: { ...featured, [key]: e.target.value } })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
        ))}
        <div>
          <FieldLabel>Link Text</FieldLabel>
          <Input
            value={featured.linkText}
            onChange={(e) =>
              updateSite(setCms, {
                featuredSection: { ...featured, linkText: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Link URL</FieldLabel>
          <Input
            value={featured.linkHref}
            onChange={(e) =>
              updateSite(setCms, {
                featuredSection: { ...featured, linkHref: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
      </div>
    </AdminPanel>
  );
}

export function HeroExtrasPanel({ cms, setCms }: EditorProps) {
  const hero = cms.site.hero;
  return (
    <AdminPanel title="Hero — Layout & Secondary CTA">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Secondary CTA Text</FieldLabel>
          <Input
            value={hero.secondaryCta.text}
            onChange={(e) =>
              updateSite(setCms, {
                hero: {
                  ...hero,
                  secondaryCta: { ...hero.secondaryCta, text: e.target.value },
                },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Secondary CTA Link</FieldLabel>
          <Input
            value={hero.secondaryCta.href}
            onChange={(e) =>
              updateSite(setCms, {
                hero: {
                  ...hero,
                  secondaryCta: { ...hero.secondaryCta, href: e.target.value },
                },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Image Position (CSS object-position)</FieldLabel>
          <Input
            value={hero.imagePosition}
            onChange={(e) =>
              updateSite(setCms, { hero: { ...hero, imagePosition: e.target.value } })
            }
            className="border-white/20 bg-black text-white"
            placeholder="50% 45%"
          />
        </div>
      </div>
    </AdminPanel>
  );
}

export function FeatureLayoutPanel({
  cms,
  setCms,
  index,
}: EditorProps & { index: number }) {
  const section = cms.site.featureSections[index];
  if (!section) return null;

  function patchFeature(patch: Partial<FeatureSection>) {
    const featureSections = [...cms.site.featureSections];
    featureSections[index] = { ...section, ...patch };
    updateSite(setCms, { featureSections });
  }

  return (
    <div className="grid gap-4 border-t border-white/10 pt-4 md:grid-cols-3">
      <div>
        <FieldLabel>Variant</FieldLabel>
        <select
          value={section.variant}
          onChange={(e) =>
            patchFeature({ variant: e.target.value as FeatureSection["variant"] })
          }
          className="h-10 w-full rounded-md border border-white/20 bg-black px-3 text-white"
        >
          <option value="charcoal">Charcoal</option>
          <option value="black">Black</option>
          <option value="ember">Ember</option>
        </select>
      </div>
      <div>
        <FieldLabel>Image Side</FieldLabel>
        <select
          value={section.imageSide}
          onChange={(e) =>
            patchFeature({ imageSide: e.target.value as FeatureSection["imageSide"] })
          }
          className="h-10 w-full rounded-md border border-white/20 bg-black px-3 text-white"
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div>
        <FieldLabel>Image Position</FieldLabel>
        <Input
          value={section.imagePosition}
          onChange={(e) => patchFeature({ imagePosition: e.target.value })}
          className="border-white/20 bg-black text-white"
        />
      </div>
    </div>
  );
}

export function PortfolioExtrasPanel({ cms, setCms }: EditorProps) {
  const portfolio = cms.site.portfolio;
  return (
    <AdminPanel title="Portfolio — Homepage Teaser">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Homepage Description</FieldLabel>
          <textarea
            value={portfolio.homeDescription}
            onChange={(e) =>
              updateSite(setCms, {
                portfolio: { ...portfolio, homeDescription: e.target.value },
              })
            }
            rows={3}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        <div>
          <FieldLabel>Home Link Text</FieldLabel>
          <Input
            value={portfolio.homeLinkText}
            onChange={(e) =>
              updateSite(setCms, {
                portfolio: { ...portfolio, homeLinkText: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Home Link URL</FieldLabel>
          <Input
            value={portfolio.homeLinkHref}
            onChange={(e) =>
              updateSite(setCms, {
                portfolio: { ...portfolio, homeLinkHref: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Featured on Homepage (comma-separated item IDs)</FieldLabel>
          <Input
            value={portfolio.featuredIds.join(", ")}
            onChange={(e) =>
              updateSite(setCms, {
                portfolio: {
                  ...portfolio,
                  featuredIds: e.target.value
                    .split(",")
                    .map((id) => id.trim())
                    .filter(Boolean),
                },
              })
            }
            className="border-white/20 bg-black text-white"
            placeholder="brisket-service, drip-tray, steak-rest"
          />
          <p className="mt-2 text-xs text-white/50">
            IDs: {portfolio.items.map((item) => item.id).join(", ")}
          </p>
        </div>
      </div>
    </AdminPanel>
  );
}

export function NavPanel({ cms, setCms }: EditorProps) {
  const links = cms.site.nav.links;

  function updateLink(index: number, patch: Partial<NavLink>) {
    const next = [...links];
    next[index] = { ...next[index], ...patch };
    updateSite(setCms, { nav: { links: next } });
  }

  function addLink() {
    updateSite(setCms, {
      nav: { links: [...links, { href: "/", label: "New Link" }] },
    });
  }

  function removeLink(index: number) {
    updateSite(setCms, { nav: { links: links.filter((_, i) => i !== index) } });
  }

  return (
    <AdminPanel title="Navigation Links">
      {links.map((link, index) => (
        <div key={`${link.href}-${index}`} className="mb-4 grid gap-3 border-b border-white/10 pb-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <FieldLabel>Label</FieldLabel>
            <Input
              value={link.label}
              onChange={(e) => updateLink(index, { label: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>URL</FieldLabel>
            <Input
              value={link.href}
              onChange={(e) => updateLink(index, { href: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={() => removeLink(index)}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addLink}>
        Add Nav Link
      </Button>
    </AdminPanel>
  );
}

export function FooterPanel({ cms, setCms }: EditorProps) {
  const footer = cms.site.footer;
  return (
    <AdminPanel title="Footer">
      <div className="grid gap-4">
        <div>
          <FieldLabel>Brand Tagline</FieldLabel>
          <textarea
            value={footer.tagline}
            onChange={(e) =>
              updateSite(setCms, { footer: { ...footer, tagline: e.target.value } })
            }
            rows={3}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        <div>
          <FieldLabel>Location Line</FieldLabel>
          <Input
            value={footer.locationLine}
            onChange={(e) =>
              updateSite(setCms, { footer: { ...footer, locationLine: e.target.value } })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Newsletter Headline</FieldLabel>
          <Input
            value={footer.newsletterHeadline}
            onChange={(e) =>
              updateSite(setCms, {
                footer: { ...footer, newsletterHeadline: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Newsletter Description</FieldLabel>
          <textarea
            value={footer.newsletterDescription}
            onChange={(e) =>
              updateSite(setCms, {
                footer: { ...footer, newsletterDescription: e.target.value },
              })
            }
            rows={2}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        <div>
          <FieldLabel>Newsletter Success Message</FieldLabel>
          <Input
            value={footer.newsletterSuccess}
            onChange={(e) =>
              updateSite(setCms, {
                footer: { ...footer, newsletterSuccess: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Employee Login Label</FieldLabel>
          <Input
            value={footer.employeeLoginLabel}
            onChange={(e) =>
              updateSite(setCms, {
                footer: { ...footer, employeeLoginLabel: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
            placeholder="Employee Login"
          />
        </div>
        <div>
          <FieldLabel>Employee Login URL</FieldLabel>
          <Input
            value={footer.employeeLoginHref}
            onChange={(e) =>
              updateSite(setCms, {
                footer: { ...footer, employeeLoginHref: e.target.value },
              })
            }
            className="border-white/20 bg-black text-white"
            placeholder="/admin"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(["instagram", "facebook", "youtube"] as const).map((network) => (
            <div key={network}>
              <FieldLabel>{network} URL</FieldLabel>
              <Input
                value={footer.social[network]}
                onChange={(e) =>
                  updateSite(setCms, {
                    footer: {
                      ...footer,
                      social: { ...footer.social, [network]: e.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </AdminPanel>
  );
}

export function ReviewsPanel({ cms, setCms, images, onUploaded }: EditorProps) {
  const reviews = cms.site.reviews;

  function updateReview(index: number, patch: Partial<Review>) {
    const items = [...reviews.items];
    items[index] = { ...items[index], ...patch };
    updateSite(setCms, { reviews: { ...reviews, items } });
  }

  function addReview() {
    updateSite(setCms, {
      reviews: {
        ...reviews,
        items: [
          ...reviews.items,
          {
            id: `r${Date.now()}`,
            name: "New Reviewer",
            location: "City, ST",
            rating: 5,
            title: "Review title",
            body: "Review body",
            product: "RAX Original Drip Board",
            image: images[0] ?? "/images/hero.jpg",
            date: "Aug 2026",
          },
        ],
      },
    });
  }

  function removeReview(index: number) {
    updateSite(setCms, {
      reviews: { ...reviews, items: reviews.items.filter((_, i) => i !== index) },
    });
  }

  return (
    <>
      <AdminPanel title="Reviews Section Header">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Kicker</FieldLabel>
            <Input
              value={reviews.kicker}
              onChange={(e) =>
                updateSite(setCms, { reviews: { ...reviews, kicker: e.target.value } })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>Headline</FieldLabel>
            <Input
              value={reviews.headline}
              onChange={(e) =>
                updateSite(setCms, { reviews: { ...reviews, headline: e.target.value } })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
      </AdminPanel>

      {reviews.items.map((review, index) => (
        <AdminPanel key={review.id} title={`Review: ${review.name}`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Name</FieldLabel>
              <Input
                value={review.name}
                onChange={(e) => updateReview(index, { name: e.target.value })}
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input
                value={review.location}
                onChange={(e) => updateReview(index, { location: e.target.value })}
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Title</FieldLabel>
              <Input
                value={review.title}
                onChange={(e) => updateReview(index, { title: e.target.value })}
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Product</FieldLabel>
              <Input
                value={review.product}
                onChange={(e) => updateReview(index, { product: e.target.value })}
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Rating (1-5)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={5}
                value={review.rating}
                onChange={(e) =>
                  updateReview(index, { rating: Number(e.target.value) || 5 })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Date</FieldLabel>
              <Input
                value={review.date}
                onChange={(e) => updateReview(index, { date: e.target.value })}
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Body</FieldLabel>
              <textarea
                value={review.body}
                onChange={(e) => updateReview(index, { body: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Image</FieldLabel>
              <ImagePicker
                value={review.image}
                images={images}
                onUploaded={onUploaded}
                onChange={(value) => updateReview(index, { image: value })}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => removeReview(index)}
          >
            Remove Review
          </Button>
        </AdminPanel>
      ))}

      <Button type="button" variant="outline" onClick={addReview}>
        Add Review
      </Button>
    </>
  );
}

export function EmailSettingsPanel({ cms, setCms }: EditorProps) {
  const email = cms.site.emailSettings;

  function patchEmail(patch: Partial<typeof email>) {
    updateSite(setCms, { emailSettings: { ...email, ...patch } });
  }

  function patchTemplate<
    K extends "orderConfirmation" | "orderShipped" | "newsletterWelcome",
  >(key: K, patch: Partial<(typeof email)[K]>) {
    updateSite(setCms, {
      emailSettings: { ...email, [key]: { ...email[key], ...patch } },
    });
  }

  return (
    <>
      <AdminPanel title="Email Branding">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Company Name</FieldLabel>
            <Input
              value={email.brandName}
              onChange={(e) => patchEmail({ brandName: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>Location Line</FieldLabel>
            <Input
              value={email.locationLine}
              onChange={(e) => patchEmail({ locationLine: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Footer Tagline</FieldLabel>
            <Input
              value={email.footerTagline}
              onChange={(e) => patchEmail({ footerTagline: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Support Message</FieldLabel>
            <Input
              value={email.supportMessage}
              onChange={(e) => patchEmail({ supportMessage: e.target.value })}
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">
          Emails send through Resend. Preview from Dashboard → Send Test Email. Placeholders:{" "}
          {"{{greeting}}"}, {"{{orderNumber}}"}, {"{{total}}"}.
        </p>
      </AdminPanel>

      <EmailTemplatePanel
        title="Order Confirmation"
        copy={email.orderConfirmation}
        onChange={(patch) => patchTemplate("orderConfirmation", patch)}
      />
      <EmailTemplatePanel
        title="Shipping Notification"
        copy={email.orderShipped}
        onChange={(patch) => patchTemplate("orderShipped", patch)}
        extraFields={
          <div>
            <FieldLabel>No Tracking Message</FieldLabel>
            <Input
              value={email.orderShipped.trackingFallback}
              onChange={(e) =>
                patchTemplate("orderShipped", { trackingFallback: e.target.value })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
        }
      />
      <EmailTemplatePanel
        title="Newsletter Welcome"
        copy={email.newsletterWelcome}
        onChange={(patch) => patchTemplate("newsletterWelcome", patch)}
      />
    </>
  );
}

function EmailTemplatePanel({
  title,
  copy,
  onChange,
  extraFields,
}: {
  title: string;
  copy: {
    subject: string;
    headline: string;
    intro: string;
    closing: string;
    ctaText: string;
  };
  onChange: (patch: Partial<typeof copy>) => void;
  extraFields?: React.ReactNode;
}) {
  return (
    <AdminPanel title={title}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel>Subject</FieldLabel>
          <Input
            value={copy.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Headline</FieldLabel>
          <Input
            value={copy.headline}
            onChange={(e) => onChange({ headline: e.target.value })}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Intro</FieldLabel>
          <textarea
            value={copy.intro}
            onChange={(e) => onChange({ intro: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        {extraFields ? <div className="md:col-span-2">{extraFields}</div> : null}
        <div className="md:col-span-2">
          <FieldLabel>Closing Line</FieldLabel>
          <Input
            value={copy.closing}
            onChange={(e) => onChange({ closing: e.target.value })}
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Button Text</FieldLabel>
          <Input
            value={copy.ctaText}
            onChange={(e) => onChange({ ctaText: e.target.value })}
            className="border-white/20 bg-black text-white"
          />
        </div>
      </div>
    </AdminPanel>
  );
}

export function StoreSettingsPanel({ cms, setCms }: EditorProps) {
  const settings = cms.site.storeSettings;
  return (
    <>
      <AdminPanel title="Store Settings">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel>Free Shipping Threshold ($)</FieldLabel>
            <Input
              type="number"
              min={0}
              step={1}
              value={settings.freeShippingThreshold}
              onChange={(e) =>
                updateSite(setCms, {
                  storeSettings: {
                    ...settings,
                    freeShippingThreshold: Number(e.target.value) || 0,
                  },
                })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>Standard Shipping Rate ($)</FieldLabel>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={settings.standardShippingRate}
              onChange={(e) =>
                updateSite(setCms, {
                  storeSettings: {
                    ...settings,
                    standardShippingRate: Number(e.target.value) || 0,
                  },
                })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>Low Stock Threshold (admin + customer alert)</FieldLabel>
            <Input
              type="number"
              min={1}
              step={1}
              value={settings.lowStockThreshold}
              onChange={(e) =>
                updateSite(setCms, {
                  storeSettings: {
                    ...settings,
                    lowStockThreshold: Number(e.target.value) || 10,
                  },
                })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
          <div>
            <FieldLabel>Low Stock Message (shown to customers)</FieldLabel>
            <Input
              value={settings.lowStockMessage}
              onChange={(e) =>
                updateSite(setCms, {
                  storeSettings: {
                    ...settings,
                    lowStockMessage: e.target.value,
                  },
                })
              }
              className="border-white/20 bg-black text-white"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-white/50">
          Exact inventory counts are admin-only. Customers see the low stock message when inventory
          drops below the threshold. Also update the announcement bar if you change free shipping.
        </p>
      </AdminPanel>
    </>
  );
}

export function PopupSettingsPanel({ cms, setCms }: EditorProps) {
  const popup = cms.site.popup;
  return (
    <AdminPanel title="Site Popup">
      <label className="mb-4 flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          checked={popup.enabled}
          onChange={(e) =>
            updateSite(setCms, {
              popup: { ...popup, enabled: e.target.checked },
            })
          }
        />
        Show popup on the storefront
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>Headline</FieldLabel>
          <Input
            value={popup.headline}
            onChange={(e) =>
              updateSite(setCms, { popup: { ...popup, headline: e.target.value } })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>Body</FieldLabel>
          <textarea
            value={popup.body}
            onChange={(e) => updateSite(setCms, { popup: { ...popup, body: e.target.value } })}
            rows={4}
            className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
          />
        </div>
        <div>
          <FieldLabel>Button Text</FieldLabel>
          <Input
            value={popup.ctaText}
            onChange={(e) =>
              updateSite(setCms, { popup: { ...popup, ctaText: e.target.value } })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
        <div>
          <FieldLabel>Button Link</FieldLabel>
          <Input
            value={popup.ctaHref}
            onChange={(e) =>
              updateSite(setCms, { popup: { ...popup, ctaHref: e.target.value } })
            }
            className="border-white/20 bg-black text-white"
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-white/50">
        Popup appears once per browser session until dismissed. For always-on messages, use the
        announcement bar on the Homepage tab.
      </p>
    </AdminPanel>
  );
}

export const SITE_EDITOR_TABS = [
  "Homepage",
  "Shop & Features",
  "Portfolio",
  "Reviews",
  "Footer & Nav",
  "Store",
  "Emails",
] as const;

export type SiteEditorTab = (typeof SITE_EDITOR_TABS)[number];

export { PORTFOLIO_CATEGORIES };

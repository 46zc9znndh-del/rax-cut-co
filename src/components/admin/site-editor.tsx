"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
  FieldLabel,
  ImagePicker,
  SaveBar,
  useAdminCms,
} from "@/components/admin/admin-shell";
import {
  CollectionBarPanel,
  EmailSettingsPanel,
  FeaturedSectionPanel,
  FeatureLayoutPanel,
  FooterPanel,
  HeroExtrasPanel,
  NavPanel,
  PortfolioExtrasPanel,
  PopupSettingsPanel,
  ReviewsPanel,
  SITE_EDITOR_TABS,
  StoreSettingsPanel,
  type SiteEditorTab,
} from "@/components/admin/site-editor-extra-panels";
import { NewsletterBroadcastPanel } from "@/components/admin/newsletter-broadcast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeatureSection } from "@/lib/cms/types";

export function SiteEditorPage() {
  const router = useRouter();
  const { loading, error, cms, setCms, images, addToLibrary, saving, savedAt, save } = useAdminCms();
  const [tab, setTab] = useState<SiteEditorTab>("Homepage");

  useEffect(() => {
    if (error === "Unauthorized") {
      router.push("/admin");
    }
  }, [error, router]);

  if (loading) {
    return (
      <AdminShell title="Site Editor">
        <p className="text-white/60">Loading site content...</p>
      </AdminShell>
    );
  }

  if (!cms) {
    return (
      <AdminShell title="Site Editor">
        <p className="text-red-400">{error || "Unable to load site content."}</p>
      </AdminShell>
    );
  }

  const { site } = cms;

  async function handleSave() {
    if (!cms) return;
    await save(cms);
  }

  function addPortfolioItem() {
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        site: {
          ...current.site,
          portfolio: {
            ...current.site.portfolio,
            items: [
              ...current.site.portfolio.items,
              {
                id: `p${Date.now()}`,
                title: "New Photo",
                category: "In Action" as const,
                image: images[0] ?? "/images/portfolio/steak-rest.jpg",
                imagePosition: "50% 50%",
              },
            ],
          },
        },
      };
    });
  }

  function removePortfolioItem(index: number) {
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        site: {
          ...current.site,
          portfolio: {
            ...current.site.portfolio,
            items: current.site.portfolio.items.filter((_, i) => i !== index),
          },
        },
      };
    });
  }

  function updateFeatureSection(index: number, patch: Partial<FeatureSection>) {
    setCms((current) => {
      if (!current) return current;
      const featureSections = [...current.site.featureSections];
      featureSections[index] = { ...featureSections[index], ...patch };
      return {
        ...current,
        site: { ...current.site, featureSections },
      };
    });
  }

  return (
    <AdminShell title="Site Editor">
      <div className="mb-6 flex flex-wrap gap-2">
        {SITE_EDITOR_TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "border px-3 py-2 font-display text-[11px] tracking-[0.16em] uppercase transition-colors",
              tab === item
                ? "border-rax-ember bg-rax-ember text-white"
                : "border-white/20 text-white/70 hover:border-white/40 hover:text-white"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === "Homepage" ? (
          <>
        <AdminPanel title="Announcement Bar">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Line 1</FieldLabel>
              <Input
                value={site.announcement.line1}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      announcement: { ...site.announcement, line1: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Line 2</FieldLabel>
              <Input
                value={site.announcement.line2}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      announcement: { ...site.announcement, line2: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>CTA Text</FieldLabel>
              <Input
                value={site.announcement.ctaText}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      announcement: { ...site.announcement, ctaText: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>CTA Link</FieldLabel>
              <Input
                value={site.announcement.ctaHref}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      announcement: { ...site.announcement, ctaHref: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Hero Section">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel>Kicker</FieldLabel>
              <Input
                value={site.hero.kicker}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: { ...site, hero: { ...site.hero, kicker: event.target.value } },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Headline (use line breaks)</FieldLabel>
              <textarea
                value={site.hero.headline}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: { ...site, hero: { ...site.hero, headline: event.target.value } },
                  })
                }
                rows={3}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Subheadline</FieldLabel>
              <textarea
                value={site.hero.subheadline}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: { ...site, hero: { ...site.hero, subheadline: event.target.value } },
                  })
                }
                rows={3}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
              />
            </div>
            <div>
              <FieldLabel>Primary CTA Text</FieldLabel>
              <Input
                value={site.hero.primaryCta.text}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      hero: {
                        ...site.hero,
                        primaryCta: { ...site.hero.primaryCta, text: event.target.value },
                      },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Primary CTA Link</FieldLabel>
              <Input
                value={site.hero.primaryCta.href}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      hero: {
                        ...site.hero,
                        primaryCta: { ...site.hero.primaryCta, href: event.target.value },
                      },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Hero Image</FieldLabel>
              <ImagePicker
                value={site.hero.image}
                images={images}
                onUploaded={addToLibrary}
                onChange={(value) =>
                  setCms({
                    ...cms,
                    site: { ...site, hero: { ...site.hero, image: value } },
                  })
                }
              />
            </div>
          </div>
        </AdminPanel>

        <HeroExtrasPanel cms={cms} setCms={setCms} images={images} />
        <CollectionBarPanel cms={cms} setCms={setCms} images={images} />
        <FeaturedSectionPanel cms={cms} setCms={setCms} images={images} />

        <AdminPanel title="Trust Badges">
          {site.trustBadges.map((badge, index) => (
            <div key={badge.id} className="grid gap-4 border-b border-white/10 pb-4 last:border-0">
              <div>
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={badge.title}
                  onChange={(event) => {
                    const trustBadges = [...site.trustBadges];
                    trustBadges[index] = { ...badge, title: event.target.value };
                    setCms({ ...cms, site: { ...site, trustBadges } });
                  }}
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div>
                <FieldLabel>Copy</FieldLabel>
                <textarea
                  value={badge.copy}
                  onChange={(event) => {
                    const trustBadges = [...site.trustBadges];
                    trustBadges[index] = { ...badge, copy: event.target.value };
                    setCms({ ...cms, site: { ...site, trustBadges } });
                  }}
                  rows={2}
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
                />
              </div>
            </div>
          ))}
        </AdminPanel>
          </>
        ) : null}

        {tab === "Shop & Features" ? (
          <>
        <AdminPanel title="Shop Page">
          <div className="grid gap-4">
            <div>
              <FieldLabel>Kicker</FieldLabel>
              <Input
                value={site.shopPage.kicker}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      shopPage: { ...site.shopPage, kicker: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Headline</FieldLabel>
              <Input
                value={site.shopPage.headline}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      shopPage: { ...site.shopPage, headline: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={site.shopPage.description}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      shopPage: { ...site.shopPage, description: event.target.value },
                    },
                  })
                }
                rows={3}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
              />
            </div>
          </div>
        </AdminPanel>

        {site.featureSections.map((section, index) => (
          <AdminPanel key={section.id} title={`Feature: ${section.kicker}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel>Kicker</FieldLabel>
                <Input
                  value={section.kicker}
                  onChange={(event) =>
                    updateFeatureSection(index, { kicker: event.target.value })
                  }
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div>
                <FieldLabel>Headline</FieldLabel>
                <Input
                  value={section.headline}
                  onChange={(event) =>
                    updateFeatureSection(index, { headline: event.target.value })
                  }
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Body</FieldLabel>
                <textarea
                  value={section.body}
                  onChange={(event) =>
                    updateFeatureSection(index, { body: event.target.value })
                  }
                  rows={4}
                  className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <FieldLabel>Image</FieldLabel>
                <ImagePicker
                  value={section.image}
                  images={images}
                  onUploaded={addToLibrary}
                  onChange={(value) => updateFeatureSection(index, { image: value })}
                />
              </div>
              {section.bullets ? (
                <div className="md:col-span-2">
                  <FieldLabel>Bullets (one per line)</FieldLabel>
                  <textarea
                    value={section.bullets.join("\n")}
                    onChange={(event) =>
                      updateFeatureSection(index, {
                        bullets: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                    rows={4}
                    className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
                  />
                </div>
              ) : null}
              {section.quote !== undefined ? (
                <div className="md:col-span-2">
                  <FieldLabel>Quote</FieldLabel>
                  <Input
                    value={section.quote || ""}
                    onChange={(event) =>
                      updateFeatureSection(index, { quote: event.target.value })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
              ) : null}
              {section.cta ? (
                <>
                  <div>
                    <FieldLabel>CTA Text</FieldLabel>
                    <Input
                      value={section.cta.text}
                      onChange={(event) =>
                        updateFeatureSection(index, {
                          cta: { ...section.cta!, text: event.target.value },
                        })
                      }
                      className="border-white/20 bg-black text-white"
                    />
                  </div>
                  <div>
                    <FieldLabel>CTA Link</FieldLabel>
                    <Input
                      value={section.cta.href}
                      onChange={(event) =>
                        updateFeatureSection(index, {
                          cta: { ...section.cta!, href: event.target.value },
                        })
                      }
                      className="border-white/20 bg-black text-white"
                    />
                  </div>
                </>
              ) : null}
              <FeatureLayoutPanel cms={cms} setCms={setCms} images={images} index={index} />
            </div>
          </AdminPanel>
        ))}
          </>
        ) : null}

        {tab === "Portfolio" ? (
          <>
        <AdminPanel title="Portfolio">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Page Kicker</FieldLabel>
              <Input
                value={site.portfolio.page.kicker}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      portfolio: {
                        ...site.portfolio,
                        page: { ...site.portfolio.page, kicker: event.target.value },
                      },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Page Headline</FieldLabel>
              <Input
                value={site.portfolio.page.headline}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      portfolio: {
                        ...site.portfolio,
                        page: { ...site.portfolio.page, headline: event.target.value },
                      },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Page Description</FieldLabel>
              <textarea
                value={site.portfolio.page.description}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      portfolio: {
                        ...site.portfolio,
                        page: { ...site.portfolio.page, description: event.target.value },
                      },
                    },
                  })
                }
                rows={3}
                className="w-full rounded-md border border-white/20 bg-black px-3 py-2 text-white"
              />
            </div>
            <div>
              <FieldLabel>Homepage Kicker</FieldLabel>
              <Input
                value={site.portfolio.homeKicker}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      portfolio: { ...site.portfolio, homeKicker: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
            <div>
              <FieldLabel>Homepage Headline</FieldLabel>
              <Input
                value={site.portfolio.homeHeadline}
                onChange={(event) =>
                  setCms({
                    ...cms,
                    site: {
                      ...site,
                      portfolio: { ...site.portfolio, homeHeadline: event.target.value },
                    },
                  })
                }
                className="border-white/20 bg-black text-white"
              />
            </div>
          </div>

          {site.portfolio.items.map((item, index) => (
            <div key={item.id} className="mt-6 space-y-4 border-t border-white/10 pt-6">
              <div>
                <FieldLabel>Title</FieldLabel>
                <Input
                  value={item.title}
                  onChange={(event) => {
                    const items = [...site.portfolio.items];
                    items[index] = { ...item, title: event.target.value };
                    setCms({
                      ...cms,
                      site: { ...site, portfolio: { ...site.portfolio, items } },
                    });
                  }}
                  className="border-white/20 bg-black text-white"
                />
              </div>
              <div>
                <FieldLabel>Photo</FieldLabel>
                <ImagePicker
                  value={item.image}
                  images={images}
                  onChange={(value) => {
                    const items = [...site.portfolio.items];
                    items[index] = { ...item, image: value };
                    setCms({
                      ...cms,
                      site: { ...site, portfolio: { ...site.portfolio, items } },
                    });
                  }}
                  onUploaded={addToLibrary}
                  canDelete
                  onDelete={() => removePortfolioItem(index)}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="default" className="mt-6" onClick={addPortfolioItem}>
            + Add Photo
          </Button>
        </AdminPanel>

        <PortfolioExtrasPanel cms={cms} setCms={setCms} images={images} />
          </>
        ) : null}

        {tab === "Reviews" ? (
          <ReviewsPanel cms={cms} setCms={setCms} images={images} onUploaded={addToLibrary} />
        ) : null}

        {tab === "Footer & Nav" ? (
          <>
            <NavPanel cms={cms} setCms={setCms} images={images} />
            <FooterPanel cms={cms} setCms={setCms} images={images} />
          </>
        ) : null}

        {tab === "Store" ? (
          <>
            <StoreSettingsPanel cms={cms} setCms={setCms} images={images} />
            <PopupSettingsPanel cms={cms} setCms={setCms} images={images} />
          </>
        ) : null}

        {tab === "Emails" ? (
          <>
            <EmailSettingsPanel cms={cms} setCms={setCms} images={images} />
            <NewsletterBroadcastPanel />
          </>
        ) : null}
      </div>

      <div className="mt-8">
        <SaveBar
          saving={saving}
          savedAt={savedAt}
          error={error === "Unauthorized" ? "" : error}
          onSave={handleSave}
        />
      </div>
    </AdminShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminPanel,
  AdminShell,
  FieldLabel,
  SaveBar,
  useAdminCms,
} from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Coupon } from "@/lib/cms/types";
import {
  createCoupon,
  fromDatetimeLocalValue,
  normalizeCouponCode,
  toDatetimeLocalValue,
  validateCoupon,
} from "@/lib/coupons";
import { cn } from "@/lib/utils";

function couponStatus(coupon: Coupon) {
  const validation = validateCoupon(coupon);
  if (!validation.ok) return validation.error;
  return `Active · ${coupon.percentOff}% off`;
}

export function CouponsAdminPage() {
  const router = useRouter();
  const { loading, error, cms, setCms, saving, savedAt, save } = useAdminCms();
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (error === "Unauthorized") {
      router.push("/admin");
    }
  }, [error, router]);

  if (loading) {
    return (
      <AdminShell title="Coupons">
        <p className="text-white/60">Loading coupons...</p>
      </AdminShell>
    );
  }

  if (!cms) {
    return (
      <AdminShell title="Coupons">
        <p className="text-red-400">{error || "Unable to load coupons."}</p>
      </AdminShell>
    );
  }

  const coupons = cms.site.storeSettings.coupons ?? [];

  function updateCoupon(index: number, patch: Partial<Coupon>) {
    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      const nextCoupons = [...current.site.storeSettings.coupons];
      nextCoupons[index] = { ...nextCoupons[index], ...patch };
      return {
        ...current,
        site: {
          ...current.site,
          storeSettings: {
            ...current.site.storeSettings,
            coupons: nextCoupons,
          },
        },
      };
    });
  }

  function addCoupon() {
    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        site: {
          ...current.site,
          storeSettings: {
            ...current.site.storeSettings,
            coupons: [...current.site.storeSettings.coupons, createCoupon()],
          },
        },
      };
    });
  }

  function removeCoupon(index: number) {
    const coupon = coupons[index];
    if (
      !window.confirm(
        `Remove coupon "${coupon.code}"? Customers won't be able to use it after you save.`
      )
    ) {
      return;
    }

    setValidationError("");
    setCms((current) => {
      if (!current) return current;
      return {
        ...current,
        site: {
          ...current.site,
          storeSettings: {
            ...current.site.storeSettings,
            coupons: current.site.storeSettings.coupons.filter((_, i) => i !== index),
          },
        },
      };
    });
  }

  async function handleSave() {
    if (!cms) return;

    const nextCoupons = cms.site.storeSettings.coupons.map((coupon) => ({
      ...coupon,
      code: normalizeCouponCode(coupon.code),
      label: coupon.label.trim(),
      percentOff: Math.min(100, Math.max(1, Math.round(Number(coupon.percentOff) || 0))),
    }));

    const codes = new Set<string>();
    for (const coupon of nextCoupons) {
      if (!coupon.code) {
        setValidationError("Every coupon needs a code.");
        return;
      }
      if (codes.has(coupon.code)) {
        setValidationError(`Duplicate coupon code: ${coupon.code}`);
        return;
      }
      codes.add(coupon.code);
    }

    const next = {
      ...cms,
      site: {
        ...cms.site,
        storeSettings: {
          ...cms.site.storeSettings,
          coupons: nextCoupons,
        },
      },
    };

    setValidationError("");
    await save(next);
  }

  return (
    <AdminShell title="Coupons">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-sm text-white/60">
          Create takeaway promo codes with a discount percentage and active window. Customers enter
          codes at checkout — discounts are validated on the server and synced to Stripe promotion
          codes when you save.
        </p>
        <Button type="button" onClick={addCoupon}>
          Add Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <AdminPanel title="No coupons yet">
          <p className="text-sm text-white/60">
            Add your first promo code for launch offers, email campaigns, or influencer takeaways.
          </p>
          <Button type="button" className="mt-4" onClick={addCoupon}>
            Add Coupon
          </Button>
        </AdminPanel>
      ) : null}

      <div className="space-y-6">
        {coupons.map((coupon, index) => {
          const status = couponStatus(coupon);

          return (
            <AdminPanel key={coupon.id} title={coupon.code || "New coupon"}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p
                  className={cn(
                    "text-xs tracking-[0.14em] uppercase",
                    status.startsWith("Active") ? "text-emerald-400" : "text-amber-300"
                  )}
                >
                  {status}
                  {coupon.stripePromotionCodeId ? " · Stripe synced" : " · Stripe pending"}
                </p>
                <Button
                  type="button"
                  variant="dark"
                  size="sm"
                  className="border-red-500/60 text-red-400 hover:bg-red-950"
                  onClick={() => removeCoupon(index)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Promo Code</FieldLabel>
                  <Input
                    value={coupon.code}
                    onChange={(event) =>
                      updateCoupon(index, { code: event.target.value.toUpperCase() })
                    }
                    placeholder="TAKE10"
                    className="border-white/20 bg-black font-mono uppercase text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Label (internal)</FieldLabel>
                  <Input
                    value={coupon.label}
                    onChange={(event) => updateCoupon(index, { label: event.target.value })}
                    placeholder="Instagram launch"
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Discount %</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={coupon.percentOff}
                    onChange={(event) =>
                      updateCoupon(index, { percentOff: Number(event.target.value) })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={coupon.enabled}
                      onChange={(event) =>
                        updateCoupon(index, { enabled: event.target.checked })
                      }
                    />
                    Enabled
                  </label>
                </div>
                <div>
                  <FieldLabel>Starts</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={toDatetimeLocalValue(coupon.startsAt)}
                    onChange={(event) =>
                      updateCoupon(index, {
                        startsAt: fromDatetimeLocalValue(event.target.value),
                      })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
                <div>
                  <FieldLabel>Ends</FieldLabel>
                  <Input
                    type="datetime-local"
                    value={toDatetimeLocalValue(coupon.endsAt)}
                    onChange={(event) =>
                      updateCoupon(index, { endsAt: fromDatetimeLocalValue(event.target.value) })
                    }
                    className="border-white/20 bg-black text-white"
                  />
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      <div className="mt-8">
        <SaveBar
          saving={saving}
          savedAt={savedAt}
          error={validationError || (error === "Unauthorized" ? "" : error)}
          onSave={handleSave}
        />
      </div>
    </AdminShell>
  );
}

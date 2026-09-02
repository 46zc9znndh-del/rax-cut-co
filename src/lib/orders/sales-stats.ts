import type { Coupon } from "@/lib/cms/types";
import type { CmsProduct } from "@/lib/cms/types";
import type { CouponSalesStat, Order, ProductSalesStat, SalesStats } from "./types";

function isCountableOrder(order: Order) {
  return order.status !== "cancelled";
}

export function buildProductSalesStats(orders: Order[], products: CmsProduct[]): ProductSalesStat[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const stats = new Map<string, ProductSalesStat>();

  for (const order of orders) {
    if (!isCountableOrder(order)) continue;

    for (const item of order.items) {
      const product = productMap.get(item.productId);
      const current = stats.get(item.productId) ?? {
        productId: item.productId,
        name: product?.name ?? item.name,
        wood: product?.wood ?? item.wood,
        unitsSold: 0,
        revenue: 0,
        stripeSynced: Boolean(product?.stripePriceId),
      };

      current.unitsSold += item.quantity;
      current.revenue += item.lineTotal;
      stats.set(item.productId, current);
    }
  }

  return [...stats.values()].sort((a, b) => b.revenue - a.revenue);
}

export function buildCouponSalesStats(orders: Order[], coupons: Coupon[]): CouponSalesStat[] {
  const couponMap = new Map(
    coupons.map((coupon) => [coupon.code.trim().toUpperCase(), coupon])
  );
  const stats = new Map<string, CouponSalesStat>();

  for (const coupon of coupons) {
    const code = coupon.code.trim().toUpperCase();
    stats.set(code, {
      code,
      label: coupon.label,
      orderCount: 0,
      revenue: 0,
      discountTotal: 0,
      stripeSynced: Boolean(coupon.stripePromotionCodeId),
    });
  }

  for (const order of orders) {
    if (!isCountableOrder(order) || !order.couponCode) continue;

    const code = order.couponCode.trim().toUpperCase();
    const coupon = couponMap.get(code);
    const current = stats.get(code) ?? {
      code,
      label: coupon?.label ?? code,
      orderCount: 0,
      revenue: 0,
      discountTotal: 0,
      stripeSynced: Boolean(coupon?.stripePromotionCodeId),
    };

    current.orderCount += 1;
    current.revenue += order.total;
    current.discountTotal += order.discount ?? 0;
    stats.set(code, current);
  }

  return [...stats.values()].sort((a, b) => b.revenue - a.revenue);
}

export function buildSalesStats(
  orders: Order[],
  products: CmsProduct[],
  coupons: Coupon[]
): SalesStats {
  const activeOrders = orders.filter(isCountableOrder);
  const couponSales = buildCouponSalesStats(orders, coupons);
  const productSales = buildProductSalesStats(orders, products);

  return {
    couponSales,
    productSales,
    ordersWithCoupons: activeOrders.filter((order) => order.couponCode).length,
    totalDiscountGiven: activeOrders.reduce((sum, order) => sum + (order.discount ?? 0), 0),
    totalRevenue: activeOrders.reduce((sum, order) => sum + order.total, 0),
  };
}

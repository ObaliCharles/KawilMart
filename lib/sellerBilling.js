import {
    COMMISSION_STATUSES,
    DEFAULT_COMMISSION_RATE,
    ORDER_STATUSES,
    calculateCommission,
    getCurrentBillingPeriod,
    getInvoiceNumber,
    normalizeOrderStatus,
} from "@/lib/orderLifecycle";

export const DEFAULT_SELLER_SUBSCRIPTION = {
    plan: "standard",
    status: "active",
    monthlyFee: 0,
};

export const getSellerSubscriptionSnapshot = (seller = {}) => ({
    plan: seller?.sellerSubscriptionPlan || DEFAULT_SELLER_SUBSCRIPTION.plan,
    status: seller?.sellerSubscriptionStatus || DEFAULT_SELLER_SUBSCRIPTION.status,
    monthlyFee: Math.max(0, Number(seller?.sellerSubscriptionFee) || DEFAULT_SELLER_SUBSCRIPTION.monthlyFee),
});

export const getCompletedSellerOrders = (orders = []) => (
    orders.filter((order) => normalizeOrderStatus(order?.status) === ORDER_STATUSES.COMPLETED)
);

export const buildSellerInvoiceSnapshot = ({
    seller = {},
    orders = [],
    now = new Date(),
    commissionRate = DEFAULT_COMMISSION_RATE,
} = {}) => {
    const period = getCurrentBillingPeriod(now);
    const subscription = getSellerSubscriptionSnapshot(seller);
    const periodCompletedOrders = getCompletedSellerOrders(orders).filter((order) => {
        const completionDate = order?.customerConfirmedAt || order?.date;
        const timestamp = new Date(completionDate).getTime();
        return Number.isFinite(timestamp) && timestamp >= period.start.getTime() && timestamp <= period.end.getTime();
    });

    const completedSubtotal = periodCompletedOrders.reduce((sum, order) => sum + (Number(order?.subtotal) || 0), 0);
    const commissionTotal = periodCompletedOrders.reduce((sum, order) => {
        const storedCommission = Number(order?.commissionAmount);
        return sum + (Number.isFinite(storedCommission) ? storedCommission : calculateCommission(order?.subtotal, commissionRate));
    }, 0);

    const orderCount = periodCompletedOrders.length;
    const totalDue = subscription.monthlyFee + commissionTotal;

    return {
        invoiceNumber: getInvoiceNumber({ sellerId: seller?._id || seller?.id || "", periodKey: period.key }),
        periodKey: period.key,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        subscriptionPlan: subscription.plan,
        subscriptionStatus: subscription.status,
        subscriptionFee: subscription.monthlyFee,
        commissionRate,
        completedOrders: orderCount,
        completedSubtotal,
        commissionTotal,
        totalDue,
        commissionStatus: orderCount > 0 ? COMMISSION_STATUSES.EARNED : COMMISSION_STATUSES.PENDING,
    };
};

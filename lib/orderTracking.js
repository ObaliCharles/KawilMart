export const ORDER_STATUS_SEQUENCE = [
    'Order Placed',
    'Confirmed',
    'Preparing',
    'Processing',
    'Ready for Delivery',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
];

export const CUSTOMER_TRACKING_STEPS = [
    { label: 'Order placed', statuses: ['Order Placed', 'Confirmed'] },
    { label: 'Preparing', statuses: ['Preparing', 'Processing'] },
    { label: 'Ready to dispatch', statuses: ['Ready for Delivery', 'Shipped'] },
    { label: 'On the way', statuses: ['Out for Delivery'] },
    { label: 'Delivered', statuses: ['Delivered'] },
];

const STATUS_EVENT_COPY = {
    'Order Placed': {
        title: 'Order placed',
        description: 'Your order has been received and is waiting for seller confirmation.',
    },
    'Confirmed': {
        title: 'Order confirmed',
        description: 'The seller has confirmed your order and will start preparing it.',
    },
    'Preparing': {
        title: 'Order being prepared',
        description: 'The seller is getting your items ready for dispatch.',
    },
    'Processing': {
        title: 'Order processing',
        description: 'Your order is in active processing before pickup.',
    },
    'Ready for Delivery': {
        title: 'Ready for pickup',
        description: 'Your package is packed and ready to be handed to a rider.',
    },
    'Shipped': {
        title: 'Shipped',
        description: 'Your order has left the seller and is queued for delivery.',
    },
    'Out for Delivery': {
        title: 'Out for delivery',
        description: 'A rider is currently bringing your order to your delivery address.',
    },
    'Delivered': {
        title: 'Delivered',
        description: 'Your order has been delivered successfully.',
    },
    'Cancelled': {
        title: 'Order cancelled',
        description: 'This order was cancelled before completion.',
    },
};

const PAYMENT_EVENT_COPY = {
    Pending: {
        title: 'Payment pending',
        description: 'Payment is still pending confirmation for this order.',
    },
    Paid: {
        title: 'Payment confirmed',
        description: 'The seller has confirmed payment for this order.',
    },
    Failed: {
        title: 'Payment issue',
        description: 'The seller marked this order as having a payment issue.',
    },
};

const SELLER_STATUS_NOTIFICATION_COPY = {
    'Order Placed': {
        title: 'New order received',
        description: 'A customer placed a new order in your store.',
    },
    'Confirmed': {
        title: 'Order confirmed',
        description: 'An order in your store has been confirmed.',
    },
    'Preparing': {
        title: 'Order being prepared',
        description: 'This order is currently being prepared for dispatch.',
    },
    'Processing': {
        title: 'Order processing',
        description: 'This order is actively being processed in your store.',
    },
    'Ready for Delivery': {
        title: 'Ready for pickup',
        description: 'This order is ready for rider pickup.',
    },
    'Shipped': {
        title: 'Order shipped',
        description: 'This order has left the seller stage and moved into delivery.',
    },
    'Out for Delivery': {
        title: 'Out for delivery',
        description: 'A rider is currently delivering this order to the customer.',
    },
    'Delivered': {
        title: 'Order delivered',
        description: 'This order has been delivered successfully.',
    },
    'Cancelled': {
        title: 'Order cancelled',
        description: 'This order was cancelled before completion.',
    },
};

const toISOString = (value, fallback = null) => {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return date.toISOString();
};

export const getStatusTrackingCopy = (status) => {
    return STATUS_EVENT_COPY[status] || {
        title: status || 'Order updated',
        description: 'Your order status has been updated.',
    };
};

export const getPaymentTrackingCopy = (paymentStatus) => {
    return PAYMENT_EVENT_COPY[paymentStatus] || {
        title: 'Payment updated',
        description: 'The payment status for your order has been updated.',
    };
};

export const getSellerStatusNotificationCopy = (status) => {
    return SELLER_STATUS_NOTIFICATION_COPY[status] || {
        title: status || 'Order updated',
        description: 'An order in your store has been updated.',
    };
};

export const getCustomerTrackingStepIndex = (status) => {
    if (status === 'Cancelled') {
        return 0;
    }

    const foundIndex = CUSTOMER_TRACKING_STEPS.findIndex((step) => step.statuses.includes(status));
    return foundIndex === -1 ? 0 : foundIndex;
};

export const createTrackingEvent = ({
    type = 'status',
    status = '',
    title = '',
    description = '',
    timestamp = new Date(),
}) => ({
    type,
    status,
    title,
    description,
    timestamp,
});

export const createStatusTrackingEvent = (status, timestamp = new Date()) => {
    const copy = getStatusTrackingCopy(status);

    return createTrackingEvent({
        type: 'status',
        status,
        title: copy.title,
        description: copy.description,
        timestamp,
    });
};

export const createRiderAssignmentTrackingEvent = ({ assigned = true, timestamp = new Date() } = {}) => (
    createTrackingEvent({
        type: 'assignment',
        status: assigned ? 'Ready for Delivery' : '',
        title: assigned ? 'Rider assigned' : 'Rider unassigned',
        description: assigned
            ? 'A delivery rider has been assigned and will update this order during delivery.'
            : 'The rider assignment was removed while logistics are being updated.',
        timestamp,
    })
);

export const createPaymentTrackingEvent = (paymentStatus, timestamp = new Date()) => {
    const copy = getPaymentTrackingCopy(paymentStatus);

    return createTrackingEvent({
        type: 'system',
        status: paymentStatus,
        title: copy.title,
        description: copy.description,
        timestamp,
    });
};

export const createCustomerNotification = ({ title, message }) => ({
    type: 'order',
    title,
    message,
    read: false,
    date: new Date(),
});

export const createStatusNotification = (status, orderId) => {
    const copy = getStatusTrackingCopy(status);
    const shortOrderId = String(orderId).slice(-8).toUpperCase();

    return createCustomerNotification({
        title: copy.title,
        message: `Order #${shortOrderId}: ${copy.description}`,
    });
};

export const createAssignmentNotification = (orderId, assigned = true) => {
    const shortOrderId = String(orderId).slice(-8).toUpperCase();

    return createCustomerNotification({
        title: assigned ? 'Rider assigned' : 'Delivery assignment updated',
        message: assigned
            ? `Order #${shortOrderId}: a rider has been assigned to your delivery.`
            : `Order #${shortOrderId}: the delivery assignment has been updated.`,
    });
};

export const createPaymentNotification = (paymentStatus, orderId) => {
    const copy = getPaymentTrackingCopy(paymentStatus);
    const shortOrderId = String(orderId).slice(-8).toUpperCase();

    return createCustomerNotification({
        title: copy.title,
        message: `Order #${shortOrderId}: ${copy.description}`,
    });
};

export const createSellerOrderPlacedNotification = ({
    orderId,
    customerName = 'A customer',
    totalItems = 0,
    totalAmount = '',
}) => {
    const shortOrderId = String(orderId).slice(-8).toUpperCase();
    const normalizedItemCount = Number(totalItems) || 0;
    const itemLabel = normalizedItemCount === 1 ? 'item' : 'items';
    const amountCopy = totalAmount ? ` totaling ${totalAmount}` : '';

    return {
        type: 'order',
        title: 'New order received',
        message: `${customerName} placed order #${shortOrderId} for ${normalizedItemCount} ${itemLabel}${amountCopy}.`,
        read: false,
        date: new Date(),
    };
};

export const createSellerStatusNotification = (status, orderId) => {
    const copy = getSellerStatusNotificationCopy(status);
    const shortOrderId = String(orderId).slice(-8).toUpperCase();

    return {
        type: 'order',
        title: copy.title,
        message: `Order #${shortOrderId}: ${copy.description}`,
        read: false,
        date: new Date(),
    };
};

export const ensureTrackingEvents = (order) => {
    const existingEvents = Array.isArray(order?.trackingEvents) ? order.trackingEvents : [];
    if (existingEvents.length > 0) {
        return existingEvents;
    }

    const fallbackEvents = [
        createStatusTrackingEvent('Order Placed', order?.date || new Date()),
    ];

    if (order?.riderId) {
        fallbackEvents.push(createRiderAssignmentTrackingEvent({
            assigned: true,
            timestamp: order?.date || new Date(),
        }));
    }

    if (order?.paymentStatus && order.paymentStatus !== 'Pending') {
        fallbackEvents.push(createPaymentTrackingEvent(order.paymentStatus, order?.date || new Date()));
    }

    if (order?.status && order.status !== 'Order Placed') {
        fallbackEvents.push(createStatusTrackingEvent(order.status, order?.date || new Date()));
    }

    return fallbackEvents;
};

export const serializeTrackingEvents = (trackingEvents) => (
    (Array.isArray(trackingEvents) ? trackingEvents : []).map((event, index) => ({
        id: String(event?._id || `${event?.type || 'event'}-${index}`),
        type: event?.type || 'status',
        status: event?.status || '',
        title: event?.title || 'Order updated',
        description: event?.description || '',
        timestamp: toISOString(event?.timestamp, toISOString(new Date())),
    }))
);

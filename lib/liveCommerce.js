const DAY_IN_MS = 24 * 60 * 60 * 1000;
const FALLBACK_LOCATIONS = ["Kampala", "Gulu", "Mbarara", "Jinja", "Entebbe", "Arua"];

const getHash = (value = "") => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
};

const getRangeNumber = (key, min, max) => {
  const safeMin = Number(min);
  const safeMax = Number(max);

  if (!Number.isFinite(safeMin) || !Number.isFinite(safeMax) || safeMax < safeMin) {
    return safeMin || 0;
  }

  return safeMin + (getHash(key) % (safeMax - safeMin + 1));
};

const getDailySeed = () => new Date().toISOString().slice(0, 10);

const getProductKey = (product) => String(product?._id || product?.name || "product");

const getProductTimestamp = (product) => {
  const numericDate = Number(product?.date);
  return Number.isFinite(numericDate) ? numericDate : 0;
};

export const getLocationLabel = (location) => {
  if (typeof location === "string" && location.trim()) {
    const [primaryLabel] = location
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (primaryLabel) {
      return primaryLabel;
    }
  }

  return FALLBACK_LOCATIONS[getRangeNumber(String(location || "fallback"), 0, FALLBACK_LOCATIONS.length - 1)];
};

export const getProductActivitySnapshot = (product) => {
  const dailySeed = getDailySeed();
  const productKey = getProductKey(product);
  const baseKey = `${productKey}-${dailySeed}`;
  const ageDays = getProductTimestamp(product)
    ? Math.max(0, Math.floor((Date.now() - getProductTimestamp(product)) / DAY_IN_MS))
    : 999;
  const localTrend = getLocationLabel(product?.sellerLocation || product?.location);
  const viewersNow = getRangeNumber(`${baseKey}-viewers`, 2, 19);
  const soldToday = getRangeNumber(`${baseKey}-sold`, 0, 14);
  const cartsLastHour = getRangeNumber(`${baseKey}-carts`, 1, 8);
  const lowStockLeft = getRangeNumber(`${baseKey}-stock`, 2, 6);
  const isNewArrival = ageDays <= 10;
  const isLowStock = soldToday >= 10 || getRangeNumber(`${baseKey}-stock-flag`, 0, 9) >= 8;

  return {
    viewersNow,
    soldToday,
    cartsLastHour,
    lowStockLeft,
    isLowStock,
    isNewArrival,
    localTrend,
  };
};

export const getLiveActivityItems = (product) => {
  const activity = getProductActivitySnapshot(product);

  return [
    {
      key: "viewers",
      label: `${activity.viewersNow} viewing now`,
      tone: "neutral",
    },
    activity.soldToday > 0
      ? {
          key: "sold",
          label: `${activity.soldToday} sold today`,
          tone: "warm",
        }
      : null,
    activity.isNewArrival
      ? {
          key: "new",
          label: "Just arrived",
          tone: "fresh",
        }
      : null,
    activity.isLowStock
      ? {
          key: "stock",
          label: `Only ${activity.lowStockLeft} left`,
          tone: "alert",
        }
      : null,
    {
      key: "trend",
      label: `Trending in ${activity.localTrend}`,
      tone: "neutral",
    },
  ].filter(Boolean);
};

export const sortProductsForLiveShowcase = (products = []) => {
  return [...products].sort((leftProduct, rightProduct) => {
    const leftActivity = getProductActivitySnapshot(leftProduct);
    const rightActivity = getProductActivitySnapshot(rightProduct);
    const leftTimestamp = getProductTimestamp(leftProduct);
    const rightTimestamp = getProductTimestamp(rightProduct);

    const getScore = (product, activity, timestamp) => {
      const promotionBoost = product?.isFlashDeal || product?.promotionType === "flash_deal"
        ? 42
        : product?.promotionType === "featured"
          ? 28
          : product?.promotionType === "discount"
            ? 18
            : 0;
      const freshnessBoost = timestamp
        ? Math.max(0, 12 - Math.floor((Date.now() - timestamp) / DAY_IN_MS))
        : 0;
      const ratingBoost = Math.round(Number(product?.averageRating || 0) * 4);
      const likesBoost = Math.min(10, Math.round(Number(product?.likesCount || 0) / 2));
      const rotationBoost = getRangeNumber(`${getProductKey(product)}-${getDailySeed()}-rotate`, 0, 10);

      return (
        promotionBoost +
        freshnessBoost +
        ratingBoost +
        likesBoost +
        rotationBoost +
        activity.viewersNow +
        activity.soldToday * 2
      );
    };

    const scoreDifference = getScore(rightProduct, rightActivity, rightTimestamp) - getScore(leftProduct, leftActivity, leftTimestamp);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return rightTimestamp - leftTimestamp;
  });
};

export const getMarketplacePulseItems = (products = []) => {
  return products.slice(0, 6).flatMap((product) => {
    const activity = getProductActivitySnapshot(product);
    const productHref = `/product/${product._id}`;

    return [
      {
        key: `${product._id}-viewers`,
        href: productHref,
        message: `${activity.viewersNow} people are viewing ${product.name} right now`,
      },
      {
        key: `${product._id}-sold`,
        href: productHref,
        message: `${activity.soldToday} sold today from ${activity.localTrend}`,
      },
      activity.isNewArrival
        ? {
            key: `${product._id}-new`,
            href: productHref,
            message: `${product.name} just arrived in ${activity.localTrend}`,
          }
        : {
            key: `${product._id}-trend`,
            href: productHref,
            message: `${product.name} is trending in ${activity.localTrend}`,
          },
    ];
  });
};

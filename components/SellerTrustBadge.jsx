'use client'

import React from "react";

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
  slate: "bg-slate-100 text-slate-700",
};

const SellerTrustBadge = ({ sellerProfile, className = "", variant = "label" }) => {
  const label = sellerProfile?.badgeLabel || (sellerProfile?.isVerified ? "Verified Seller" : "");

  if (!label) {
    return null;
  }

  const tone = sellerProfile?.badgeTone || (sellerProfile?.isVerified ? "emerald" : "slate");

  if (variant === "icon") {
    const verificationLabel = sellerProfile?.isVerified ? "Verified seller" : label;

    if (!sellerProfile?.isVerified && !/verified/i.test(label || "")) {
      return null;
    }

    return (
      <span
        role="img"
        aria-label={verificationLabel}
        title={verificationLabel}
        className={`inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white shadow-sm ${className}`}
      >
        ✓
      </span>
    );
  }

  return (
    <span className={`inline-flex max-w-full min-w-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[tone] || toneClasses.emerald} ${className}`}>
      <span className="shrink-0">✓</span>
      <span className="min-w-0 truncate">
        {label}
      </span>
    </span>
  );
};

export default SellerTrustBadge;

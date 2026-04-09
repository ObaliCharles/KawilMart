import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "KawilMart | Legal Center",
  description:
    "Read KawilMart's marketplace terms, privacy practices, seller rules, buyer expectations, rider obligations, and support process.",
};

const pageBackdropStyle = {
  backgroundImage: `
    linear-gradient(to right, rgba(148, 163, 184, 0.10) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.10) 1px, transparent 1px),
    radial-gradient(circle at top left, rgba(251, 146, 60, 0.14), transparent 28%),
    radial-gradient(circle at bottom right, rgba(251, 191, 36, 0.12), transparent 24%)
  `,
  backgroundSize: "26px 26px, 26px 26px, 100% 100%, 100% 100%",
  backgroundColor: "#f7f3ec",
};

const quickLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#terms", label: "Terms & conditions" },
  { href: "#privacy", label: "Privacy policy" },
  { href: "#seller-terms", label: "Seller rules" },
  { href: "#buyer-terms", label: "Buyer rules" },
  { href: "#rider-terms", label: "Rider rules" },
  { href: "#disputes", label: "Disputes & support" },
  { href: "#contact", label: "Contact" },
];

const promiseCards = [
  {
    title: "Built for this marketplace",
    description:
      "These policies reflect the KawilMart app as it works today: buyers, sellers, riders, admins, COD orders, pickup or delivery, and in-app support.",
    tone: "from-orange-500/15 to-amber-400/10",
  },
  {
    title: "Clear on operational rules",
    description:
      "Cart items may be split into separate seller orders, delivery fees are calculated per seller, and contacts unlock only when order progress makes that appropriate.",
    tone: "from-slate-900/10 to-slate-700/5",
  },
  {
    title: "Grounded in trust",
    description:
      "We focus on responsible listings, truthful reviews, secure account access, respectful communication, and support-led resolution when something goes wrong.",
    tone: "from-amber-500/15 to-orange-300/10",
  },
];

const operationsHighlights = [
  {
    label: "Current payment flow",
    value: "Cash on delivery",
  },
  {
    label: "Fulfillment options",
    value: "Delivery or pickup",
  },
  {
    label: "Marketplace roles",
    value: "Buyer, seller, rider, admin",
  },
  {
    label: "Last updated",
    value: "April 9, 2026",
  },
];

const definitionRows = [
  ["Platform", "The KawilMart website, dashboards, APIs, and related mobile-friendly experiences."],
  ["Buyer", "A customer account that browses, orders, tracks deliveries, confirms receipt, and may review sellers."],
  ["Seller", "A marketplace account that lists products, manages stock, accepts orders, and fulfills them through pickup or delivery."],
  ["Rider", "A delivery partner who can receive assignments, accept or decline them, and update delivery progress inside the rider dashboard."],
  ["Order", "A seller-specific order record created after checkout. One cart can produce more than one order if products belong to different sellers."],
  ["Support", "KawilMart's in-app support conversation flow and any related email or phone assistance."],
];

const privacyRows = [
  {
    category: "Account and identity",
    details: "Name, email address, profile image, role metadata, and account status information used for access and moderation.",
  },
  {
    category: "Order and address data",
    details: "Saved addresses, phone numbers, cart contents, order history, delivery mode, payment status, and tracking updates.",
  },
  {
    category: "Seller and rider operations",
    details: "Business name, business location, support email, tax or license fields, verification notes, vehicle details, and payout-related billing records when provided.",
  },
  {
    category: "Communication records",
    details: "Support messages, notifications, order notes, and operational messages needed to resolve issues and keep users informed.",
  },
  {
    category: "Technical and session data",
    details: "Session, device, browser, and security information needed to keep the app running, protect accounts, and diagnose problems.",
  },
];

const privacyUses = [
  "Create and secure accounts for buyers, sellers, riders, and admins.",
  "Process seller-specific orders, calculate delivery fees, and coordinate fulfillment.",
  "Show order tracking, unlock the right contacts at the right time, and power notifications.",
  "Review marketplace safety, fraud signals, stock conflicts, delivery disputes, and support requests.",
  "Administer seller or rider billing records, subscription access, and verification workflows when applicable.",
];

const termsRules = [
  "You must provide accurate account, address, and contact details and keep them up to date.",
  "You are responsible for activity under your account and for keeping your login credentials secure.",
  "You may not use KawilMart to commit fraud, abuse support, bypass suspensions, scrape data, or interfere with the platform.",
  "You may not list or attempt to trade illegal, counterfeit, unsafe, or prohibited goods.",
  "Any review, rating, support message, or seller content you post must be honest, lawful, and not misleading.",
];

const sellerRules = [
  "Only publish products you are permitted to sell and that you can fulfill at the listed price and condition.",
  "Keep stock, pricing, photos, and descriptions accurate so customers are not misled.",
  "Respond to order activity promptly and prepare accepted orders for pickup or rider handoff without unnecessary delay.",
  "Maintain any required business, tax, support, or verification information requested by KawilMart admins.",
  "Seller access may be limited or paused when subscription, compliance, fraud, or safety requirements are not met.",
];

const buyerRules = [
  "Check product details carefully before placing an order and provide a reachable delivery phone number and address.",
  "Be available to receive delivery or collect a pickup order after the seller accepts it.",
  "Cash on delivery orders should only be placed when you are ready and able to complete payment at handoff.",
  "Use order confirmation, reviews, and support tools honestly and only for genuine order issues.",
  "Requests for cancellation, returns, refunds, or replacements are reviewed based on order status, evidence, seller response, and applicable law.",
];

const riderRules = [
  "Maintain valid identification, licensing, and vehicle documentation where required for your delivery work.",
  "Accept or decline assignments responsibly and keep your availability status accurate in the rider dashboard.",
  "Do not mark an order as delivered until it has actually been handed over or completed through the approved flow.",
  "Use customer and seller contact information only for the active delivery and not for unrelated purposes.",
  "Unsafe conduct, false delivery updates, harassment, or misuse of marketplace data can lead to suspension or permanent removal.",
];

const disputeSteps = [
  {
    title: "Start with the order trail",
    description:
      "Use your order page, tracking history, and support messages to explain the issue clearly and attach any useful evidence such as screenshots or photos.",
  },
  {
    title: "Support and admin review",
    description:
      "KawilMart may review delivery status, seller actions, rider actions, messages, and account records to understand what happened and what remedy is appropriate.",
  },
  {
    title: "Platform action",
    description:
      "Depending on the findings, we may issue guidance, limit an account, reverse a marketplace action where possible, or keep records for legal or security reasons.",
  },
];

const contactCards = [
  {
    title: "Email",
    value: "kawilmart@gmail.com",
    href: "mailto:kawilmart@gmail.com",
    description: "General support and policy questions.",
  },
  {
    title: "Phone",
    value: "+256 767 934 191",
    href: "tel:+256767934191",
    description: "Direct contact for urgent marketplace help.",
  },
  {
    title: "In-app support",
    value: "Inbox > Support",
    href: "/inbox?tab=support",
    description: "Best place for account, order, seller, or rider issues.",
  },
];

const sectionShellClass =
  "overflow-hidden border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-8";

const tableShellClass =
  "overflow-hidden border border-slate-200 bg-white shadow-sm";

const SectionHeader = ({ eyebrow, title, intro }) => (
  <div className="space-y-3">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-600">{eyebrow}</p>
    <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h2>
    {intro ? <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{intro}</p> : null}
  </div>
);

const ListBlock = ({ items }) => (
  <ul className="grid gap-3">
    {items.map((item) => (
      <li
        key={item}
        className="flex gap-3 border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-600"
      >
        <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 bg-orange-500" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const DefinitionTable = ({ rows, headingOne = "Term", headingTwo = "Meaning" }) => (
  <div className={tableShellClass}>
    <div className="grid grid-cols-[1fr_2fr] border-b border-slate-200 bg-slate-50/90 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:px-6">
      <span>{headingOne}</span>
      <span>{headingTwo}</span>
    </div>
    <div className="divide-y divide-slate-200">
      {rows.map(([term, meaning]) => (
        <div key={term} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_2fr] md:px-6">
          <p className="text-sm font-semibold text-slate-900">{term}</p>
          <p className="text-sm leading-7 text-slate-600">{meaning}</p>
        </div>
      ))}
    </div>
  </div>
);

const StepCards = ({ steps }) => (
  <div className="grid gap-4 lg:grid-cols-3">
    {steps.map((step, index) => (
      <article
        key={step.title}
        className="border border-slate-200 bg-slate-50/80 p-5 shadow-sm"
      >
        <div className="inline-flex h-11 w-11 items-center justify-center bg-orange-500 text-sm font-semibold text-white">
          0{index + 1}
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
      </article>
    ))}
  </div>
);

const LegalPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-6 py-10 md:px-16 md:py-16 lg:px-32" style={pageBackdropStyle}>
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Legal center</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">On this page</h2>
              <div className="mt-5 space-y-2">
                {quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <span>{link.label}</span>
                    <span className="text-orange-500">+</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <main className="space-y-8">
            <section id="overview" className="relative overflow-hidden border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-8 lg:p-10">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-slate-900" />
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
                    KawilMart legal center
                  </p>
                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                      Terms, privacy, and marketplace rules shaped for how KawilMart actually works.
                    </h1>
                    <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                      This page explains the rules, expectations, and data practices behind KawilMart's buyer,
                      seller, rider, and admin experiences across shopping, delivery, support, and account operations.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {operationsHighlights.map((item) => (
                      <div
                        key={item.label}
                        className="border border-orange-100 bg-orange-50/70 p-4 shadow-sm"
                      >
                        <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-orange-700 p-6 text-white shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-200">
                      What this page covers
                    </p>
                    <ul className="mt-5 space-y-4">
                      <li className="flex gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center bg-white/15 text-xs">
                          1
                        </span>
                        <span className="text-sm leading-7 text-slate-100">
                          Marketplace-wide terms for accounts, content, orders, misuse, and platform access.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center bg-white/15 text-xs">
                          2
                        </span>
                        <span className="text-sm leading-7 text-slate-100">
                          Privacy commitments covering the data KawilMart needs to run commerce and support safely.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center bg-white/15 text-xs">
                          3
                        </span>
                        <span className="text-sm leading-7 text-slate-100">
                          Role-based rules for sellers, buyers, and riders plus a practical support and dispute path.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Version note
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      This page is aligned to the current app structure in the codebase, including seller-specific
                      order splitting, support inbox conversations, order confirmation, and rider assignment workflows.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              {promiseCards.map((card) => (
                <article
                  key={card.title}
                  className="overflow-hidden border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm"
                >
                  <div className={`bg-gradient-to-r ${card.tone} px-6 py-5`}>
                    <h2 className="text-2xl font-semibold text-slate-900">{card.title}</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm leading-7 text-slate-600">{card.description}</p>
                  </div>
                </article>
              ))}
            </section>

            <section id="terms" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 1"
                title="Terms & Conditions"
                intro="By accessing or using KawilMart, you agree to these marketplace rules as a buyer, seller, rider, admin, or visitor. If you do not agree, please do not use the platform."
              />

              <div className="mt-8 grid gap-8">
                <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">General platform rules</h3>
                    <ListBlock items={termsRules} />
                  </div>

                  <div className="border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">
                      Important marketplace logic
                    </p>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        KawilMart operates as a marketplace layer between customers, sellers, riders, and admins.
                        Sellers remain responsible for their listings, stock, pricing, and fulfillment obligations.
                      </p>
                      <p>
                        A single checkout can become multiple seller-specific orders. Delivery fees and operational
                        updates may therefore apply separately across different sellers in the same cart.
                      </p>
                      <p>
                        Contact details are not shown at every stage. Seller contact unlocks after seller acceptance,
                        and rider contact unlocks after rider acceptance for delivery orders.
                      </p>
                    </div>
                  </div>
                </div>

                <DefinitionTable rows={definitionRows} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Orders, pricing, and fulfillment</h3>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        KawilMart currently supports cash on delivery as the active checkout flow. Estimated delivery
                        fees are calculated from seller location and the customer's selected address, while pickup
                        orders carry no delivery fee.
                      </p>
                      <p>
                        Sellers may accept, process, and prepare orders before pickup or rider handoff. Customers may
                        be asked to confirm delivery inside the app after receiving an order.
                      </p>
                      <p>
                        Product availability can change while a customer is checking out. KawilMart may block or
                        reject an order if stock is no longer available, a seller's access is paused, or fraud or
                        safety checks require intervention.
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Account action and enforcement</h3>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        KawilMart may suspend, restrict, or permanently remove accounts that present fraud risk,
                        abuse other users, misuse support channels, publish harmful listings, or repeatedly ignore
                        platform requirements.
                      </p>
                      <p>
                        We may also preserve records related to orders, support conversations, or moderation actions
                        when reasonably necessary for compliance, fraud review, audits, or legal obligations.
                      </p>
                      <p>
                        We can update these terms as the product evolves. Material updates may be shown through the
                        app, email, support communication, or future page revisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="privacy" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 2"
                title="Privacy Policy"
                intro="KawilMart collects and uses information needed to authenticate users, manage orders, support delivery, operate the marketplace, and keep the platform secure."
              />

              <div className="mt-8 grid gap-8">
                <div className={tableShellClass}>
                  <div className="grid grid-cols-[1fr_2fr] border-b border-slate-200 bg-slate-50/90 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:px-6">
                    <span>Category</span>
                    <span>How it appears in KawilMart</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {privacyRows.map((row) => (
                      <div key={row.category} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_2fr] md:px-6">
                        <p className="text-sm font-semibold text-slate-900">{row.category}</p>
                        <p className="text-sm leading-7 text-slate-600">{row.details}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900">Why we use data</h3>
                    <ListBlock items={privacyUses} />
                  </div>

                  <div className="border border-emerald-100 bg-emerald-50/80 p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                      Data sharing principle
                    </p>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
                      <p>
                        KawilMart does not sell personal data. We share limited information only where operationally
                        necessary, for example with the relevant seller, rider, admin reviewer, authentication tools,
                        email or SMS services, or legal authorities when required.
                      </p>
                      <p>
                        Order-related details are disclosed on a need-to-know basis so sellers can fulfill orders,
                        riders can complete deliveries, and support teams can resolve disputes and account issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <article className="border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Retention</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      We keep data for as long as it is reasonably needed to run KawilMart, support users, protect the
                      marketplace, and meet accounting, security, or legal obligations.
                    </p>
                  </article>
                  <article className="border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      We use authentication controls, restricted access patterns, operational monitoring, and
                      platform-level security measures to reduce unauthorized access and account misuse.
                    </p>
                  </article>
                  <article className="border border-slate-200 bg-slate-50/80 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Your choices</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      You can request access, correction, or deletion support by contacting KawilMart through the
                      support inbox or public support channels listed below.
                    </p>
                  </article>
                </div>

                <div className="border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Cookies and session tools</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    KawilMart may use session, security, login, and preference-related cookies or similar technologies
                    that help authentication, cart continuity, performance, and safe platform use. Disabling some of
                    these tools may reduce site functionality.
                  </p>
                </div>
              </div>
            </section>

            <section id="seller-terms" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 3"
                title="Seller Terms"
                intro="Seller accounts use KawilMart to publish products, manage inventory, accept orders, coordinate fulfillment, and communicate through approved platform channels."
              />

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Seller responsibilities</h3>
                  <ListBlock items={sellerRules} />
                </div>

                <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Seller billing and access</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                    <p>
                      KawilMart tracks seller commission and also supports seller billing records, invoice downloads,
                      and subscription-style access controls for marketplace participation.
                    </p>
                    <p>
                      If a seller's access is paused, overdue, cancelled, or flagged, KawilMart may block product
                      publishing, editing, or order activity until the account is restored.
                    </p>
                    <p>
                      Sellers remain responsible for any taxes, licenses, business registrations, and category-specific
                      compliance duties that apply to their goods or business operations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="buyer-terms" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 4"
                title="Buyer Terms"
                intro="Buyer accounts use KawilMart to discover products, build a cart, place orders, track progress, confirm completed deliveries, and communicate with support when needed."
              />

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Buyer responsibilities</h3>
                  <ListBlock items={buyerRules} />
                </div>

                <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">What buyers should expect</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                    <p>
                      KawilMart tracks order status from placement through acceptance, processing, ready state, delivery,
                      and final confirmation. Delivery estimates depend on seller readiness, rider availability, stock,
                      and destination.
                    </p>
                    <p>
                      Pickup orders require collection directly from the seller after order acceptance. Delivery orders
                      may be assigned to riders, and rider contact details appear only after assignment acceptance.
                    </p>
                    <p>
                      Customers may submit seller reviews after qualifying orders are completed. Reviews must reflect
                      genuine order experience and may be moderated if abusive, false, or unlawful.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="rider-terms" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 5"
                title="Rider Terms"
                intro="Rider accounts help complete delivery orders accepted inside KawilMart. Riders are expected to operate lawfully, safely, and in line with the delivery progress tools provided in the dashboard."
              />

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Rider responsibilities</h3>
                  <ListBlock items={riderRules} />
                </div>

                <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-900">Rider operations in the app</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                    <p>
                      Riders can toggle availability, accept or decline assignments, update active deliveries, and
                      download monthly statements for eligible completed work.
                    </p>
                    <p>
                      KawilMart may require rider verification, review delivery behavior, and restrict access where
                      repeated failed delivery conduct, unsafe practices, fraud, or compliance gaps are detected.
                    </p>
                    <p>
                      Unless KawilMart separately agrees otherwise in writing, rider participation on the platform does
                      not by itself create an employment relationship.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="disputes" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Section 6"
                title="Disputes, Support, and Enforcement"
                intro="When something goes wrong, KawilMart uses a support-first process grounded in order history, tracking events, account records, and reasonable evidence from the people involved."
              />

              <div className="mt-8 space-y-8">
                <StepCards steps={disputeSteps} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Useful evidence</h3>
                    <ListBlock
                      items={[
                        "Order ID, seller name, and the date or stage where the issue happened.",
                        "Photos, screenshots, or delivery notes that show the problem clearly.",
                        "Support messages or order updates exchanged through KawilMart.",
                        "A short explanation of what happened and the outcome you believe is fair.",
                      ]}
                    />
                  </div>

                  <div className="border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-900">Platform rights</h3>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                      <p>
                        KawilMart may remove listings, reverse visibility, pause accounts, restrict certain actions,
                        or retain internal notes where marketplace safety, compliance, fraud review, or customer
                        protection requires it.
                      </p>
                      <p>
                        Where a dispute cannot be resolved within the platform, KawilMart may refer the matter to the
                        appropriate legal, regulatory, or law enforcement channels when necessary.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="contact" className={sectionShellClass}>
              <SectionHeader
                eyebrow="Contact"
                title="Need help with these policies?"
                intro="The fastest route for order, account, seller, or rider issues is the KawilMart support inbox, but you can also reach the public support channels below."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {contactCards.map((card) => (
                  <a
                    key={card.title}
                    href={card.href}
                    className="group border border-slate-200 bg-slate-50/80 p-5 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">{card.title}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900 group-hover:text-orange-700">
                      {card.value}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  </a>
                ))}
              </div>

              <div className="mt-8 border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-6 shadow-sm">
                <p className="text-sm leading-7 text-slate-600">
                  If you contact support about an order, include the order number, the email or phone number attached
                  to the account, and a short description of the issue so the team can help faster.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LegalPage;

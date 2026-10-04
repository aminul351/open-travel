import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  Globe2,
  Handshake,
  Heart,
  Luggage,
  MapPin,
  MessageSquare,
  Plane,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LocationSearchBar } from "@/components/location-search-bar";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { apiFetch, type ApiCategory, type ApiServiceDetail } from "@/lib/api";

// Revalidate page at edge every 60 seconds (ISR) to deliver instantaneous load speeds worldwide
export const revalidate = 60;

const TRUST_METRICS = [
  {
    label: "Agency Rating",
    value: "4.9/5",
    sub: "12,000+ verified traveler reviews",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    label: "Verified Operators",
    value: "100%",
    sub: "Accredited & background-checked",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Direct Agency Chat",
    value: "Real-time",
    sub: "Talk directly with tour organizers",
    icon: MessageSquare,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    label: "Direct Operator Rates",
    value: "0% Markup",
    sub: "Zero middleman surcharges",
    icon: Wallet,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

const TRENDING_DESTINATIONS = [
  {
    name: "Paris",
    country: "France",
    title: "Paris & French Riviera",
    subtitle: "Eiffel Tower marvels, classical art & scenic Seine cruises",
    price: "From $299",
    count: "35+ Offers",
    tag: "Romantic & Cultural",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Nepal",
    country: "Nepal",
    title: "Kathmandu & Annapurna",
    subtitle: "Himalayan trekking, Everest Base Camp & heritage stupas",
    price: "From $450",
    count: "48+ Offers",
    tag: "Mountain Treks",
    imageUrl:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Thailand",
    country: "Thailand",
    title: "Phuket & Phi Phi Islands",
    subtitle: "Emerald lagoons, limestone cliffs & tropical beach escapes",
    price: "From $180",
    count: "60+ Offers",
    tag: "Tropical Islands",
    imageUrl:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Rome",
    country: "Italy",
    title: "Rome & Vatican City",
    subtitle: "Colosseum antiquity, Trevi Fountain & Mediterranean cuisine",
    price: "From $320",
    count: "28+ Offers",
    tag: "Historic Wonders",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Dubai",
    country: "UAE",
    title: "Dubai & Arabian Desert",
    subtitle: "Burj Khalifa skylines, luxury safaris & Arabian Gulf yachts",
    price: "From $390",
    count: "34+ Offers",
    tag: "Luxury & Desert",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Tokyo",
    country: "Japan",
    title: "Tokyo & Mount Fuji",
    subtitle: "Futuristic neon cities, cherry blossoms & ancient shrines",
    price: "From $480",
    count: "30+ Offers",
    tag: "Heritage & Modern",
    imageUrl:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Explore Curated Offers",
    description:
      "Browse through hundreds of tour packages, boutique hotels, and airport transfers published directly by accredited local operators.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Chat Directly with Agencies",
    description:
      "Have custom itinerary requests, dietary needs, or group questions? Connect in real-time with the operating agency before booking.",
    icon: MessageSquare,
  },
  {
    step: "03",
    title: "Book with Direct Pricing",
    description:
      "Secure your trip with zero hidden intermediary fees, guaranteed booking confirmations, and 24/7 operator support.",
    icon: CheckCircle2,
  },
];

const VALUE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Accredited Operators",
    description:
      "Every tour company and agency undergoes rigorous credential verification before publishing listings on Open Travel.",
  },
  {
    icon: MessageSquare,
    title: "Direct In-App Communication",
    description:
      "Skip disconnected call centers. Chat one-on-one with local tour directors, drivers, and guides managing your itinerary.",
  },
  {
    icon: Wallet,
    title: "Zero Middleman Markups",
    description:
      "You pay the local operator's direct rate. No inflated third-party commissions or hidden check-out booking fees.",
  },
  {
    icon: Award,
    title: "Protected Bookings & Support",
    description:
      "Enjoy transparent cancellation terms, guaranteed reservations, and round-the-clock support throughout your journey.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Trekking Annapurna Base Camp with a verified Nepalese agency was seamless. Being able to chat directly with our guide weeks before departing made packing and preparation effortless.",
    author: "Sarah Jenkins",
    role: "Adventure Traveler",
    destination: "Nepal Expedition",
    avatar: "SJ",
    rating: 5,
  },
  {
    quote:
      "We booked our family airport transfers and island-hopping catamaran in Phuket. The agency was punctual, professional, and saved us over 30% compared to typical hotel booking desks.",
    author: "David & Maria Chen",
    role: "Family Vacationers",
    destination: "Phuket Island Tour",
    avatar: "DC",
    rating: 5,
  },
  {
    quote:
      "Found an incredible private guide in Rome through Open Travel. The agency answered all my itinerary questions within minutes. Truly the modern way to book global travel.",
    author: "Elena Rostova",
    role: "Solo Explorer",
    destination: "Rome Cultural Tour",
    avatar: "ER",
    rating: 5,
  },
];

const CURATED_OFFERS: ApiServiceDetail[] = [
  {
    id: "offer-nepal-annapurna",
    agencyId: "agency-himalaya",
    slug: "annapurna-circuit-trek",
    title: "Annapurna Circuit & Thorong La Pass Expedition",
    description:
      "Breathtaking 12-day guided trek through high Himalayan passes, tea-house stays, and panoramic mountain vistas.",
    type: "PACKAGE",
    price: 850,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: true,
    ratingAvg: 4.9,
    ratingCount: 38,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Kathmandu & Pokhara, Nepal",
      destination: "Nepal",
      duration: "12 Days / 11 Nights",
    },
    agency: {
      id: "agency-himalaya",
      name: "Himalayan Apex Expeditions",
      slug: "himalayan-apex",
      verified: true,
    },
  },
  {
    id: "offer-phuket-island",
    agencyId: "agency-andaman",
    slug: "phuket-phi-phi-island-cruise",
    title: "Phuket, Maya Bay & Phi Phi Island Speedboat Discovery",
    description:
      "Full-day luxury catamaran cruise with snorkeling, crystal emerald lagoons, buffet lunch, and hotel transfers.",
    type: "PACKAGE",
    price: 180,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: true,
    ratingAvg: 4.8,
    ratingCount: 64,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Phuket & Krabi, Thailand",
      destination: "Thailand",
      duration: "1 Full Day",
    },
    agency: {
      id: "agency-andaman",
      name: "Andaman Blue Voyages",
      slug: "andaman-blue",
      verified: true,
    },
  },
  {
    id: "offer-rome-colosseum",
    agencyId: "agency-roma",
    slug: "classical-rome-colosseum-vatican",
    title: "Rome Colosseum Underground & Vatican VIP Tour",
    description:
      "Exclusive skip-the-line guided access to the Roman Colosseum arena floor, Roman Forum, and Sistine Chapel.",
    type: "PACKAGE",
    price: 295,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: true,
    ratingAvg: 4.9,
    ratingCount: 52,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Rome & Vatican City, Italy",
      destination: "Rome",
      duration: "2 Days",
    },
    agency: {
      id: "agency-roma",
      name: "Roma Antica Tours",
      slug: "roma-antica",
      verified: true,
    },
  },
  {
    id: "offer-dubai-desert",
    agencyId: "agency-gulf",
    slug: "dubai-red-dune-safari-bbq",
    title: "Dubai Red Dunes 4x4 Safari, Sandboarding & BBQ Stargazing",
    description:
      "Thrilling desert dune bashing, camel rides, traditional Arabian camp dinner, falconry, and VIP transfers.",
    type: "PACKAGE",
    price: 220,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: false,
    ratingAvg: 4.9,
    ratingCount: 41,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Dubai Desert Conservation Reserve, UAE",
      destination: "Dubai",
      duration: "1 Day (Afternoon - Night)",
    },
    agency: {
      id: "agency-gulf",
      name: "Gulf Horizons Tourism",
      slug: "gulf-horizons",
      verified: true,
    },
  },
  {
    id: "offer-paris-culture",
    agencyId: "agency-lumiere",
    slug: "paris-louvre-seine-eiffel-pass",
    title: "Paris Eiffel Tower Summit & Seine River Dinner Cruise",
    description:
      "Panoramic elevator access to the Eiffel Tower summit followed by an illuminated gourmet French 3-course dinner cruise.",
    type: "PACKAGE",
    price: 310,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: false,
    ratingAvg: 4.8,
    ratingCount: 29,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Paris, France",
      destination: "Paris",
      duration: "1 Evening",
    },
    agency: {
      id: "agency-lumiere",
      name: "Lumière Voyage Paris",
      slug: "lumiere-voyage",
      verified: true,
    },
  },
  {
    id: "offer-tokyo-fuji",
    agencyId: "agency-sakura",
    slug: "tokyo-mount-fuji-hakone-day-tour",
    title: "Mount Fuji 5th Station, Lake Ashi Cruise & Hakone Ropeway",
    description:
      "Scenic bullet train day trip from Tokyo to Mount Fuji, pirate ship cruise on Lake Ashi, and hot spring lunch.",
    type: "PACKAGE",
    price: 260,
    currency: "USD",
    imageUrl:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    status: "ACTIVE",
    featured: false,
    ratingAvg: 5.0,
    ratingCount: 35,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    details: {
      location: "Tokyo & Hakone, Japan",
      destination: "Tokyo",
      duration: "1 Full Day",
    },
    agency: {
      id: "agency-sakura",
      name: "Sakura Heritage Journeys",
      slug: "sakura-heritage",
      verified: true,
    },
  },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ location?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const location = params?.location?.trim() || "";

  let services: ApiServiceDetail[] = [];
  let categories: ApiCategory[] = [];
  try {
    const data = await apiFetch<{
      services: ApiServiceDetail[];
      categories: ApiCategory[];
    }>(`/api/home${location ? `?location=${encodeURIComponent(location)}` : ""}`, {
      timeoutMs: 3000,
    });
    services = data?.services || [];
    categories = data?.categories || [];
  } catch (err) {
    console.warn(
      "[HomePage] Backend API is cold-starting or unavailable; serving curated offers seamlessly:",
      err
    );
  }

  const displayServices =
    services.length > 0 ? services : location ? [] : CURATED_OFFERS;

  // Fallback categories if backend has few or none yet
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { id: "c-tours", name: "Tour Packages", slug: "tours", icon: "🧳", description: "Guided adventures" },
          { id: "c-hotels", name: "Hotels & Stays", slug: "hotels", icon: "🏨", description: "Boutique retreats" },
          { id: "c-transfer", name: "Airport Transfers", slug: "transfers", icon: "🚐", description: "Private & shared rides" },
          { id: "c-treks", name: "Adventure & Treks", slug: "treks", icon: "🧗", description: "Mountain expeditions" },
        ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20 pb-20">
      {/* =================================================================== */}
      {/* 1. HERO BANNER SECTION (Using the user's travel banner image)        */}
      {/* =================================================================== */}
      <section className="relative mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 sm:pt-5 lg:px-8">
        <div className="relative min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] w-full overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-border/60 shadow-2xl">
          {/* Background Banner Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/travel-banner.jpg"
              alt="Open Travel - Worldwide travel with verified agencies"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-[70%_center] sm:object-center transition-transform duration-700 ease-out"
            />

            {/* Layer 1: Left-to-right deep dark vignette so text & search console are crystal clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30 sm:from-slate-950/90 sm:via-slate-950/65 sm:to-transparent" />

            {/* Layer 2: Subtle bottom & top darkening for high-contrast readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/25" />

            {/* Layer 3: Subtle ambient glow */}
            <div className="pointer-events-none absolute -top-32 -left-20 size-96 rounded-full bg-primary/25 blur-3xl" />
          </div>

          {/* Banner Interactive & Text Content */}
          <div className="relative z-10 flex min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex-col justify-between p-6 sm:p-10 lg:p-14">
            {/* Top row: Trust Badge & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
             

              {/* <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
                <ShieldCheck className="size-3.5 text-emerald-400" />
                <span>100% Accredited Operators</span>
              </div> */}
            </div>

            {/* Hero Main Body: Headline, Subtitle & Elevated Search Console */}
            <div className="my-auto max-w-2xl py-6 sm:py-8">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl sm:leading-[1.12]">
                Explore the World with{" "}
                <span className="bg-gradient-to-r from-sky-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
                  Trusted Agencies
                </span>
              </h1>

              <p className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-slate-200/90 leading-relaxed max-w-xl font-normal">
                Discover curated tour packages, boutique hotels, and airport transportation published directly by verified local agencies. Chat directly with operators and book with peace of mind.
              </p>

              {/* Elevated Glassmorphic Search Bar Console */}
              <div className="mt-6 sm:mt-8">
                <div className="rounded-2xl border border-white/20 bg-background/95 p-2 shadow-2xl backdrop-blur-xl dark:bg-background/90">
                  <LocationSearchBar
                    size="lg"
                    placeholder="Search destination, country, city, or agency (e.g. Nepal, Paris, Thailand...)"
                    actionPath="/services"
                    initialValue={location}
                    className="border-0 shadow-none bg-transparent"
                  />
                </div>

                {/* Popular Destination Quick Filter Chips */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-200">
                  <span className="font-semibold text-white">Popular:</span>
                  {[
                    "Nepal",
                    "Paris",
                    "Thailand",
                    "Rome",
                    "London",
                    "Dubai",
                    "Tokyo",
                  ].map((place) => (
                    <Link
                      key={place}
                      href={`/services?location=${encodeURIComponent(place)}`}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 font-medium text-white transition-all hover:border-white/50 hover:bg-white/25 hover:scale-105 backdrop-blur-sm"
                    >
                      {place}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
                <Button
                  render={<Link href="/services" />}
                  size="lg"
                  className="gap-2 bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  Explore all offers
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  render={<Link href="/register?role=AGENCY" />}
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/30 bg-white/10 text-white font-medium hover:bg-white/20 hover:border-white/50 backdrop-blur-sm shadow-md"
                >
                  <Handshake className="size-4 text-amber-300" />
                  List as an agency
                </Button>
              </div>
            </div>

            {/* Desktop Floating Highlight Cards (Positioned over the banner landmarks on the right) */}
            <div className="pointer-events-none hidden lg:block absolute right-10 bottom-14 max-w-xs space-y-3 z-10">
              <div className="pointer-events-auto rounded-2xl border border-white/20 bg-black/45 p-3.5 backdrop-blur-md shadow-2xl text-white transform transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    <Plane className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight">500+ Curated Routes</div>
                    <div className="text-[11px] text-slate-300">Direct packages from local operators</div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-auto rounded-2xl border border-white/20 bg-black/45 p-3.5 backdrop-blur-md shadow-2xl text-white transform transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <Star className="size-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight">4.9 / 5 Rating</div>
                    <div className="text-[11px] text-slate-300">Over 12,000 satisfied travelers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info Bar inside Banner */}
            <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Verified Agency Profiles
                </span>
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <MessageSquare className="size-4 text-sky-400" />
                  Real-time Direct Chat
                </span>
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <ShieldCheck className="size-4 text-amber-300" />
                  No Hidden Middleman Fees
                </span>
              </div>
              <div className="text-slate-400 hidden md:block">
                Connecting travelers with verified agencies in 40+ countries
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. TRUST METRICS STRIP                                              */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TRUST_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${metric.bg}`}>
                <metric.icon className={`size-5 ${metric.color}`} />
              </div>
              <div>
                <div className="text-base font-extrabold text-foreground leading-tight">
                  {metric.value}
                </div>
                <div className="text-xs font-semibold text-foreground/90 mt-0.5">
                  {metric.label}
                </div>
                <div className="text-[11px] text-muted-foreground hidden sm:block truncate max-w-[160px]">
                  {metric.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. TRENDING DESTINATIONS SECTION (Matches landmarks in banner)      */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
              <Compass className="size-3.5" />
              <span>Inspiring Escapes</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
              Trending Global Destinations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Handcrafted packages and private transfers across the world’s most iconic locations.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-all hover:gap-1.5"
          >
            Explore all destinations
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRENDING_DESTINATIONS.map((dest) => (
            <Link
              key={dest.name}
              href={`/services?location=${encodeURIComponent(dest.name)}`}
              className="group relative h-64 overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Destination Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.imageUrl}
                alt={dest.title}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Tag & Offer Count */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
                  {dest.tag}
                </span>
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm">
                  {dest.count}
                </span>
              </div>

              {/* Title & Description */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-bold leading-tight group-hover:text-sky-300 transition-colors">
                    {dest.title}
                  </h3>
                  <span className="text-xs font-extrabold text-amber-300 shrink-0">
                    {dest.price}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-slate-300">
                  {dest.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. TRAVEL STYLES & CATEGORIES                                       */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-muted/20 p-6 sm:p-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Browse by Travel Style
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Filter packages by your preferred way of exploring the world.
              </p>
            </div>
            <Link href="/services" className="text-xs font-semibold text-primary hover:underline">
              All categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {displayCategories.map((c) => (
              <Link
                key={c.id}
                href="/services"
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl transition-transform group-hover:scale-110">
                  <span aria-hidden>{c.icon ?? "✈️"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {c.description ?? "Explore verified offers"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. LATEST AGENCY OFFERS / MARKETPLACE CATALOG                       */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
                {location ? `Agency offers for "${location}"` : "Latest Agency Offers"}
              </h2>
              {location && (
                <Link
                  href="/"
                  className="rounded-full border border-border bg-muted/80 px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filter ✕
                </Link>
              )}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {location
                ? `Showing ${displayServices.length} offer(s) matching "${location}". Book online or message the agency directly.`
                : "Direct packages published by accredited agencies — compare options and message agencies directly."}
            </p>
          </div>

          <Button
            render={
              <Link href={location ? `/services?location=${encodeURIComponent(location)}` : "/services"} />
            }
            variant="ghost"
            className="gap-1.5 font-semibold text-primary hover:text-primary"
          >
            View marketplace catalog
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {displayServices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {location
                ? `No agency offers found for "${location}"`
                : "Agency offers are being prepared"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
              {location
                ? "Try searching for another country or city, or explore all listings in our catalog."
                : "Check back soon as verified agencies publish new offerings, or browse our service catalog."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {location && (
                <Button render={<Link href="/" />} variant="outline" size="sm">
                  Clear search filter
                </Button>
              )}
              <Button render={<Link href="/services" />} size="sm">
                Browse all marketplace services
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* 6. HOW OPEN TRAVEL WORKS (3-Step Seamless Process)                  */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Sparkles className="size-3.5" />
            <span>How Open Travel Works</span>
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            A Better Way to Experience the World
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From discovering itineraries to chatting with local tour guides, here is how you travel smarter.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="relative flex flex-col rounded-3xl border border-border/70 bg-card p-8 shadow-xs transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="size-6" />
                </div>
                <span className="text-3xl font-black text-muted-foreground/30 font-mono">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 7. WHY CHOOSE OPEN TRAVEL (Value Pillars)                           */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-muted/20 p-8 sm:p-12">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
              Why Travelers &amp; Agencies Trust Us
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We eliminate the opaque middlemen so travelers get authentic local care and tour operators earn what they deserve.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PILLARS.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1.5">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 8. AUTHENTIC TRAVELER REVIEWS (Social Proof)                        */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span>Traveler Experiences</span>
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground">
            Loved by Adventurers Worldwide
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Hear from travelers who booked direct packages with our verified agency network.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.author}
              className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-7 shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-bold text-xs text-primary">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground leading-tight">
                    {t.author}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {t.role} · <span className="text-primary font-medium">{t.destination}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 9. AGENCY PARTNER CALLOUT BANNER (B2B Conversion)                   */}
      {/* =================================================================== */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-blue-500/10 p-8 sm:p-14">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Handshake className="size-3.5" />
              For Tour &amp; Travel Operators
            </span>
            <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
              Are you a licensed travel agency or tour operator?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Showcase your packages, boutique hotels, and airport transfer services directly to thousands of active travelers. Manage bookings, receive customer inquiries via real-time chat, and grow your agency with zero upfront listing fees.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs font-medium text-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Zero upfront listing fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Direct real-time customer chat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Complete booking &amp; client management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Global traveler reach &amp; SEO promotion</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <Button
                render={<Link href="/register?role=AGENCY" />}
                size="lg"
                className="font-semibold shadow-md gap-2"
              >
                Register as an Agency Partner
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/login" />}
                variant="outline"
                size="lg"
                className="bg-background/80"
              >
                Agency Login
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import "server-only";

import { auth } from "@/auth";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

// Client for the Express backend. Only callable from server components and
// server actions. Identity comes from the verified session; the internal API
// key bounces anything that isn't our own Next.js server.
export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const session = await auth();

  const headers: Record<string, string> = {
    "x-internal-key": INTERNAL_API_KEY,
    accept: "application/json",
    ...(options.body !== undefined
      ? { "content-type": "application/json" }
      : {}),
  };
  if (session?.user?.id) {
    headers["x-user-id"] = session.user.id;
    headers["x-user-role"] = session.user.role ?? "";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      (payload as { error?: string } | null)?.error ??
        `The backend returned an error (${response.status}).`
    );
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Shared payload shapes (mirror the fields the pages render).
// ---------------------------------------------------------------------------

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export type ApiTour = {
  id: string;
  slug: string;
  title: string;
  description: string;
  destination: string;
  country: string | null;
  durationDays: number;
  durationNights: number;
  groupSizeMin: number;
  groupSizeMax: number;
  price: number;
  currency: string;
  imageUrl: string | null;
  status: string;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: { day: number; title: string; description: string }[];
  category?: ApiCategory | null;
  agency?: {
    name: string;
    verified: boolean;
    user?: { name: string } | null;
  } | null;
};

export type ApiAgency = {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  country: string | null;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  approvalStatus: string;
  rejectedReason: string | null;
};

export type ApiService = {
  id: string;
  agencyId: string;
  type: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  featured: boolean;
  imageUrl: string | null;
  details: Record<string, unknown> | null;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiServiceAgency = {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
};

export type ApiServiceDetail = ApiService & {
  agency: ApiServiceAgency | null;
};

export type ApiBooking = {
  id: string;
  bookingNumber: string;
  serviceId: string;
  status: string;
  totalPrice: number;
  currency: string;
  travelDate: string;
  numTravelers: number;
  paymentStatus: string;
  createdAt: string;
  service?: {
    id: string;
    slug: string;
    title: string;
    agency?: { name: string } | null;
  } | null;
  customer?: {
    id: string;
    user?: {
      name: string | null;
      email?: string | null;
    } | null;
  } | null;
};

export type ApiReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  createdAt: string;
  tourPackage?: { title: string } | null;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  createdAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderRole: "CUSTOMER" | "AGENCY";
  text: string;
  createdAt: string;
  readAt?: string | null;
};

export type ApiConversation = {
  id: string;
  customerId: string;
  agencyId: string;
  serviceId?: string | null;
  bookingId?: string | null;
  customerUnread?: number;
  agencyUnread?: number;
  unread: number;
  otherName: string;
  service?: {
    id: string;
    title: string;
    slug: string;
    price?: number;
    currency?: string;
    imageUrl?: string | null;
    type?: string;
  } | null;
  lastPreview?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ApiMessage[];
};
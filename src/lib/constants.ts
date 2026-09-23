export const ROLES = {
  CUSTOMER: "CUSTOMER",
  AGENCY: "AGENCY",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  AGENCY: "/dashboard/agency",
  ADMIN: "/dashboard/admin",
};

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
  DECLINED: "DECLINED",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
} as const;

export const PACKAGE_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export const SERVICE_TYPE = {
  HOTEL: "HOTEL",
  TRANSPORTATION: "TRANSPORTATION",
  PACKAGE: "PACKAGE",
} as const;

export const AGENCY_APPROVAL_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const SERVICE_STATUS = PACKAGE_STATUS;
export const POST_STATUS = PACKAGE_STATUS;
export const LOCATION_STATUS = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
} as const;

export const CONVERSATION_STATUS = {
  OPEN: "OPEN",
  ARCHIVED: "ARCHIVED",
} as const;

export const REVIEW_STATUS = {
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
} as const;
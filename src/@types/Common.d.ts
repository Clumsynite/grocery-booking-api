export const enum PaymentMode {
  BANK = "bank",
  CARD = "card",
  UPI = "upi",
  CASH = "cash",
}

export type payment_mode = PaymentMode.BANK | PaymentMode.CARD | PaymentMode.UPI | PaymentMode.CASH;

export const enum Status {
  PENDING = "pending",
  SHIPPED = "shipped",
  OUT_FOR_DELIVERY = "out-for-delivery",
  DELIVERED = "delivered",
  RETURNED = "returned",
}

export type order_status =
  | Status.PENDING
  | Status.SHIPPED
  | Status.OUT_FOR_DELIVERY
  | Status.DELIVERED
  | Status.RETURNED;

export interface PaginationParams {
  limit: number | null;
  skip: number | null;
  totalRecords?: boolean;
  order?: "created_at" | "updated_at";
  dir?: "desc" | "asc";
  id?: string;
  search?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export type requestId = string | undefined;

export interface DropdownObject {
  label: string;
  value: string;
  [key: string]: string | number | boolean | null | undefined;
}

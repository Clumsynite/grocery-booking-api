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

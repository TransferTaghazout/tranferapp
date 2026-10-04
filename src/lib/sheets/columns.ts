export const RESERVATION_HEADERS = [
  "ID",
  "Created At",
  "Date",
  "Time",
  "Customer Name",
  "Phone",
  "WhatsApp",
  "Number of People",
  "Type",
  "Service Name",
  "Pickup Location",
  "Destination",
  "Price",
  "Cost",
  "Profit",
  "Currency",
  "Status",
  "Payment Status",
  "Description",
  "Internal Notes",
  "Driver",
  "Vehicle",
  "Flight Number",
  "Booking Source",
  "Updated At",
] as const;

export const SERVICE_HEADERS = [
  "Service ID",
  "Service Name",
  "Type",
  "Default Price",
  "Default Cost",
  "Description",
  "Active",
] as const;

export const CUSTOMER_HEADERS = [
  "Customer ID",
  "Name",
  "Phone",
  "WhatsApp",
  "Country",
  "Email",
  "Total Reservations",
  "Total Spent",
  "Last Reservation",
  "Notes",
] as const;

export const FINANCE_HEADERS = [
  "Date",
  "Reservation ID",
  "Service",
  "Revenue",
  "Cost",
  "Profit",
  "Payment Status",
] as const;

export const SETTINGS_HEADERS = [
  "Business Name",
  "Currency",
  "Timezone",
  "Default Currency",
  "WhatsApp Country Code",
  "Driver WhatsApp",
] as const;

export const SHEETS = {
  reservations: "Reservations",
  services: "Services",
  customers: "Customers",
  finance: "Finance",
  settings: "Settings",
} as const;

export type SheetName = (typeof SHEETS)[keyof typeof SHEETS];

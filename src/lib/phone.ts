export function digitsOnly(value: string) {
  return (value || "").replace(/\D/g, "");
}

export function normalizePhone(value: string, countryCode = "212") {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith(countryCode)) return digits;
  if (digits.startsWith("0")) return `${countryCode}${digits.slice(1)}`;
  if (digits.length <= 9) return `${countryCode}${digits}`;
  return digits;
}

export function phoneMatchKey(value: string, countryCode = "212") {
  const normalized = normalizePhone(value, countryCode);
  return normalized.slice(-9);
}

export function formatPhoneDisplay(value: string, countryCode = "212") {
  const normalized = normalizePhone(value, countryCode);
  if (!normalized) return "";
  if (normalized.startsWith("212") && normalized.length === 12) {
    return `+212 ${normalized.slice(3, 4)} ${normalized.slice(4, 6)} ${normalized.slice(6, 8)} ${normalized.slice(8, 10)} ${normalized.slice(10)}`;
  }
  return `+${normalized}`;
}

export function whatsappLink(value: string, countryCode = "212") {
  const normalized = normalizePhone(value, countryCode);
  if (!normalized) return "";
  return `https://wa.me/${normalized}`;
}

export function whatsappShareLink(
  text: string,
  phone?: string,
  countryCode = "212",
) {
  const encoded = encodeURIComponent(text);
  const normalized = phone ? normalizePhone(phone, countryCode) : "";
  return normalized
    ? `https://wa.me/${normalized}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
}

export function telLink(value: string) {
  const digits = digitsOnly(value);
  return digits ? `tel:+${digits.startsWith("00") ? digits.slice(2) : digits}` : "";
}

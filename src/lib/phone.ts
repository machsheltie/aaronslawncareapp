export function normalizeToE164(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.length === 10) digits = '1' + digits
  return digits.startsWith('+') ? digits : '+' + digits
}

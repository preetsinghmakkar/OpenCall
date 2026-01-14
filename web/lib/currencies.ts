// lib/currencies.ts
// Common currencies for mentor service pricing

export interface CurrencyOption {
  code: string // ISO 4217 currency code (3 letters)
  name: string // Currency name
  symbol: string // Currency symbol
}

export const currencies: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
]

/**
 * Get currency by code
 */
export function getCurrency(code: string): CurrencyOption | undefined {
  return currencies.find((c) => c.code === code)
}

/**
 * Get default currency (USD)
 */
export function getDefaultCurrency(): CurrencyOption {
  return currencies[0] // USD
}

/**
 * Format price in cents to display format
 */
export function formatPrice(cents: number, currencyCode: string): string {
  const currency = getCurrency(currencyCode) || getDefaultCurrency()
  const amount = cents / 100
  return `${currency.symbol}${amount.toFixed(2)}`
}

/**
 * Convert dollar amount to cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Convert cents to dollar amount
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

export function calculateVat(amountExcludingVat: number, vatRate: number) {
  return Math.round(amountExcludingVat * vatRate);
}

export function calculateGrossAmount(amountExcludingVat: number, vatRate: number) {
  return amountExcludingVat + calculateVat(amountExcludingVat, vatRate);
}

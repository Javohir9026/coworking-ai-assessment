export function formatUzs(amount: number): string {
  return `${Math.trunc(amount).toLocaleString('uz-UZ')} UZS`
}

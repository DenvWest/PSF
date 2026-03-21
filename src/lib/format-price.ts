export function formatPrice(euros: number): string {
  return `€${euros.toFixed(2).replace(".", ",")}`;
}

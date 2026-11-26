type RetailReference = { retail_price?: unknown; retail_mrp?: unknown };

/** Distributor strike-through reference is the current retail selling price, not distributor MRP. */
export function distributorRetailReference(item: RetailReference | null | undefined): number {
  for (const value of [item?.retail_price, item?.retail_mrp]) {
    if (typeof value !== 'number' && typeof value !== 'string') continue;
    if (typeof value === 'string' && !value.trim()) continue;
    const price = Number(value);
    if (Number.isFinite(price) && price > 0) return price;
  }
  return 0;
}

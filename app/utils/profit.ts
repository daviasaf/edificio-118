export function calcProfit(costPrice?: number | null, salePrice?: number | null, promotionalPrice?: number | null) {
  if (!costPrice || !salePrice) {
    return { profit: null, profitMargin: null }
  }

  const revenuePrice = promotionalPrice || salePrice
  const profit = revenuePrice - costPrice
  const profitMargin = revenuePrice > 0 ? (profit / revenuePrice) * 100 : 0

  return {
    profit: Number(profit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2))
  }
}
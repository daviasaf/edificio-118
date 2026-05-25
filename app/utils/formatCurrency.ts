export function formatCurrency(value: number | null | undefined) {
  const safeValue = Number(value || 0)

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(safeValue)
}
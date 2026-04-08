export function formatBRL(value: number): string {
  if (value >= 1_000_000) return `R$${(value / 1_000_000).toFixed(2)}MM`
  if (value >= 1_000) return `R$${(value / 1_000).toFixed(0)}k`
  return `R$${value.toFixed(0)}`
}

export function formatBRLFull(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function getMesLabel(mes: string): string {
  const d = new Date(mes + 'T12:00:00')
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'acima_meta': return '#3DBA7A'
    case 'proximo_meta': return '#F5A623'
    case 'abaixo_meta': return '#E05050'
    case 'critico': return '#FF3333'
    default: return '#555'
  }
}

export function getStatusEmoji(status: string): string {
  switch (status) {
    case 'acima_meta': return 'TOP'
    case 'proximo_meta': return 'OK'
    case 'abaixo_meta': return 'ATENCAO'
    case 'critico': return 'CRITICO'
    default: return ''
  }
}

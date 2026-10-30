/**
 * Group ngrams whose trends have identical non-zero values. Such terms are
 * probably normalized to the same term in the index. Zero-count terms are
 * skipped, because all terms without matches look identical.
 */
export function findIdenticalTrends(trends: { ngram: string; values: number[] }[]): string[][] {
  const groups = new Map<string, Set<string>>()
  trends
    .filter(({ values }) => values.some(value => value > 0))
    .forEach(({ ngram, values }) => {
      const key = values.join(',')
      groups.set(key, (groups.get(key) ?? new Set<string>()).add(ngram))
    })
  return [...groups.values()].filter(group => group.size > 1).map(group => [...group])
}

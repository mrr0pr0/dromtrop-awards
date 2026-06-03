export function assignRanks<T extends { vote_count: number }>(
  items: T[],
): (T & { rank: number })[] {
  let rank = 1;

  return items.map((item, index) => {
    if (index > 0 && item.vote_count < items[index - 1].vote_count) {
      rank = index + 1;
    }
    return { ...item, rank };
  });
}

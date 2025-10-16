export function updateLevels(
  levels: Array<[string, string]>,
  price: string,
  size: string,
): Array<[string, string]> {
  const index = levels.findIndex(([p]) => p === price);

  if (size === '0')
    return levels.filter((_, i) => i !== index);

  if (index !== -1) {
    return levels.map(([p, s], i) => (i === index ? [price, size] : [p, s]));
  } else {
    return [...levels, [price, size]];
  }
}

export function sortOrderbook(bids: Array<[string, string]>, asks: Array<[string, string]>) {
  const sortedBids = [...bids].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0])).reverse();
  const sortedAsks = [...asks].sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  return { bids: sortedBids, asks: sortedAsks };
}
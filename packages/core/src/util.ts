export function getUpperQuartile(data: Array<number>): number | undefined {
  if (data.length < 4) {
    return data.slice(-1).shift();
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedData.length / 2);

  const upperHalf =
    sortedData.length % 2 === 0
      ? sortedData.slice(medianIndex)
      : sortedData.slice(medianIndex + 1);

  if (upperHalf.length % 2 === 0) {
    const upperMiddle = upperHalf.length / 2;
    return (upperHalf[upperMiddle - 1] + upperHalf[upperMiddle]) / 2;
  } else {
    const upperMedianIndex = Math.floor(upperHalf.length / 2);
    return upperHalf[upperMedianIndex];
  }
}

export function getMedian(data: Array<number>): number | undefined {
  const sortedData = data.toSorted((a, b) => a - b);
  const medianIndex = Math.floor(sortedData.length / 2);
  return sortedData[medianIndex];
}

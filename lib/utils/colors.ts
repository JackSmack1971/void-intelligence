/**
 * Generates a deterministic HSL color based on a string input.
 * Used for consistent predicate color-coding.
 */
export function getPredicateColor(predicate: string): string {
  let hash = 0;
  const str = predicate.toLowerCase();
  
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use a range of hues that look good in dark mode
  const h = Math.abs(hash % 360);
  const s = 65; // 65% saturation
  const l = 60; // 60% lightness for better visibility on dark backgrounds
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

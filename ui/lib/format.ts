export function formatWei(wei: bigint, decimals: number = 18, precision: number = 6): string {
  if (wei === BigInt(0)) return "0";

  const divisor = BigInt(10 ** decimals);
  const whole = wei / divisor;
  const remainder = wei % divisor;

  if (remainder === BigInt(0)) {
    return whole.toString();
  }

  let remainderStr = remainder.toString().padStart(decimals, '0');
  
  // Trim trailing zeros
  remainderStr = remainderStr.replace(/0+$/, '');

  // If after trimming, it's still too long, truncate to precision
  if (remainderStr.length > precision) {
    remainderStr = remainderStr.substring(0, precision);
    // Ensure we don't end with a decimal point if all digits were trimmed
    if (remainderStr === '') {
      return whole.toString();
    }
  }
  
  return `${whole}.${remainderStr}`;
}

export function formatEther(wei: bigint, precision: number = 6): string {
  return formatWei(wei, 18, precision);
}

export function formatNumber(num: number): string {
  if (num === 0) return "0";
  
  // Always show full precision up to 18 decimal places
  return num.toFixed(18).replace(/\.?0+$/, '');
}

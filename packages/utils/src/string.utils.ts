/**
 * Example utility function for testing
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Example utility function for testing
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

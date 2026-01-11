/**
 * Generate a unique ID without requiring native crypto modules.
 * Uses timestamp + random string for uniqueness.
 * Suitable for local database IDs.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
}

/**
 * Utility functions for fleet SEO URL slugs
 */

/**
 * Converts any title or vehicle name to a URL-friendly lowercase SEO slug.
 * e.g. "Mercedes E Class (Executive)" -> "mercedes-e-class-executive"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except spaces & hyphens
    .replace(/[\s_]+/g, "-")  // replace spaces and underscores with hyphens
    .replace(/-+/g, "-")      // collapse repeated hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Sanitizes live user typing in the slug input to keep it URL-safe.
 */
export function sanitizeSlugInput(input: string): string {
  if (!input) return "";
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-") // replace spaces or invalid chars with hyphens
    .replace(/-+/g, "-");        // collapse duplicate hyphens
}

/**
 * Validates that a slug contains only lowercase alphanumeric characters and single hyphens.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.trim().length < 2) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

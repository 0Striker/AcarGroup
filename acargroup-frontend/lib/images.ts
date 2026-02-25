// Mock image helpers for when database images are not available
// Using Unsplash for camera/security/IT themed placeholder images

export const DEFAULT_PROJECT_IMAGE = "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=1200&h=800&fit=crop"; // Security cameras
const REFERENCE_LOGO_PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
];
export const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1920&h=1080&fit=crop"; // Server room
export const DEFAULT_SLIDER_IMAGE_1 = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"; // Network cables
export const DEFAULT_SLIDER_IMAGE_2 = "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop"; // Security system
export const DEFAULT_SLIDER_IMAGE_3 = "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"; // Data center

/**
 * Returns the provided image URL or a default image if URL is null/empty
 * @param imageUrl - The image URL from database
 * @param defaultImage - The default mock image to use
 * @returns The image URL to use
 */
export function getImageUrl(imageUrl: string | null | undefined, defaultImage: string): string {
    return imageUrl && imageUrl.trim() !== "" ? imageUrl : defaultImage;
}

/**
 * Returns project hero image or default
 */
export function getProjectImage(imageUrl: string | null | undefined): string {
    return getImageUrl(imageUrl, DEFAULT_PROJECT_IMAGE);
}

/**
 * Returns reference logo or default. When no logo is provided, a deterministic placeholder
 * from the Unsplash list is returned based on the provided seed (typically the reference name).
 */
export function getReferenceLogo(logoUrl: string | null | undefined, seed?: string): string {
    if (logoUrl && logoUrl.trim() !== "") {
        return logoUrl;
    }

    if (!seed) {
        return REFERENCE_LOGO_PLACEHOLDERS[0];
    }

    const normalized = seed.toLowerCase();
    const hash = Array.from(normalized).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return REFERENCE_LOGO_PLACEHOLDERS[hash % REFERENCE_LOGO_PLACEHOLDERS.length];
}

/**
 * Returns company hero image or default
 */
export function getHeroImage(imageUrl: string | null | undefined): string {
    return getImageUrl(imageUrl, DEFAULT_HERO_IMAGE);
}

/**
 * Returns slider images with defaults for missing ones
 */
export function getSliderImages(
    url1?: string | null,
    url2?: string | null,
    url3?: string | null
): string[] {
    return [
        getImageUrl(url1, DEFAULT_SLIDER_IMAGE_1),
        getImageUrl(url2, DEFAULT_SLIDER_IMAGE_2),
        getImageUrl(url3, DEFAULT_SLIDER_IMAGE_3),
    ];
}

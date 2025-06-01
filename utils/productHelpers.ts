export function generateSlug(name: string) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')      // Remove invalid chars
        .replace(/\s+/g, '-')              // Replace spaces with -
        .replace(/-+/g, '-')               // Collapse multiple -
        .replace(/^-+|-+$/g, '');          // Trim - from start/end
}

export function calculateSingpostFee({ length, width, height, weight }: { length: number, width: number, height: number, weight: number }) {
    if (
        length <= 324 &&
        width <= 229 &&
        height <= 65 &&
        weight <= 2
    ) {
        return 3.00;
    }
    if (
        length <= 600 &&
        width <= 400 &&
        height <= 300 &&
        weight <= 30
    ) {
        return 6.00;
    }
    const girth = 2 * width + 2 * height + length;
    if (
        girth <= 3000 &&
        length <= 1500 &&
        weight <= 30
    ) {
        return 12.00;
    }
    return null;
}
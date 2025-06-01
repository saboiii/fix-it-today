export interface Category {
    label: string;
    subcategories: string[];
}

export const COMMON_FILTER_OPTIONS: string[] = [
    "Sales",
    "Price: Low to High",
    "Price: High to Low",
    "Most Recent",
];

export const SHOP_CATEGORIES: Category[] = [
    { label: "Electronics", subcategories: ["Microcontrollers", "Sensors", "Displays", "Motors", "Power Supplies"] },
    { label: "Filament", subcategories: ["PLA", "ABS", "PETG", "TPU", "Specialty"] },
    { label: "Printer", subcategories: ["FDM Printers", "Resin Printers", "Parts & Upgrades", "Maintenance", "Enclosures"] },
    { label: "Accessories", subcategories: ["Nozzles", "Build Plates", "Tools", "Storage", "Cleaning"] },
    { label: "Power Tools", subcategories: ["Drills", "Soldering Irons", "Rotary Tools", "Heat Guns", "Cutters"] },
    { label: "Gears", subcategories: ["Belts & Pulleys", "Bearings", "Lead Screws", "Couplers", "Stepper Motors"] },
];

export const PRINT_CATEGORIES: Category[] = [
    { label: "Trending Prints", subcategories: ["Popular", "New Arrivals", "Editor's Picks"] },
    { label: "Games", subcategories: ["Board Games", "Miniatures", "Accessories"] },
    { label: "Educational", subcategories: ["STEM", "Models", "Teaching Aids"] },
    { label: "Display", subcategories: ["Figurines", "Art", "Props"] },
    { label: "For Him", subcategories: ["Gadgets", "Tools", "Toys"] },
    { label: "Adda", subcategories: ["Community", "Events", "Meetups"] },
];

export const ALL_PRODUCT_TYPES_CATEGORIES = {
    print: PRINT_CATEGORIES,
    other: SHOP_CATEGORIES,
};
import { GoChevronRight } from "react-icons/go";

type Category = {
    label: string;
    subcategories: string[];
};

interface CategoryMenuProps {
    categories: Category[];
    openIndex: number | null;
    setOpenIndex: (idx: number | null) => void;
    selectedSubCategory: string | null;
    setSelectedSubCategory: (sub: string) => void;
}

export default function CategoryMenu({
    categories,
    openIndex,
    setOpenIndex,
    selectedSubCategory,
    setSelectedSubCategory,
}: CategoryMenuProps) {
    return (
        <div className="hidden md:flex flex-col col-span-1 h-screen py-4">
            {categories.map((cat, idx) => (
                <div key={cat.label}>
                    <div
                        className="categoryListLabel flex justify-between items-center cursor-pointer select-none"
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                    >
                        <span>{cat.label}</span>
                        <GoChevronRight
                            size={20}
                            className={`ml-2 flex transition-transform duration-200 ${openIndex === idx ? "rotate-90" : ""}`}
                        />
                    </div>
                    {openIndex === idx && (
                        <div className="pl-6 py-2 flex flex-col gap-1 animate-fade-in">
                            {cat.subcategories.map(sub => (
                                <div
                                    key={sub}
                                    className={`subcategoryListLabel py-1 cursor-pointer hover:underline transition-opacity duration-200 ${selectedSubCategory === sub ? "opacity-100" : "opacity-60"}`}
                                    onClick={() => setSelectedSubCategory(sub)}
                                >
                                    {sub}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="divider" />
                </div>
            ))}
        </div>
    );
}
import { GoChevronRight } from "react-icons/go";
import { motion, AnimatePresence } from "framer-motion";

type Category = {
    label: string;
    subcategories: string[];
};

interface CategoryDropdownProps {
    categories: Category[];
    openCategory: boolean;
    setOpenCategory: (open: boolean) => void;
    openIndex: number | null;
    setOpenIndex: (idx: number | null) => void;
    selectedSubCategory: string | null;
    setSelectedSubCategory: (sub: string) => void;
}

export default function CategoryDropdown({
    categories,
    openCategory,
    setOpenCategory,
    openIndex,
    setOpenIndex,
    selectedSubCategory,
    setSelectedSubCategory,
}: CategoryDropdownProps) {
    return (
        <div onClick={() => setOpenCategory(!openCategory)} className="dropdownSecondary justify-between w-full md:hidden flex relative">
            CATEGORY
            <GoChevronRight
                size={14}
                className={`ml-1 flex transition-transform duration-200 ${openCategory ? "rotate-90" : ""}`}
            />
            <AnimatePresence>
                {openCategory && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-12 right-0 w-full phoneCategoryDropdownMenu bg-white dark:bg-neutral-900 rounded-xl shadow-lg z-30"
                        onClick={e => e.stopPropagation()}
                    >
                        {categories.map((cat, idx) => (
                            <div key={cat.label}>
                                <div
                                    className="flex justify-between items-center cursor-pointer select-none px-4 py-3"
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                >
                                    <span>{cat.label}</span>
                                    <GoChevronRight
                                        size={14}
                                        className={`ml-2 flex transition-transform duration-200 ${openIndex === idx ? "rotate-90" : ""}`}
                                    />
                                </div>
                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="pl-8 py-2 flex flex-col gap-1"
                                        >
                                            {cat.subcategories.map(sub => (
                                                <div
                                                    key={sub}
                                                    className={`py-1 cursor-pointer hover:underline transition-opacity duration-200 ${selectedSubCategory === sub ? "opacity-100" : "opacity-60"}`}
                                                    onClick={() => setSelectedSubCategory(sub)}
                                                >
                                                    {sub}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {idx !== categories.length - 1 && (
                                    <div className="my-2 border-b-[0.5px] dark:border-text/10" />
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
import { GoChevronRight } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface SortDropdownProps {
    openSort: boolean;
    setOpenSort: (open: boolean) => void;
    filter: number;
    setFilter: (idx: number) => void;
    filterOptions: string[];
}

export default function SortDropdown({
    openSort,
    setOpenSort,
    filter,
    setFilter,
    filterOptions,
}: SortDropdownProps) {
    return (
        <div
            className="relative flex items-center dropdownPrimary justify-center cursor-pointer select-none"
            onClick={() => setOpenSort(!openSort)}
        >
            <span className="whitespace-nowrap">Sort by</span>
            <GoChevronRight
                size={14}
                className={`ml-1 flex transition-transform duration-200 ${openSort ? "rotate-90" : ""}`}
            />
            <AnimatePresence>
                {openSort && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute flex flex-col p-4 top-12 right-0 w-50 dropdownMenu rounded-xl z-10"
                    >
                        {filterOptions.map((option, idx) => (
                            <div
                                key={option}
                                className={`flex items-center mb-1 dropdownMenuItem cursor-pointer`}
                                onClick={e => {
                                    e.stopPropagation();
                                    setFilter(idx);
                                    setOpenSort(false);
                                }}
                            >
                                <span>{option}</span>
                                {filter === idx && (
                                    <IoCheckmark className="ml-2" />
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
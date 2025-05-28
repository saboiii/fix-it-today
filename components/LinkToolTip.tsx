import { motion, AnimatePresence } from "framer-motion";
import { MdOutlineArrowOutward } from "react-icons/md";

function LinkToolTip({
    tooltip,
    title = "Model"
}: {
    tooltip: { x: number; y: number } | null;
    title?: string;
}) {
    if (!tooltip) return null;
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.7, x: tooltip.x - 40, y: tooltip.y }}
                animate={{ opacity: 1, scale: 1, x: tooltip.x, y: tooltip.y }}
                exit={{ opacity: 0, scale: 0.7, x: tooltip.x - 40, y: tooltip.y }}
                transition={{ type: "spring", stiffness: 400, damping: 50, duration: 0.2 }}
                className="pointer-events-none absolute z-50"
                style={{ left: 10, top: 0 }}
            >
                <div className="tooltip">
                    
                    <MdOutlineArrowOutward size={16} className="mx-1 flex" />
                    {title}
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export default LinkToolTip
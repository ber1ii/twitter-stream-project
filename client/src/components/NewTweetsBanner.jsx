import { motion, AnimatePresence } from "framer-motion";

const wrapper = "fixed top-20 sm:top-24 left-0 right-0 z-50 flex justify-center px-4 sm:px-6";
const banner = 
    "bg-sky-500 text-white font-medium px-6 py-3 rounded-full shadow-lg text-center cursor-pointer hover:bg-sky-400 transition-all text-sm sm:text-base max-w-2xl w-full";

export default function NewTweetsBanner({ visible, count, onClick }) {
    return (
        <AnimatePresence>
            {visible && (
                <div className={wrapper}>
                    <motion.button
                        key={count}
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={banner}
                        onClick={onClick}
                        aria-label={`${count} new tweets available, click to refresh`}
                    >
                        {count} new tweet{count !== 1 ? 's' : ''} · tap to refresh
                    </motion.button>
                </div>
            )}
        </AnimatePresence>
    );
}
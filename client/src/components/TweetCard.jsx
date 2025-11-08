import { motion } from "framer-motion";

const wrapper =
    "rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 sm:p-5 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-500/50 hover:bg-slate-800/70 transition-all duration-200 cursor-pointer";
const username = "font-semibold text-sky-400 mr-1";
const text = "text-slate-100 leading-relaxed tracking-tight";
const time = "text-xs text-slate-400 mt-3 block";

export default function TweetCard({ tweet }) {
  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={wrapper}
    >
        <p className={text}>
            <span className={username}>@{tweet.user}</span>
            {tweet.text}
        </p>
        <span className={time}>
            {new Date(tweet.createdAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}
        </span>
    </motion.div>
  );
}
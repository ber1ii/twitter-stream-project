import { Bird } from "lucide-react";

const header = 
    "fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg";
const container = "max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between";
const leftSide = "flex items-center gap-3";
const logo = "w-7 h-7 sm:w-8 sm:h-8 text-sky-400";
const title = "text-xl sm:text-2xl font-bold text-slate-100";
const liveStatus = "flex items-center gap-2 text-xs sm:text-sm text-slate-400";
const liveDot = "w-2 h-2 rounded-full bg-green-400 animate-pulse";

export default function Header() {
    return (
        <header className={header}>
            <div className={container}>
                <div className={leftSide}>
                    <Bird className={logo} />
                    <h1 className={title}>Mock Twitter</h1>
                </div>

                <div className={liveStatus}>
                    <div className={liveDot} />
                    <span className="hidden sm:inline">Live</span>
                </div>
            </div>
        </header>
    );
}
import { Loader2 } from "lucide-react"

const spinner = "w-6 h-6 animate-spin text-sky-400";
const wrapper = "flex justify-center items-center py-8";
const text = "ml-3 text-slate-400 text-sm";

export default function LoadingSpinner({ message = "Loading..." }) {
    return (
        <div className={wrapper}>
            <Loader2 className={spinner}/>
            <span className={text}></span>
        </div>
    );
}
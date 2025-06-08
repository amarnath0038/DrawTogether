import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated, title
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    title?: string
}) {
    return <div className={`m-2 cursor-pointer rounded-lg p-1.5 ${activated ? "bg-[#48488e] text-white" : "text-zinc-400"}`} onClick={onClick} title={title}>
        {icon}
    </div>
}

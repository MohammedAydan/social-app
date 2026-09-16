"use client";
import type { ButtonHTMLAttributes } from "react";

type ActionButtonProps = {
    icon: React.ReactNode;
    text?: string;
    onClick?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ActionButton = ({ icon, text = "", onClick, ...rest }: ActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className='flex-1 flex items-center justify-center bg-secondary p-2 rounded-2xl hover:bg-secondary/80 transition-all'
            {...rest}
        >
            <div className="flex items-center justify-center gap-3">
                <div>{icon}</div>
                <p className="text-primary">{text}</p>
            </div>
        </button>
    );
};
export default ActionButton;  
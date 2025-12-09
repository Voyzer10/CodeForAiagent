import React from 'react';
import { CircleCheck, Info, TriangleAlert, XCircle } from 'lucide-react';

const Alert = ({ severity = "info", children, onClose }) => {
    const styles = {
        success: {
            bg: "bg-green-900/20",
            border: "border-green-500",
            text: "text-green-400",
            icon: <CircleCheck className="w-5 h-5 text-green-400 shrink-0" />
        },
        info: {
            bg: "bg-blue-900/20",
            border: "border-blue-500",
            text: "text-blue-400",
            icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />
        },
        warning: {
            bg: "bg-yellow-900/20",
            border: "border-yellow-500",
            text: "text-yellow-400",
            icon: <TriangleAlert className="w-5 h-5 text-yellow-400 shrink-0" />
        },
        error: {
            bg: "bg-red-900/20",
            border: "border-red-500",
            text: "text-red-400",
            icon: <XCircle className="w-5 h-5 text-red-400 shrink-0" />
        }
    };

    const style = styles[severity] || styles.info;

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border} ${style.text} mb-4 shadow-sm`}>
            {style.icon}
            <div className="flex-1 text-sm font-medium pt-0.5">
                {children}
            </div>
            {onClose && (
                <button onClick={onClose} className="hover:opacity-70 transition ml-2">
                    <span className="sr-only">Close</span>
                    ✕
                </button>
            )}
        </div>
    );
};

export default Alert;

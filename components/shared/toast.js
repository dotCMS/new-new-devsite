import { useEffect } from 'react';

export const Toast = ({ title, description, show, handleClose, className }) => {
    useEffect(() => {
        if (!show) {
            return;
        }

        setTimeout(() => handleClose(), 2500);
    }, [show, handleClose]);

    return (
        <div
            className={`fixed right-3 top-6 w-auto max-w-sm gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm ${className} ${show ? 'flex' : 'hidden'}`}
            role="alert">
            <div className="block">
                <h5 className="mb-1 text-sm text-gray-900">{title}</h5>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
            <button
                type="button"
                className="inline-flex shrink-0 justify-center text-gray-400 transition-all duration-150 "
                data-dismiss="alert"
                onClick={handleClose}>
                <span className="sr-only">Close</span>
                <svg
                    className="size-6 "
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7 17L17 7M17 17L7 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
};

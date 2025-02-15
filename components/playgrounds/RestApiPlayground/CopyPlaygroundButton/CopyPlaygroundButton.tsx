"use client";
import { type FC, useState } from "react";
import { type TCopyPlaygroundButton } from './types'
import { COPY_TIME } from './config'

const CopyPlaygroundButton: FC<TCopyPlaygroundButton> = ({ text, disabled }) => {
    const [buttonText, setButtonText] = useState<string>('COPY');
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleCopy = async () => {
        try {
            const textToCopy = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
            await navigator.clipboard.writeText(textToCopy);
            setButtonText('Copied');

            if (timeoutId) clearTimeout(timeoutId);

            const newTimeoutId = setTimeout(() => {
                setButtonText('Copy');
            }, COPY_TIME);

            setTimeoutId(newTimeoutId);
        } catch (error) {
            console.error('Failed to copy text: ', error);
        }
    };

    return (
        <div className="flex justify-end items-center p-3">
            <button 
                disabled={disabled} 
                className={"border-none bg-transparent flex justify-start items-center"}
                onClick={handleCopy}>
                <svg className="h-[25px] w-[25px] mr-2 fill-[#0077c0]" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none" /><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
                <span
                    className="text-[#a5aec5] text-sm font-medium text-left mt-[2px]"
                    >
                    {buttonText}
                </span>
            </button>
        </div>
    )
};

export default CopyPlaygroundButton;

/**/
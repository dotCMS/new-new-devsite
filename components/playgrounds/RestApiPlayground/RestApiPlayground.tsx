"use client";
import { type FC, useState } from 'react';
import Image from 'next/image';
import CopyPlaygroundButton from './CopyPlaygroundButton/CopyPlaygroundButton';
import { OPTIONS } from './config';
import { type TFetchFn } from './types'
import React, { useEffect, useRef } from "react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";

type RestApiPlaygroundProps = {
    contentlet: any; // Replace 'any' with proper type if known
    sideNav: any;    // Replace 'any' with proper type if known
    slug: string;
};

export const RestApiPlayground = ({ contentlet, sideNav, slug }: RestApiPlaygroundProps) => {
    const [selectedOption, setSelectedOption] = useState(OPTIONS[0]);
    const [result, setResult] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    if (!contentlet || !sideNav) {
        return <div>Loading...</div>;
    }

    const handleClick = async (fetchFn: TFetchFn): Promise<void> => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetchFn();
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult(null);
        }
        setLoading(false);
    };



    return (

        <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto">
        {/* Main Content Area */}
            <main className="flex-1 min-w-0 py-8 lg:pb-12 px-0 sm:px-0 lg:px-8
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
            >
                <Breadcrumbs
                    items={sideNav[0]?.dotcmsdocumentationchildren || []}
                    slug={slug}
                />
                <h1 className='text-4xl font-bold text-foreground mb-8'>REST API Sampler</h1>

                <div className='rest-api-sampler'>
                    <div className='playground-rest-container pb-1 flex'>
                        <nav className='nav-options'>
                            {(OPTIONS || []).map((option, index: number) => (
                                <button
                                    key={index}
                                    className={`text-[#9076da] flex flex-col text-sm font-bold items-center gap-2 py-2 px-4 min-w-32 snap-start ${
                                        selectedOption.name === option.name
                                            ? 'border-b-[3px] border-brightPurple text-foreground'
                                            : 'border-b-[3px] border-transparent'
                                    }`}
                                    id={option.name.toLowerCase()}
                                    data-value={index}
                                    data-toggle="tab"
                                    onClick={() => setSelectedOption(option)}
                                >
                                    <span
                                        className={`${
                                            selectedOption.name === option.name
                                                ? 'bg-white rounded-full'
                                                : 'unselected-image'
                                        }`}
                                    >
                                        <Image
                                            src={option.icon}
                                            width={72}
                                            height={72}
                                            alt={`${option.name} logo`}
                                        />
                                    </span>
                                    {option.name}
                                </button>
                            ))}
                        </nav>

                        <div className="container-rest w-full h-[800px] overflow-scroll p-4">
                            <div className="rest-fetch-call">
                                <CopyPlaygroundButton
                                    disabled={!selectedOption.codeRequest}
                                    text={selectedOption.codeRequest}
                                />
                                <pre className="codePrev line-numbers">
                                    <code className="code-api language-javascript" id="code-prev">
                                        {selectedOption.codeRequest}
                                    </code>
                                </pre>
                            </div>

                            <button
                                className="run-call-btn"
                                id="run-call-btn"
                                onClick={() => handleClick(selectedOption.fetchFn)}
                            >
                                <svg
                                    xmlSpace="preserve"
                                    viewBox="0 0 100 100"
                                    y="0"
                                    x="0"
                                    xmlns="http://www.w3.org/2000/svg"
                                    version="1.1"
                                    width="64px"
                                    height="64px"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundSize: 'initial',
                                        backgroundPositionY: 'initial',
                                        backgroundPositionX: 'initial',
                                        backgroundOrigin: 'initial',
                                        backgroundImage: 'initial',
                                        /*backgroundColor: '#fff',*/
                                        backgroundClip: 'initial',
                                        backgroundAttachment: 'initial',
                                        animationPlayState: 'paused',
                                        stroke: 'none',
                                    }}
                                >
                                    <g
                                        className="ldl-scale"
                                        style={{
                                            transformOrigin: '50% 50%',
                                            transform: 'rotate(0deg) scale(0.8, 0.8)',
                                            animationPlayState: 'paused',
                                        }}
                                    >
                                        <circle cx="46" cy="50" r="49" stroke="#B626E8" strokeWidth="4" fill="#fff" />
                                        <path
                                            fill="#333"
                                            d="M78.158 51.843L25.842 82.048c-1.418.819-3.191-.205-3.191-1.843v-60.41c0-1.638 1.773-2.661 3.191-1.843l52.317 30.205c1.418.819 1.418 2.867-.001 3.686z"
                                            style={{ animationPlayState: 'paused' }}
                                        />
                                    </g>
                                </svg>
                            </button>

                            <div className="rest-fetch">
                                <CopyPlaygroundButton 
                                    disabled={!result} 
                                    text={result ? JSON.stringify(result) : ''} 
                                />

                                <div className="pt-2 h-full w-full">
                                    {result ? (
                                        <pre className="text-sm text-foreground whitespace-pre-wrap">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="w-[75%] h-full m-auto flex justify-center items-center">
                                            <span className="text-xl font-bold text-[#a5aec5] text-center font-mono pb-10">
                                                {loading
                                                    ? 'Waiting for response...'
                                                    : 'Hit the Play button to get a response'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RestApiPlayground;

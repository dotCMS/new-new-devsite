import Link from "next/link"

interface APIPlaygroundsProps {
    title: string;
    description: string;
}

export default function APIPlaygrounds(props: APIPlaygroundsProps) {
    const { title, description } = props;

    return (
        <div className="relative">
            <div className="bg-black py-12 sm:py-16 md:py-20 rounded-[2rem] 2xl:-mx-16">
                <div className="container mx-auto px-8">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                        <div className="space-y-8 lg:w-1/2">
                            <div className="space-y-4">
                                <h3 className="text-3xl sm:text-4xl font-bold text-white">{title}</h3>
                                <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                                    {description}
                                </p>
                            </div>
                            <Link
                                href="/docs/rest-api"
                                className="text-[#a21caf] hover:text-[#a21caf]/90 inline-flex items-center gap-2 text-lg"
                            >
                                Get started with dotCMS REST APIs
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </Link>
                            <div className="space-y-6 mt-8">
                                <div className="space-y-2">
                                    <Link href="/playground/graphql" className="text-white font-medium hover:text-gray-200">
                                        GraphQL Playground
                                    </Link>
                                    <p className="text-gray-400">Interactive GraphQL query editor and schema explorer</p>
                                </div>
                                <div className="space-y-2">
                                    <Link href="/playground/rest" className="text-white font-medium hover:text-gray-200">
                                        REST API Playground
                                    </Link>
                                    <p className="text-gray-400">Test and explore REST API endpoints in real-time</p>
                                </div>
                                <div className="space-y-2">
                                    <Link href="/playground/image" className="text-white font-medium hover:text-gray-200">
                                        Image API Playground
                                    </Link>
                                    <p className="text-gray-400">Experiment with image transformations and optimizations</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg lg:w-1/2 w-full">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="font-medium">Authentication</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="transform rotate-180"
                                    >
                                        <path d="m6 9 6 6 6-6" />
                                    </svg>
                                </div>
                                <div className="font-mono text-sm bg-gray-50 p-4 rounded">
                                    <div className="text-gray-600">Authorization:</div>
                                    <div className="text-gray-400 break-all">Bearer {"<your-api-token>"}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="font-medium">Request Body</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="transform rotate-180"
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </div>
                                    <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
                                        <code className="text-sm">
                                            {`{`}
                                            <span className="text-[#a21caf]">"contentType"</span>
                                            {`: `}
                                            <span className="text-[#0f766e]">"Blog"</span>
                                            {`,`}
                                            <span className="text-[#a21caf]">"title"</span>
                                            {`:`}
                                            <span className="text-[#0f766e]">"Getting Started with dotCMS"</span>
                                            {`,`}
                                            <span className="text-[#a21caf]">"author"</span>
                                            {`: `}
                                            <span className="text-[#0f766e]">"John Doe"</span>
                                            {`,`}
                                            <span className="text-[#a21caf]">"status"</span>
                                            {`: `}
                                            <span className="text-[#0f766e]">"PUBLISHED"</span>
                                            {`}`}
                                        </code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


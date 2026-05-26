import Script from 'next/script';

export function WarmlyScript() {
    return (
        <Script
            id="warmly-script-loader"
            src="https://opps-widget.getwarmly.com/warmly.js?clientId=4819f621f434715d064bd2650e7e8f24"
            strategy="afterInteractive"></Script>
    );
}

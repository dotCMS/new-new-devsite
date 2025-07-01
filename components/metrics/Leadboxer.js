import Script from 'next/script';

export function LeadboxerScript() {
    return (
        <Script
            id="warmly-script-loader"
            src="//script.leadboxer.com/?dataset=e554a68399035d2bebf4d6054a50b855"
            defer></Script>
    );
}

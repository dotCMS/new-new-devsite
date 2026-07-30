import Script from 'next/script';

export function MeiroScript() {
    return (
        <>
            <Script
                id="meiro-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.mpt = window.mpt || function () {
                            (window.mpt.q = window.mpt.q || []).push(Array.prototype.slice.call(arguments));
                        };
                        window.mpt("config", {
                            collection_endpoint: "https://dotcms.eu2.pipes.meiro.io/collect/dev-dotcms-com",
                            link_tracking: { enabled: true },
                            tracking_rules: { enabled: true }
                        });

                        window.mpt("consent", {
                            storage_persistence: "granted",
                            user_id: "granted",
                            session_id: "granted"
                        });

                        window.mpt("event", "page_view");
                    `,
                }}
            />
            <Script
                id="meiro-script-loader"
                src="https://dotcms.eu2.pipes.meiro.io/mpt.js"
                strategy="afterInteractive"
            />
        </>
    );
}

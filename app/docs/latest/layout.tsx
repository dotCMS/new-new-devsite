import Header from "@/components/header/header";
import { getSideNav } from "@/services/docs/getSideNav";
import ClientNavTree from "@/components/navigation/ClientNavTree";

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
    // Fetch navigation data on the server
    const sideNav = await getSideNav();

    return (
        <div className="flex flex-col min-h-screen">
            <Header sideNavItems={sideNav[0]?.dotcmsdocumentationchildren || []} />
            
            <div className="flex-1">
                <div className="flex flex-col lg:flex-row container mx-auto px-0">
                    {/* Left Navigation - Hide on mobile */}
                    <div className="hidden lg:block w-72 shrink-0">
                        <ClientNavTree
                            items={sideNav[0]?.dotcmsdocumentationchildren || []}
                        />
                    </div>

                    {/* Main Content - Full width on mobile */}
                    <main className="flex-1 min-w-0 px-6 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
} 
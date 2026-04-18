declare module '@/components/navigation/Breadcrumbs' {
    const Breadcrumbs: React.FC<{
        items: any;
        slug: string;
        navSections?: unknown;
        childrenKey?: string;
        appendItems?: unknown[];
        basePath?: string;
        identifierKey?: string;
        homeUrl?: string;
    }>;
    export default Breadcrumbs;
} 
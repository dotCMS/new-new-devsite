"use client"

import { usePathname } from 'next/navigation';
import NavTree from './NavTree';
import Documentation from "@/components/documentation/Documentation";
import ChangeLogList from "@/components/changelogs/ChangeLogList";
import CurrentReleases from "@/components/releases/CurrentReleases";
import AllReleases from "@/components/releases/AllReleases";
import AllSecurityIssues from "@/components/security-issues/AllSecurityIssues";

type ClientNavTreeProps = {
    items: any[];
}

export default function ClientNavTree({ items }: ClientNavTreeProps) {
    const pathname = usePathname();
    const currentPath = pathname.replace('/docs/latest/', '');

    return (
        <NavTree
            items={items}
            currentPath={currentPath}
        />
    );
} 
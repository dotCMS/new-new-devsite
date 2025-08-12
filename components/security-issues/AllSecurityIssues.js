"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumbs from "../navigation/Breadcrumbs";
import { SecurityIssuesTable, TableReleases } from "./SecurityIssuesTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { SecurityOrderBy,TSecurityIssue } from '@/services/docs/getSecurityIssues/types';
import { SecurityIssueDetail } from "./SecurityIssueDetail";
export default function AllSecurityIssues({ sideNav, slug }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const [orderBy, setOrderBy] = useState(SecurityOrderBy.DEFAULT);
    const [issueNumber, setIssueNumber] = useState("");
    const [token, setToken] = useState("");
    useEffect(() => {
    const orderByValue = searchParams.get("orderBy");
    setOrderBy(orderByValue === "2" 
        ? SecurityOrderBy.SEVERITY 
        : orderByValue === "1" 
            ? SecurityOrderBy.FIX_VERSION 
            : SecurityOrderBy.DEFAULT);

            const issueNumber = searchParams.get("issueNumber");
            const sanitizedIssueNumber = issueNumber?.match(/^[a-zA-Z0-9-]+$/) ? issueNumber : null;
            setIssueNumber(sanitizedIssueNumber);
            setPage(searchParams.get("page"));
            const token = searchParams.get("token");
            const sanitizedToken = token?.match(/^[a-zA-Z0-9-]+$/) ? token : null;
            setToken(sanitizedToken);
    }, [searchParams]);
    
    
    const showDetail = issueNumber && issueNumber != "" && issueNumber != undefined && issueNumber != null;

    const breadcrumbs = sideNav[0]?.dotcmsdocumentationchildren || [];
    const appendItems = (showDetail) ? [{title: issueNumber, urlTitle: issueNumber}] : [];



    return (
        <>
            <div className="max-w-[1400px] mx-auto flex">
                <main className="flex-1 min-w-0 pt-8 px-12
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-muted-foreground/10
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
                >
                    <Breadcrumbs
                        items={breadcrumbs}
                        slug={slug}
                        appendItems={appendItems}
                        childrenKey="dotcmsdocumentationchildren"
                    />

                    <div className="markdown-content">
                        
                        {showDetail && (
                            <SecurityIssueDetail
                                issueNumber={issueNumber}
                                orderBy={orderBy}
                                page={page}
                                limit={40}
                                token={token}
                            />
                        )}
                   
                        {!showDetail && (
                        <SecurityIssuesTable 
                            issueNumber={issueNumber}
                            orderBy={orderBy}
                            page={page}
                            limit={40}
                            token={token}
                        />
                       ) }
                    </div>
                </main>
            </div>
        </>
    );
}

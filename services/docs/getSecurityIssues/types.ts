export type TSecurityIssue = {
    title:string
    tags:string[]
    issueNumber:string
    index:string
    severity:string
    requiresAdminAccess:string
    publishDate:string
    fixVersion:string
    credit:string
    description1:string
    token:string
    description:string
    example:string
    workaround:string
    issueLinks:string
}


export enum SecurityOrderBy {
    DEFAULT,    
    SEVERITY,
    FIX_VERSION,
  }
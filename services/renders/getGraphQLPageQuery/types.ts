export type TGetGraphQLPageQuery = {
  path: string
  language_id?: string
  mode?: string
}

export type TGraphQLPageData = {
  page: {
    title: string
    url: string
    seodescription: string
    containers: Array<{
      path: string
      identifier: string
      maxContentlets: number
      containerStructures: Array<{
        id: string
        structureId: string
        containerInode: string
        containerId: string
        code: string
        contentTypeVar: string
      }>
      containerContentlets: Array<{
        uuid: string
        contentlets: Array<{
          _map: any
          location?: {
            title: string
            url: string
            activities: Array<{
              title: string
              urlMap: string
            }>
          }
        }>
      }>
    }>
    host: {
      hostName: string
    }
    layout: {
      header: string
      footer: string
      body: Array<{
        rows: Array<{
          columns: Array<{
            widthPercent: number
            leftOffset: number
            styleClass: string
            preview: string
            width: number
            left: number
            containers: Array<{
              identifier: string
              uuid: string
            }>
          }>
        }>
      }>
    }
    template: {
      iDate: string
      inode: string
      identifier: string
      source: string
      title: string
      friendlyName: string
      modDate: string
      sortOrder: number
      showOnMenu: boolean
      image: string
      drawed: string
      drawedBody: string
    }
    viewAs: {
      mode: string
      visitor: {
        persona: {
          name: string
        }
      }
      language: {
        id: string
      }
    }
  }
}

import { ConfigDict } from '@/utils/constants'
import { DotCmsClient, type ClientConfig } from '@dotcms/client'

const config: ClientConfig = {
  dotcmsUrl: ConfigDict.DotCMSHost as string,
  authToken: ConfigDict.AuthToken as string,
  requestOptions: {
    cache: 'no-cache'
  }
}

const dotClient = new DotCmsClient(config)

export default dotClient

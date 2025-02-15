'use client'
import { type FC } from 'react'
import SwaggerUI from 'swagger-ui-react'

import { ConfigDict } from '@/util/constants'

import 'swagger-ui-react/swagger-ui.css'

const SwaggerUIComponent: FC = () => {
  return <SwaggerUI url={ConfigDict.SwaggerUrl} />
}

export default SwaggerUIComponent

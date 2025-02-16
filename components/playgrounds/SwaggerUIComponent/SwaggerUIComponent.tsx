'use client'
import { type FC } from 'react'
import SwaggerUI from 'swagger-ui-react'

import { Config } from '@/util/config'

import 'swagger-ui-react/swagger-ui.css'

const SwaggerUIComponent: FC = () => {
  return <SwaggerUI url={Config.SwaggerUrl} />
}

export default SwaggerUIComponent

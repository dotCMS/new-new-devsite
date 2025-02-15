import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import SwaggerUIComponent from './SwaggerUIComponent'

export default {
  title: 'Organisms Components/SwaggerUIComponent',
  component: SwaggerUIComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen'
  }
} as Meta<typeof SwaggerUIComponent>

const Template: StoryFn = () => <SwaggerUIComponent />

export const Default = Template.bind({})
Default.args = {}

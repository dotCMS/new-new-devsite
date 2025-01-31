import React from 'react'
import { Meta, StoryFn } from '@storybook/react'
import { TableReleases } from './TableReleases'
import { type TTableReleases } from './types'

export default {
  title: 'Molecules Components/TableReleases',
  component: TableReleases,
  tags: ['autodocs'],
  argTypes: {
    data: { control: 'object', description: 'Data for the table releases' },
    isLts: { control: 'boolean', description: 'Flag to indicate if release is LTS' }
  }
} as Meta<typeof TableReleases>

const Template: StoryFn<{ data: TTableReleases[]; isLts: boolean }> = args => <TableReleases {...args} />

export const Default = Template.bind({})
Default.args = {
  isLts: false,
  data: [
    {
      minor: 'v5.2.1',
      dockerImage: 'dotcms/dotcms:5.2.1'
    },
    {
      minor: 'v5.1.0',
      dockerImage: 'dotcms/dotcms:5.1.0'
    }
  ]
}

export const LtsRelease = Template.bind({})
LtsRelease.args = {
  isLts: true,
  data: [
    {
      minor: 'v4.0.0',
      dockerImage: 'dotcms/dotcms:4.0.0'
    }
  ]
}

export const NoData = Template.bind({})
NoData.args = {
  isLts: false,
  data: []
}

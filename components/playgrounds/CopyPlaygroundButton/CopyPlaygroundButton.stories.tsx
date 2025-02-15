import { Meta, StoryFn } from '@storybook/react';
import { CopyPlaygroundButton } from './CopyPlaygroundButton';
import { type TCopyPlaygroundButton } from './types';

export default {
  title: 'Atoms Components/CopyPlaygroundButton',
  component: CopyPlaygroundButton,
  tags: ['autodocs'],
} as Meta<typeof CopyPlaygroundButton>;

const Template: StoryFn<TCopyPlaygroundButton> = (args) => <CopyPlaygroundButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  text: 'This is the default text to copy',
  disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: 'This text is disabled',
  disabled: true,
};

export const CopyJSON = Template.bind({});
CopyJSON.args = {
  text: { key: 'value', example: 'Copying JSON structure' },
  disabled: false,
};

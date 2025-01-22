export const contactUsBlocks = [
    {
        heading: 'General',
        data: [
            {
                type: 'phone',
                phone: '+1-305-900-2001',
                number: '+13059002001',
                label: 'Contact us at +13059002001'
            },
            { type: 'mail', mail: 'info@dotcms.com' }
        ]
    },
    {
        heading: 'Sales',
        data: [
            {
                type: 'phone',
                phone: '+1-305-900-2001 x 1',
                number: '+13059002001,,1', // This will add the extension to the number when dialing
                label: 'Contact Sales at +13059002001 extension 1'
            },
            { type: 'mail', mail: 'sales@dotcms.com' }
        ]
    },
    {
        heading: 'Headquarters',
        data: [
            {
                type: 'address',
                address: 'dotCMS\n382 NE 191st St, #92150\nMiami, Florida 33179-3899 US',
                icon: 'map-pin.svg'
            }
        ]
    },
    {
        heading: 'Billing',
        data: [
            {
                type: 'address',
                address: 'dotCMS\n9450 SW Gemini Dr, #92150\nBeaverton, Oregon 97008-7105 US',
                icon: 'file-text.svg'
            }
        ]
    },
    {
        heading: 'Support',
        data: [
            { type: 'mail', mail: 'support@dotcms.com' },
            {
                type: 'link',
                link: 'https://helpdesk.dotcms.com/',
                label: 'Support portal Login',
                icon: 'life-buoy.svg'
            }
        ]
    }
];

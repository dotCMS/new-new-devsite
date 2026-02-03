'use client'

import { useEffect } from 'react'
import { AnalyticsBrowser } from '@segment/analytics-next'

export const SegmentAnalytics = () => {
    console.log('SegmentAnalytics component rendered')

    useEffect(() => {

        const loadAnalytics = async () => {
            try {

                const [analytics] = await AnalyticsBrowser.load(
                    {
                        writeKey: 'LP1had8vC0BZAB9vEN80w8tKWki2FCW9',
                        //cdnURL:'http://localhost:3000'
                        //cdnSettings:{....}
                    },
                    {
                        integrations: {
                            'Segment.io': {
                                apiHost: 'localhost:8080/com.segment/v1',
                                protocol: 'http'
                            }
                        }
                    }
                )


                analytics.page("dotCMS Dev Page", "Home")
            } catch (error) {
                console.error('Failed to load Segment analytics:', error)
                alert('Error loading Segment: ' + error.message)
            }
        }

        loadAnalytics()
    }, [])

    return null
}



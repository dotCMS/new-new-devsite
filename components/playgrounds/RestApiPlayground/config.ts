export const OPTIONS = [
    {
        name: 'Content', className: 'icon-content',
        icon: "data:image/svg+xml;charset=utf8,%3Csvg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath d='M19 22.58h17.85v4.3H19zm-2.39 2.15a2.07 2.07 0 11-2.07-2.07 2.07 2.07 0 012.11 2.07zm-.95 0a1.12 1.12 0 10-1.12 1.12 1.12 1.12 0 001.16-1.12zM19 20.42h17.85v-4.31H19zm-2.39-2.15a2.07 2.07 0 11-2.07-2.07 2.07 2.07 0 012.11 2.07zm-.95 0a1.12 1.12 0 10-1.12 1.11 1.12 1.12 0 001.16-1.11zM19 33.35h17.85v-4.3H19zm-2.35-2.15a2.07 2.07 0 11-2.07-2.07 2.07 2.07 0 012.07 2.07zm-.95 0a1.12 1.12 0 10-1.12 1.11 1.11 1.11 0 001.12-1.11zm.95 6.48a2.07 2.07 0 11-2.07-2.07 2.07 2.07 0 012.07 2.07zm-.95 0a1.12 1.12 0 10-1.12 1.11 1.12 1.12 0 001.12-1.11zm3.3 2.15h1v-1h-1zm0-1.76h1v-.8h-1zm0-1.59h1v-1h-1zm16.85 0h1v-1h-1zm0 1.59h1v-.8h-1zm0 1.76h1v-1h-1zm-1.74 0h.93v-1h-.93zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1h-.93zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1h-.92zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1H23zm-1.86 0h.94v-1h-.94zm13-3.35h.93v-1h-.93zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1h-.93zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1h-.93zm-1.86 0h.94v-1h-.94zm-1.85 0h.93v-1H23zm-1.86 0h.94v-1h-.94zm18.32-16.7H45v-1.16h-5.55zm0-3.67v1.17H45v-1.17zm3.91 5h-3.91v1.16h3.91zm-3.91 6.19H45v-1.16h-5.55zm0-2.5H45v-1.17h-5.55zm0 5h3.91v-1.15h-3.91z' fill='%23224472'/%3E%3C/svg%3E",
        fetchFn: () => fetch('https://demo.dotcms.com/api/content/query/+contentType:Activity/orderby/Activity.title'), codeRequest: `fetch('https://demo.dotcms.com/api/content/query/+contentType:Activity/orderby/Activity.title')
            .then(data => data.json())
            .then(data => console.log(data))` },
    {
        name: 'Layout', className: 'icon-template',
        icon: "data:image/svg+xml;charset=utf8,%3Csvg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath d='M40.5 22.12v-3.6h1.82v-4.83h-4.84v1.8h-19v-1.8h-4.8v4.83h1.82v19h-1.82v4.83h4.84V40.5h19v1.81h4.84v-4.83H40.5V22.12zM14.91 17.3v-2.4h2.39v2.4zm2.39 23.8h-2.39v-2.4h2.39zm20.76-3.62h-.58v1.8h-19v-1.8h-1.77v-19h1.81v-1.77h19v1.81h1.81v19h-1.27zm3 1.22v2.4H38.7v-2.4zM38.7 17.3v-2.4h2.4v2.4zM36.29 28v-8.29H19.71v8.89h16.58zm-3.19-7.07L28 23.48l-5.1-2.55zm-12.17.37l5.71 2.86L20.93 27zm2 6.09L28 24.84l5.1 2.55zM35.07 27l-5.71-2.85 5.71-2.86zm1.22 4.5H19.71v-1.2h16.58zm-16.58 1.18h7.53v1.22h-7.53zm9.07 0h7.52v1.22h-7.52zm-9.07 2.39h7.53v1.21h-7.53zm9.07 0h7.52v1.21h-7.52z' fill='%23224472'/%3E%3C/svg%3E",
        fetchFn: () => fetch('https://demo.dotcms.com/api/v1/page/render/index?language_id=1', {
            headers: {
                DOTAUTH: window.btoa('admin@dotcms.com:admin')
            }
        }),
        codeRequest: `fetch('https://demo.dotcms.com/api/v1/page/render/index?language_id=1', 
        {
            headers: {
                DOTAUTH: window.btoa('admin@dotcms.com:admin')
            }
        })
            .then(data => data.json())
            .then(data => console.log(data));`
    },
    {
        name: 'Authentication', className: 'icon-workflow',
        icon: "data:image/svg+xml;charset=utf8,%3Csvg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath d='M27.9 23.54a5.73 5.73 0 10-5.73-5.73 5.74 5.74 0 005.73 5.73zm0-10.19a4.46 4.46 0 11-4.46 4.46 4.46 4.46 0 014.46-4.46zm11.27 19.11a5.73 5.73 0 105.73 5.73 5.74 5.74 0 00-5.73-5.73zm0 10.19a4.46 4.46 0 114.46-4.46 4.46 4.46 0 01-4.46 4.46zM16.83 32.46a5.73 5.73 0 105.73 5.73 5.74 5.74 0 00-5.73-5.73zm0 10.19a4.46 4.46 0 114.46-4.46 4.46 4.46 0 01-4.46 4.46zm8.68-24.84a2.39 2.39 0 112.39 2.39 2.39 2.39 0 01-2.39-2.39zm3 11.73l4.62 3-.69 1.07-4.54-2.96-4.44 2.79-.68-1.08 4.48-2.82v-4.18h1.27zm13 8.65a2.39 2.39 0 11-2.39-2.39 2.39 2.39 0 012.44 2.39z' fill='%23224472'/%3E%3C/svg%3E",
        fetchFn: () => fetch('https://demo.dotcms.com/api/v1/authentication/api-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: 'admin@dotcms.com',
                password: 'admin',
                expirationDays: 10
            })
        }),
        codeRequest: `fetch('https://demo.dotcms.com/api/v1/authentication/api-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: 'admin@dotcms.com',
                password: 'admin',
                expirationDays: 10
            })
        })
            .then(data => data.json())
            .then(data => console.log());`
    },
    {
        name: 'ElasticSearch', className: 'icon-settings',
        icon: "data:image/svg+xml;charset=utf8,%3Csvg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath d='M43.8 30.13v-4.26l-3.67-1.4a12.84 12.84 0 00-1.06-2.55l1.61-3.58-3-3-3.59 1.61a12.29 12.29 0 00-2.54-1.06l-1.4-3.67h-4.29l-1.39 3.67a12.37 12.37 0 00-2.55 1.06l-3.58-1.61-3 3 1.61 3.58a12.6 12.6 0 00-1.06 2.55l-3.67 1.4v4.26l3.67 1.4a12.06 12.06 0 001.06 2.54l-1.61 3.59 3 3 3.58-1.61a12.37 12.37 0 002.55 1.06l1.39 3.67h4.27l1.4-3.67a12.52 12.52 0 002.54-1.06l3.59 1.61 3-3-1.61-3.59a12.52 12.52 0 001.06-2.54zm-4.69 7.24l-1.74 1.74L34 37.6l-.29.17A11.53 11.53 0 0130.87 39l-.33.08-1.31 3.45h-2.46L25.46 39h-.33a11.37 11.37 0 01-2.84-1.18L22 37.6l-3.37 1.51-1.74-1.74L18.4 34l-.17-.29a11.37 11.37 0 01-1.18-2.84l-.05-.33-3.45-1.31v-2.46L17 25.46l.08-.33a11.37 11.37 0 011.18-2.84l.14-.29-1.51-3.37 1.74-1.74L22 18.4l.29-.17a11.37 11.37 0 012.84-1.18l.33-.08 1.31-3.45h2.46L30.54 17l.33.08a11.37 11.37 0 012.84 1.18l.29.17 3.37-1.51 1.74 1.74L37.6 22l.17.29A11.53 11.53 0 0139 25.13l.08.33 3.45 1.31v2.46L39 30.54l-.08.33a11.53 11.53 0 01-1.18 2.84l-.14.29zm-17.5-7.8l-1.28.32A7.89 7.89 0 0120.1 28h1.31a6.25 6.25 0 00.2 1.57zM35.9 28a7.9 7.9 0 01-15.17 3.11l1.21-.52A6.58 6.58 0 1028 21.42V20.1a7.91 7.91 0 017.9 7.9zm-14.33-1.39l-1.29-.27a7.94 7.94 0 015.88-6l.31 1.28a6.59 6.59 0 00-4.9 4.99zM28 24.05A3.95 3.95 0 1124.05 28 4 4 0 0128 24.05z' fill='%23224472'/%3E%3C/svg%3E",
        fetchFn: () => {
            const body = {
                "query": {
                    "bool": {
                        "must": {
                            "term": {
                                "catchall": "snow"
                            }
                        }
                    }
                }
            };
            return fetch('https://demo.dotcms.com/api/es/search', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
        },
        codeRequest: `const body = {
            "query": {
                "bool": {
                    "must": {
                        "term": {
                            "catchall": "snow"
                        }
                    }
                }
            }
        };
        fetch('https://demo.dotcms.com/api/es/search', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(data => data.json())
            .then(data =>console.log());`
    },
    {
        name: 'Navigation', className: 'icon-flexible',
        icon: "data:image/svg+xml;charset=utf8,%3Csvg data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Cpath d='M26 38.21a.76.76 0 01-.76.76h-2.35a5.87 5.87 0 010-11.74h10.22a4.35 4.35 0 100-8.7h-2.32a.76.76 0 010-1.52h2.32a5.87 5.87 0 010 11.74H22.89a4.35 4.35 0 000 8.7h2.32a.76.76 0 01.79.76zm3-.93a.93.93 0 10.93.93.93.93 0 00-1-.93zm3.72 0a.93.93 0 10.93.93.93.93 0 00-1-.93zM23.35 18.7a.93.93 0 10-.93-.93.93.93 0 00.93.93zm3.72 0a.93.93 0 10-.93-.93.93.93 0 00.93.93zm8.32 16.1a.68.68 0 00-.52-.2.73.73 0 00-.51.21.74.74 0 000 1l2.42 2.37-2.36 2.42a.72.72 0 101 1l2.87-2.93a.73.73 0 000-1zM20.48 21.19a.74.74 0 001 0 .73.73 0 000-1l-2.37-2.42 2.42-2.37a.71.71 0 000-1 .68.68 0 00-.51-.22.72.72 0 00-.51.2l-2.94 2.88a.73.73 0 000 1z' fill='%23224472'/%3E%3C/svg%3E",
        fetchFn: () => fetch('https://demo.dotcms.com/api/v1/nav/?depth=2', {
            method: 'GET',
            mode: 'cors',
            headers: {
                DOTAUTH: window.btoa('admin@dotcms.com:admin'),
                'Access-Control-Allow-Origin': 'null'
            }
        }),
        codeRequest: `fetch('https://demo.dotcms.com/api/v1/nav?depth=2', {
            headers: {
                DOTAUTH: window.btoa('admin@dotcms.com:admin')
            }
        })
            .then(data => data.json())
            .then(data => console.log(data));`
    },
]
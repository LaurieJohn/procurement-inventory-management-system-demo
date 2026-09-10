// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-09-10',

    // The demo carries no server, no database and no API: every page is
    // rendered in the browser from the static data under data/. Rendering
    // client-side keeps `nuxt generate` a plain static bundle that Vercel can
    // serve without a Node function.
    ssr: false,

    devtools: { enabled: false },

    // Nuxt otherwise binds 'localhost', which on Windows resolves to the IPv6
    // loopback alone. A browser that reaches for 127.0.0.1 first then finds
    // nothing listening and hangs, so the dev server binds every IPv4 address.
    devServer: { host: '0.0.0.0', port: 3000 },

    modules: ['@pinia/nuxt'],

    css: ['~/assets/css/app.css'],

    app: {
        head: {
            title: 'PIMS — Demo by LaurieJohn',
            htmlAttrs: { lang: 'en' },
            // Argon expands the sidebar and shifts the content across from these
            // two classes; its own jQuery script used to set them from a cookie.
            bodyAttrs: { class: 'g-sidenav-show g-sidenav-pinned' },
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
                {
                    name: 'description',
                    content:
                        'PIMS — a front-end demo of a Procurement and Inventory Management System, built with Nuxt and Vue by LaurieJohn.',
                },
                { name: 'author', content: 'LaurieJohn' },
            ],
            link: [
                { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700' },
                { rel: 'stylesheet', href: '/argon/assets/vendor/nucleo/css/nucleo.css' },
                { rel: 'stylesheet', href: '/argon/assets/vendor/@fortawesome/fontawesome-free/css/all.min.css' },
                { rel: 'stylesheet', href: '/argon/assets/css/argon.css?v=1.1.0' },
                { rel: 'stylesheet', href: '/css/app.css' },
            ],
        },
    },
})

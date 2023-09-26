import './bootstrap';
import '../sass/app.scss';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJson from '@/locales/en.json';
import jaJson from '@/locales/ja.json';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    // cacheTime: 1000,
                },
                mutations: {
                    retry: false,
                },
            }
        });


        i18n.use(initReactI18next).init({
            resources: {
                en: { translation: enJson },
                ja: { translation: jaJson },
            },
            lng: 'en',
            fallbackLng: 'ja',
            interpolation: { escapeValue: false },
            });


        
        root.render(
            <QueryClientProvider client={queryClient}>
                <App {...props} />
                <ToastContainer />
			    <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

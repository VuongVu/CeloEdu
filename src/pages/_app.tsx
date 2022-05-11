import { type ReactNode, useState, useEffect } from 'react';
import { type AppProps } from 'next/app';

import type { EmotionCache } from '@emotion/cache';

import AppProvider from 'components/app-provider';

import createEmotionCache from 'utils/createEmotionCache';

import 'assets/styles/global.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

function Noop({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache;
}

function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
    const Layout = (Component as any).Layout || Noop;

    // Use to avoid hydration error on SSR
    const [showing, setShowing] = useState(false);

    useEffect(() => {
        setShowing(true);
    }, []);

    if (!showing) {
        return null;
    }

    return (
        <AppProvider emotionCache={emotionCache}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </AppProvider>
    );
}

export default MyApp;

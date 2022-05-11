import { type ReactNode, type FC, useMemo, useEffect } from 'react';
import NextHead from 'next/head';

import { ContractKitProvider, Alfajores, SupportedProviders } from '@celo-tools/use-contractkit';
import { Provider } from 'react-redux';
import type { PaletteMode } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';
import cookies from 'js-cookie';

import Notify from 'components/base/notify';

import store from 'store';
import useStateCallback from 'hooks/useStateCallback';
import { ColorModeContext, getDesignSystem } from 'utils/theme';

import '@celo-tools/use-contractkit/lib/styles.css';

type AppProviderProps = {
    emotionCache: EmotionCache;
    children?: ReactNode;
};

const AppProvider: FC<AppProviderProps> = props => {
    const { emotionCache, children } = props;

    const [themeMode, setThemeMode] = useStateCallback<PaletteMode>('light');
    const themColorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setThemeMode(
                    (prevMode: PaletteMode) => (prevMode === 'light' ? 'dark' : 'light'),
                    mode => {
                        cookies.set('themeMode', mode);
                    },
                );
            },
        }),
        [setThemeMode],
    );
    const theme = useMemo(() => createTheme(getDesignSystem(themeMode)), [themeMode]);

    useEffect(() => {
        const getThemeMode = (cookies.get('themeMode') as PaletteMode) || 'light';
        setThemeMode(getThemeMode);
    }, [setThemeMode]);

    return (
        <ContractKitProvider
            dapp={{
                name: 'Celo 101',
                description: 'Celo 101',
                url: '',
                icon: '',
            }}
            network={Alfajores}
            connectModal={{
                title: 'Connect to Celo',
                providersOptions: {
                    hideFromDefaults: [
                        SupportedProviders.Ledger,
                        SupportedProviders.Valora,
                        SupportedProviders.PrivateKey,
                        SupportedProviders.WalletConnect,
                    ],
                },
            }}>
            <Provider store={store}>
                <CacheProvider value={emotionCache}>
                    <NextHead>
                        <meta name="viewport" content="initial-scale=1, width=device-width" />
                    </NextHead>

                    <ColorModeContext.Provider value={themColorMode}>
                        <ThemeProvider theme={theme}>
                            <CssBaseline />

                            <Notify />

                            {children}
                        </ThemeProvider>
                    </ColorModeContext.Provider>
                </CacheProvider>
            </Provider>
        </ContractKitProvider>
    );
};

export default AppProvider;

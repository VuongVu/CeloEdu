export {};

import type { NextPage } from 'next';

import Layout from 'components/ui/layout';

import type { EthereumProvider } from 'types/web3';

declare global {
    declare type NextPageProps = NextPage & {
        Layout?: typeof Layout;
    };

    interface Window {
        ethereum?: EthereumProvider;
        web3?: Record<string, unknown>;
        __PRELOADED_STATE__: any;
    }
}

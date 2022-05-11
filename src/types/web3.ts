export interface EthereumProvider {
    isMetaMask?: true;
    isTrust?: true;
    providers?: any[];
    autoRefreshOnNetworkChange?: boolean;
    request?: (...args: any[]) => Promise<void>;
}

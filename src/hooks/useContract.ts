import { useEffect, useMemo, useState } from 'react';

import type { ContractKit } from '@celo/contractkit';
import { useContractKit } from '@celo-tools/use-contractkit';
import type { ContractOptions } from 'web3-eth-contract';

import { useNotify } from 'components/base/notify/hooks';

export default function useContract<T>(abi: any, address: string, options?: ContractOptions): T | null {
    const { openNotify } = useNotify();

    const { getConnectedKit } = useContractKit();

    const [contractKit, setContractKit] = useState<ContractKit | null>(null);

    useEffect(() => {
        async function getKit() {
            const kit = await getConnectedKit();
            setContractKit(kit);
        }

        getKit();
    }, [getConnectedKit]);

    return useMemo(() => {
        if (!abi || !address || !contractKit) return null;

        try {
            return new contractKit.web3.eth.Contract(abi, address, options) as unknown as T; // workaround for type inference
        } catch (error) {
            openNotify({ message: `Failed to get contract ${address}`, type: 'error' });
            return null;
        }
    }, [abi, address, contractKit, openNotify, options]);
}

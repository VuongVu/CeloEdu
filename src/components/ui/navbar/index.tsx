import { memo, useCallback, useContext, useEffect, useState } from 'react';
import Image from 'next/image';

import { useContractKit } from '@celo-tools/use-contractkit';

import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useNotify } from 'components/base/notify/hooks';
import getErrorMessage from 'utils/getErrorMessage';
import { ColorModeContext } from 'utils/theme';
import { ERC20_DECIMALS } from 'constants/web3';

function Navbar(): JSX.Element {
    const { openNotify } = useNotify();

    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const [cUSDBalance, setCUSDBalance] = useState(0);

    const { address, account, connect, destroy, getConnectedKit } = useContractKit();

    const handleConnectCelo = useCallback(() => {
        connect().catch(error => {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        });
    }, [connect, openNotify]);

    const getAccountBalance = useCallback(async () => {
        try {
            const kit = await getConnectedKit();
            const accounts = await kit.web3.eth.getAccounts();
            kit.defaultAccount = accounts[0];

            const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
            const cUSD = totalBalance.cUSD?.shiftedBy(-ERC20_DECIMALS).toFixed(2);

            cUSD && setCUSDBalance(+cUSD);
        } catch (error) {
            openNotify({ message: getErrorMessage(error), type: 'error' });
        }
    }, [getConnectedKit, openNotify]);

    useEffect(() => {
        if (account) {
            getAccountBalance();
        }
    }, [account, connect, getAccountBalance, openNotify]);

    return (
        <Box>
            <AppBar position="fixed" color="transparent">
                <Container maxWidth="lg">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            CELO Edu
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                                {theme.palette.mode === 'dark' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                            </IconButton>

                            {address ? (
                                <>
                                    <Chip
                                        label={`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                                        variant="outlined"
                                        onDelete={destroy}
                                        deleteIcon={<LogoutOutlinedIcon />}
                                    />
                                    <Chip label={`${cUSDBalance} CUSD`} variant="outlined" />
                                </>
                            ) : (
                                <IconButton onClick={handleConnectCelo} color="inherit">
                                    <Image src="/images/celo-icon.svg" width={24} height={24} alt="Celo icon" />
                                </IconButton>
                            )}
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>
        </Box>
    );
}

export default memo(Navbar);

import { memo } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

function Footer(): JSX.Element {
    return (
        <Box component="footer" sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="body2" color="text.secondary" align="center">
                    {`Copyright © Vuong Vu ${new Date().getFullYear()}`}
                </Typography>
            </Container>
        </Box>
    );
}

export default memo(Footer);

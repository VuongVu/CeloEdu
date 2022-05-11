import { memo, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Navbar from 'components/ui/navbar';
import Footer from 'components/ui/footer';

interface LayoutProps {
    children: ReactNode;
}

function Layout({ children }: LayoutProps): JSX.Element {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />

            <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
                    {children}
                </Container>
            </Box>

            <Footer />
        </Box>
    );
}

export default memo(Layout);

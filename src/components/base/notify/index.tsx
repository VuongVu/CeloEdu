import MuiSnackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grow from '@mui/material/Grow';

import { useAppSelector } from 'store';

import { useNotify } from './hooks';

const FIVE_SECONDS = 5000;

export default function Snackbar() {
    const { open, type, message } = useAppSelector(state => state.appNotify);

    const { closeNotify } = useNotify();

    const handleClose = () => {
        closeNotify();
    };

    return (
        <MuiSnackbar
            open={open}
            message={!type && message}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={FIVE_SECONDS}
            TransitionComponent={Grow}
            onClose={handleClose}>
            {type && (
                <Alert severity={type} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            )}
        </MuiSnackbar>
    );
}

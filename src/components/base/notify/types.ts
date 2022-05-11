import type { ReactNode } from 'react';

import type { AlertColor } from '@mui/material';

export interface AppNotifyState {
    open: boolean;
    message: string | ReactNode;
    type?: AlertColor;
}

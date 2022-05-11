import { createContext } from 'react';

import type { PaletteMode, ThemeOptions } from '@mui/material';
import { grey, common } from '@mui/material/colors';

export function getDesignSystem(mode: PaletteMode): ThemeOptions {
    return {
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                      background: {
                          default: grey[100],
                      },
                      text: {
                          primary: common.black,
                      },
                  }
                : {
                      background: {
                          default: '#111827',
                      },
                      text: {
                          primary: common.white,
                      },
                  }),
        },
    };
}

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

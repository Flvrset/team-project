import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4caf50',      // Green - friendly and represents care
            light: '#80e27e',
            dark: '#087f23',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ff9800',      // Orange - warm and inviting
            light: '#ffc947',
            dark: '#c66900',
            contrastText: '#000000',
        },
        background: {
            default: '#f9f9f9',
            paper: '#ffffff',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        h2: {
            fontWeight: 500,
        },
        h4: {
            fontWeight: 500,
        },
    },
});

export default theme;
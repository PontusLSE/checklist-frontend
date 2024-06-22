import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import Checklist from './components/Checklist';

const theme = createTheme({
  palette: {
    primary: {
      main: '#006D74', // Blåviken
    },
    secondary: {
      main: '#FA9F1C', // Mandarin
    },
    background: {
      default: '#FEFCF4', // Snöstig
    },
    text: {
      primary: '#33343C', // Kol
      secondary: '#907B62', // Manchester
    },
  },
  typography: {
    fontFamily: 'IBM Plex Sans, IBM Plex Mono, sans-serif',
    h1: {
      fontFamily: 'IBM Plex Sans',
    },
    h2: {
      fontFamily: 'IBM Plex Sans',
    },
    h3: {
      fontFamily: 'IBM Plex Sans',
    },
    h4: {
      fontFamily: 'IBM Plex Sans',
    },
    h5: {
      fontFamily: 'IBM Plex Sans',
    },
    h6: {
      fontFamily: 'IBM Plex Sans',
    },
    body1: {
      fontFamily: 'IBM Plex Sans',
    },
    body2: {
      fontFamily: 'IBM Plex Sans',
    },
    button: {
      fontFamily: 'IBM Plex Sans',
    },
    caption: {
      fontFamily: 'IBM Plex Mono',
    },
    overline: {
      fontFamily: 'IBM Plex Mono',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checklist/:id" element={<Checklist />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

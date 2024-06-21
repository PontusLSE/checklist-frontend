import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import Home from './components/Home';
import Checklist from './components/Checklist';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Container>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/checklist/:id" component={Checklist} />
        </Switch>
      </Container>
    </Router>
  );
}

export default App;
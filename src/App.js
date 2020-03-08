import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

// Components
import Navbar from './components/navbar.component';

// Pages
import Home from './pages/home.component';
import Register from './pages/register.component';
import Login from './pages/login.component';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#7986cb',
      main: '#3f51b5',
      dark: '#303f9f',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff4081',
      main: '#f50057',
      dark: '#c51162',
      contrastText: '#fff'
    }
  },
  typography: {
    useNextVariants: true
  }
});

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <Router>
          <Navbar/>
          <div className="container">
            <Switch>

              <Route path="/" exact component={Home} />
              <Route path="/register" exact component={Register} />
              <Route path="/login" exact component={Login} />
              {/* <Route path="/user" component={CreateUser} /> */}

            </Switch>
          </div>
        </Router>
      </div>
    </MuiThemeProvider>

  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

// Redux
import { Provider } from 'react-redux';
import store from './redux/store';
// import { SET_AUTHENTICATED } from './redux/types';
// import { logoutUser, getUserData } from './redux/actions/userActions';

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
      <Provider store={store}>
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
      </Provider>

    </MuiThemeProvider>

  );
}

export default App;

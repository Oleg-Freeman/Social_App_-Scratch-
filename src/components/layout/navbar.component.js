import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import MyButton from '../../util/MyButton';
// import NewPost from '../scream/PostScream';

// MUI stuff
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
// Icons
import HomeIcon from '@material-ui/icons/Home';

export default class Navbar extends Component {
  render() {
    const isAuthenticated = window.localStorage.getItem('token');

    return (
      <AppBar position="fixed">
        <Toolbar className="nav-container">
          {isAuthenticated ? (
            <Fragment>
              {/* <NewPost /> */}
              <Link to="/">
                <MyButton tip="Home">
                  <HomeIcon />
                </MyButton>
              </Link>
              {/* <Notifications /> */}
            </Fragment>
          ) : (
            <Fragment>
              <Button color="inherit" component={Link} to="/">Home</Button>
              <Button color="inherit" component={Link} to="login">Login</Button>
              <Button color="inherit" component={Link} to="register">Register</Button>
            </Fragment>
          )}

        </Toolbar>
      </AppBar>
    );
  }
}

import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
import AppIcon from '../images/icon.png';
import axios from 'axios';

// MUI Stuff
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
  form: {
    textAlign: 'center'
  },
  image: {
    margin: '10px auto 5px auto',
    height: 50
  },
  pageTitle: {
    margin: '5px auto 10px auto'
  },
  textField: {
    margin: '10px auto 10px auto'
  },
  button: {
    marginTop: 20,
    position: 'relative'
  },
  customError: {
    color: 'red',
    fontSize: '1rem',
    marginTop: 10
  },
  progress: {
    position: 'absolute'
  }
});

class Register extends Component {
  constructor() {
    super();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      email: '',
      password: '',
      password2: '',
      userName: '',
      errors: []
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      loading: true
    });

    const userData = {
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2,
      userName: this.state.userName
    };

    axios.post('http://localhost:5000/users/register', userData)
      .then(res => {
        this.setState({
          loading: false
        });
        this.props.history.push('/login');
      }).catch(err => {
        this.setState({
          errors: [
            err.response.data.email,
            err.response.data.password,
            err.response.data.password2,
            err.response.data.userName,
            err.response.data.message
          ],
          loading: false
        });
        console.log(this.state.errors);
      });
  };

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  render() {
    const { classes } = this.props;
    const { errors, loading } = this.state;
    return (
      <Grid container className={classes.form}>
        <Grid item sm />
        <Grid item sm>
          <img src={AppIcon} alt="lambda" className={classes.image} />
          <Typography variant="h2" className={classes.pageTitle}>
          Register
          </Typography>
          <form noValidate onSubmit={this.handleSubmit}>
            <TextField
              id="email"
              name="email"
              type="email"
              label="Email"
              className={classes.textField}
              helperText={errors[0]}
              error={!!errors[0]}
              value={this.state.email}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              className={classes.textField}
              helperText={errors[1]}
              error={!!errors[1]}
              value={this.state.password}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              id="password2"
              name="password2"
              type="password"
              label="Confirm Password"
              className={classes.textField}
              helperText={errors[2]}
              error={!!errors[2]}
              value={this.state.password2}
              onChange={this.handleChange}
              fullWidth
            />
            <TextField
              id="userName"
              name="userName"
              type="text"
              label="User Name"
              className={classes.textField}
              helperText={errors[3]}
              error={!!errors[3]}
              value={this.state.userName}
              onChange={this.handleChange}
              fullWidth
            />
            <Typography variant="body2" className={classes.customError}>
              {this.state.errors[4]}
            </Typography>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
              disabled={loading}
            >
            Register
              {loading && (
                <CircularProgress size={30} className={classes.progress} />
              )}
            </Button>
          </form>
        </Grid>
        <Grid item sm />
      </Grid>
    );
  }
}
Register.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object
  // loginUser: PropTypes.func.isRequired,
  // user: PropTypes.object.isRequired,
  // UI: PropTypes.object.isRequired
};

export default withStyles(styles)(Register);

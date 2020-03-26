import {
  SET_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  LOADING_UI,
  // SET_UNAUTHENTICATED,
  // SET_AUTHENTICATED,
  LOADING_USER
  // MARK_NOTIFICATIONS_READ
} from '../types';
import axios from 'axios';
// import Cookies from 'js-cookies';

export const loginUser = (userData, history) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios.post('http://localhost:5000/users/login', userData)
    .then(res => {
      if (res.data.authenticated) {
        dispatch({ type: CLEAR_ERRORS });
        // dispatch({ type: SET_AUTHENTICATED });
        history.push('/');
      }
      else {
        dispatch({ type: CLEAR_ERRORS });
        window.localStorage.setItem('token', res.data); // JSON.stringify(res.data._id)
        // console.log(currentUser);
        // dispatch({ type: SET_AUTHENTICATED });
        dispatch({
          type: SET_USER,
          payload: res.data
        });
        history.push('/');
      }
    }).catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};

export const registerUser = (newUserData, history) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios.post('http://localhost:5000/users/register', newUserData)
    .then((res) => {
    //   setAuthorizationHeader(res.data.token);
      // dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      history.push('/login');
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};

export const logoutUser = (history) => () => {
  // console.log('token', token);
  const token = window.localStorage.getItem('token');
  axios.get(`http://localhost:5000/users/logout/${token.replace(/['"]+/g, '')}`)
    .then(res => {
      console.log(res.data);
      if (res.data.notAuthenticated) {
        window.localStorage.removeItem('token');
        history.push('/login');
      }
      if (res.data.loggedOut) {
      // dispatch({ type: SET_UNAUTHENTICATED });
        window.localStorage.removeItem('token');
        console.log('Logged out');
        // history.push('/');
        window.location.reload();
      }
    })
    .catch(err => {
      console.log(err);
    });
};

export const getUserData = (userId) => (dispatch) => {
  dispatch({ type: LOADING_USER });
  // console.log('userId', userId.replace(/['"]+/g, ''));
  if (userId) {
    axios
      .get(`http://localhost:5000/users/${userId.replace(/['"]+/g, '')}`)
      .then((res) => {
        dispatch({
          type: SET_USER,
          payload: res.data
        });
      })
      .catch((err) => console.log(err));
  }
  else {
    dispatch({
      type: SET_USER,
      payload: ''
    });
  }
};

export const uploadImage = (formData) => (dispatch) => {
  dispatch({ type: LOADING_USER });
  const token = window.localStorage.getItem('token');
  axios({
    method: 'post',
    url: 'http://localhost:5000/users/image',
    data: formData,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then(() => {
      // dispatch(getUserData());
      window.location.reload();
    })
    .catch((err) => console.log(err));
};

// export const editUserDetails = (userDetails) => (dispatch) => {
//   dispatch({ type: LOADING_USER });
//   axios
//     .post('/user', userDetails)
//     .then(() => {
//       dispatch(getUserData());
//     })
//     .catch((err) => console.log(err));
// };

// export const markNotificationsRead = (notificationIds) => (dispatch) => {
//   axios
//     .post('/notifications', notificationIds)
//     .then((res) => {
//       dispatch({
//         type: MARK_NOTIFICATIONS_READ
//       });
//     })
//     .catch((err) => console.log(err));
// };

// const setAuthorizationHeader = (token) => {
//   const FBIdToken = `Bearer ${token}`;
//   localStorage.setItem('FBIdToken', FBIdToken);
//   axios.defaults.headers.common.Authorization = FBIdToken;
// };

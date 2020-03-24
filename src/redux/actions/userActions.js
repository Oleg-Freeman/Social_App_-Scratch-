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
        window.localStorage.setItem('session_token', res.data); // JSON.stringify(res.data._id)
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

export const logoutUser = (history) => (dispatch) => {
  axios.get('http://localhost:5000/users/logout')
    .then(res => {
      if (!res.data.authenticated) {
        window.localStorage.removeItem('session_token');
        history.push('/login');
      }
      else {
      // dispatch({ type: SET_UNAUTHENTICATED });
        window.localStorage.removeItem('session_token');
        console.log('Logged out');
        history.push('/');
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

export const uploadImage = (formData) => (dispatch, getState) => {
  dispatch({ type: LOADING_USER });
  const state = getState();
  console.log('state', state.user.user);
  axios({
    method: 'post',
    url: 'http://localhost:5000/users/image',
    data: 'Hello',
    headers: { user: 'userId' }
  })
    .then(() => {
      dispatch(getUserData());
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

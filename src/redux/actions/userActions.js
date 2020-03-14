import {
  SET_USER,
  SET_ERRORS,
  CLEAR_ERRORS,
  LOADING_UI,
  //   SET_UNAUTHENTICATED,
  LOADING_USER
  // MARK_NOTIFICATIONS_READ
} from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios.post('http://localhost:5000/users/login', userData)
    .then(res => {
      // console.log('Login Data');
      // console.log(res.data);
      // dispatch(getUserData());
      dispatch({ type: CLEAR_ERRORS });
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      history.push('/');
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

// export const logoutUser = () => (dispatch) => {
//   localStorage.removeItem('FBIdToken');
//   delete axios.defaults.headers.common.Authorization;
//   dispatch({ type: SET_UNAUTHENTICATED });
// };

export const getUserData = (userId) => (dispatch) => {
  dispatch({ type: LOADING_USER });
  axios
    // .get('http://localhost:5000/users/')
    .get(`http://localhost:5000/users/${userId}`)
    .then((res) => {
      console.log('User Data');
      console.log(res.data);
      dispatch({
        type: SET_USER,
        payload: res.data
      });
    })
    .catch((err) => console.log(err));
};

// export const uploadImage = (formData) => (dispatch) => {
//   dispatch({ type: LOADING_USER });
//   axios
//     .post('/user/image', formData)
//     .then(() => {
//       dispatch(getUserData());
//     })
//     .catch((err) => console.log(err));
// };

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

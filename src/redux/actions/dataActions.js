import {
  SET_POSTS,
  LOADING_DATA,
  LIKE_POST,
  UNLIKE_POST,
  DELETE_POST,
  SET_ERRORS,
  ADD_POST,
  CLEAR_ERRORS,
  LOADING_UI,
  SET_POST,
  STOP_LOADING_UI,
  SUBMIT_COMMENT
} from '../types';
import axios from 'axios';

// Get all posts
export const getPosts = () => (dispatch) => {
  // console.log('data action getPosts()');
  dispatch({ type: LOADING_DATA });
  axios
    .get('http://localhost:5000/posts')
    .then((res) => {
      // console.log('retrived posts: ');
      // console.log(res.data);
      dispatch({
        type: SET_POSTS,
        payload: res.data
      });
    })
    .catch((err) => {
      dispatch({
        type: SET_POSTS,
        payload: []
      });
      console.log(err);
    });
};
export const getPost = (postId) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`/scream/${postId}`)
    .then((res) => {
      dispatch({
        type: SET_POST,
        payload: res.data
      });
      dispatch({ type: STOP_LOADING_UI });
    })
    .catch((err) => console.log(err));
};
  // Add post
export const addPost = (newPost) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .post('/scream', newPost)
    .then((res) => {
      dispatch({
        type: ADD_POST,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
  // Like a post
export const likePost = (postId) => (dispatch) => {
  axios
    .get(`/scream/${postId}/like`)
    .then((res) => {
      dispatch({
        type: LIKE_POST,
        payload: res.data
      });
    })
    .catch((err) => console.log(err));
};
  // Unlike a post
export const unlikePost = (postId) => (dispatch) => {
  axios
    .get(`/scream/${postId}/unlike`)
    .then((res) => {
      dispatch({
        type: UNLIKE_POST,
        payload: res.data
      });
    })
    .catch((err) => console.log(err));
};
  // Submit a comment
export const submitComment = (postId, commentData) => (dispatch) => {
  axios
    .post(`/scream/${postId}/comment`, commentData)
    .then((res) => {
      dispatch({
        type: SUBMIT_COMMENT,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
export const deletePost = (postId) => (dispatch) => {
  axios
    .delete(`/scream/${postId}`)
    .then(() => {
      dispatch({ type: DELETE_POST, payload: postId });
    })
    .catch((err) => console.log(err));
};

export const getUserData = (userNeme) => (dispatch) => {
  dispatch({ type: LOADING_DATA });
  axios
    .get(`/user/${userNeme}`)
    .then((res) => {
      dispatch({
        type: SET_POSTS,
        payload: res.data.screams
      });
    })
    .catch(() => {
      dispatch({
        type: SET_POSTS,
        payload: null
      });
    });
};

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};

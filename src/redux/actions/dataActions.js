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
  ADD_COMMENT,
  DELETE_COMMENT
} from '../types';
import axios from 'axios';

// Get all posts
export const getPosts = () => (dispatch) => {
  // console.log('data action getPosts()');
  dispatch({ type: LOADING_DATA });
  axios
    .get('http://localhost:5000/posts')
    .then((res) => {
      // console.log('retrived posts: ', res.data);
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
// Get one post
export const getPost = (postId) => (dispatch) => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`http://localhost:5000/posts/${postId}`)
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
  const token = window.localStorage.getItem('token');
  axios({
    method: 'post',
    url: 'http://localhost:5000/posts/add/',
    data: newPost,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then((res) => {
      dispatch({
        type: ADD_POST,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch((err) => {
      // console.log('Not valid body', err.response.data);
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
  // Like a post
export const likePost = (postId) => (dispatch) => {
  const token = window.localStorage.getItem('token');
  axios({
    method: 'get',
    url: `http://localhost:5000/likes/add/${postId}`,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then((res) => {
      // console.log('like post');
      // dispatch(getPosts());
      dispatch({
        type: LIKE_POST,
        payload: res.data
      });
    })
    .catch((err) => console.log(err));
};
  // Unlike a post
export const unlikePost = (postId) => (dispatch) => {
  const token = window.localStorage.getItem('token');
  axios({
    method: 'delete',
    url: `http://localhost:5000/likes/${postId}`,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then((res) => {
      // console.log('Unlike post');
      // dispatch(getPosts());
      dispatch({
        type: UNLIKE_POST,
        payload: {
          postId: postId,
          unlikeId: res.data
        }
      });
    })
    .catch((err) => console.log(err));
};
  // Add comment
export const addComment = (postId, commentData) => (dispatch) => {
  const token = window.localStorage.getItem('token');
  axios({
    method: 'post',
    url: `http://localhost:5000/comments/add/${postId}`,
    data: commentData,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then((res) => {
      dispatch({
        type: ADD_COMMENT,
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
// Delete comment
export const deleteComment = (commentId, postId) => (dispatch) => {
  const token = window.localStorage.getItem('token');
  axios({
    method: 'delete',
    url: `http://localhost:5000/comments/${commentId}`,
    headers: { token: token.replace(/['"]+/g, '') }
  })
    .then(() => {
      dispatch({
        type: DELETE_COMMENT,
        payload: {
          postId: postId,
          commentId: commentId
        }
      });
    })
    .catch((err) => console.log(err));
};
// Delete post
export const deletePost = (postId) => (dispatch) => {
  const token = window.localStorage.getItem('token');
  axios({
    method: 'delete',
    url: `http://localhost:5000/posts/${postId}`,
    headers: { token: token.replace(/['"]+/g, '') }
  })
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

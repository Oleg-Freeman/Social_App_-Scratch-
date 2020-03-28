import {
  SET_POST,
  // LIKE_POST,
  // UNLIKE_POST,
  LOADING_DATA,
  //   DELETE_POSTS,
  ADD_POST,
  SET_POSTS,
  ADD_COMMENT,
  LIKE_POST,
  UNLIKE_POST,
  DELETE_POST,
  DELETE_COMMENT
} from '../types';

const initialState = {
  posts: [],
  post: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA:
      return {
        ...state,
        loading: true
      };
    case SET_POSTS: {
      // console.log('data reduser: ', state.posts);
      return {
        ...state,
        posts: action.payload,
        loading: false
      };
    }
    case SET_POST:
      return {
        ...state,
        post: action.payload
      };
    case LIKE_POST: {
      // console.log('action.payload', action.payload);
      const index = state.posts.findIndex(
        (post) => post._id === action.payload.postId
      );
      state.posts[index].likeCount = ++state.posts[index].likeCount;
      state.posts[index].likes.unshift(action.payload);

      state.post.likeCount = ++state.post.likeCount;
      state.post.likes.unshift(action.payload);
      // console.log('likes', state.posts[index].likes);
      // console.log('like post', state.post);
      return {
        ...state
      };
    }
    case UNLIKE_POST: {
      // console.log('_id1', state.posts[0]._id);
      // console.log('_id2', action.payload.postId);
      const index = state.posts.findIndex(
        (post) => post._id === action.payload.postId
      );
      // console.log('index?', index);
      state.posts[index].likeCount = --state.posts[index].likeCount;
      state.post.likeCount = --state.post.likeCount;
      const unlikeIndex = state.posts[index].likes.findIndex(
        (like) => like._id === action.payload.unlikeId
      );
      state.posts[index].likes.splice(unlikeIndex, 1);
      state.post.likes.splice(unlikeIndex, 1);
      // console.log('likes', state.posts[index].likes);
      // console.log('like post', state.post);
      return {
        ...state
      };
    }
    case DELETE_POST: {
      const index = state.posts.findIndex(
        (post) => post._id === action.payload
      );
      state.posts.splice(index, 1);
      return {
        ...state
      };
    }
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      };
    case ADD_COMMENT: {
      const index = state.posts.findIndex(
        (post) => post._id === action.payload.postId
      );
      state.posts[index].commentCount = ++state.posts[index].commentCount;
      state.post.commentCount = ++state.post.commentCount;
      return {
        ...state,
        post: {
          ...state.post,
          comments: [action.payload, ...state.post.comments]
        }
      };
    }
    case DELETE_COMMENT: {
      const postIndex = state.posts.findIndex(
        (post) => post._id === action.payload.postId
      );
      // console.log('postIndex', postIndex);
      const commentIndex = state.posts[postIndex].comments.findIndex(
        (comment) => comment._id === action.payload.commentId
      );
      // console.log('commentIndex', commentIndex);
      state.posts[postIndex].comments.splice(commentIndex, 1);
      state.posts[postIndex].commentCount = --state.posts[postIndex].commentCount;
      state.post.comments.splice(commentIndex, 1);
      state.post.commentCount = --state.post.commentCount;
      return {
        ...state
      };
    }
    default:
      return state;
  }
}

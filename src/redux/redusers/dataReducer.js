import {
  SET_POST,
  // LIKE_POST,
  // UNLIKE_POST,
  LOADING_DATA,
  //   DELETE_POSTS,
  ADD_POST,
  SET_POSTS,
  SUBMIT_COMMENT,
  LIKE_POST,
  UNLIKE_POST
//   DELETE_POST
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
      // console.log('likes', state.posts[index].likes);
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
      const unlikeIndex = state.posts[index].likes.findIndex(
        (like) => like._id === action.payload.unlikeId
      );
      // console.log('unlikeIndex', unlikeIndex);
      // console.log('unlikeId', action.payload.unlikeId);
      state.posts[index].likes.splice(unlikeIndex, 1);
      // console.log('likes', state.posts[index].likes);
      return {
        ...state
      };
    }
    // case DELETE_POST:
    //   index = state.screams.findIndex(
    //     (scream) => scream.screamId === action.payload
    //   );
    //   state.screams.splice(index, 1);
    //   return {
    //     ...state
    //   };
    case ADD_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      };
    case SUBMIT_COMMENT:
      return {
        ...state,
        post: {
          ...state.post,
          comments: [action.payload, ...state.post.comments]
        }
      };
    default:
      return state;
  }
}

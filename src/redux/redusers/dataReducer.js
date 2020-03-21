import {
  SET_POST,
  //   LIKE_POSTS,
  //   UNLIKE_POSTS,
  LOADING_DATA,
  //   DELETE_POSTS,
  ADD_POST,
  SET_POSTS,
  SUBMIT_COMMENT
//   LIKE_POST,
//   UNLIKE_POST,
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
    //   state.posts.push(action.payload);
      // console.log('action payload');
      // console.log(action.payload);
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
    // case LIKE_POST:
    // case UNLIKE_POST: {
    //   const index = state.posts.findIndex(
    //     (post) => post.postId === action.payload.postId
    //   );
    //   state.posts[index] = action.payload;
    //   if (state.post.postId === action.payload.postId) {
    //     state.post = action.payload;
    //   }
    //   return {
    //     ...state
    //   };
    // }
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

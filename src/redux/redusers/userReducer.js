import {
  SET_USER,
  SET_AUTHENTICATED,
  SET_UNAUTHENTICATED,
  LOADING_USER,
  // LIKE_POST,
  // UNLIKE_POST
  MARK_NOTIFICATIONS_READ,
  GET_USER_NOTIFICATIONS
} from '../types';

const initialState = {
  authenticated: false,
  loading: false,
  credentials: {},
  // likes: [],
  notifications: [],
  userId: 'testId'
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        authenticated: true
      };
    case SET_UNAUTHENTICATED:
      return initialState;
    case SET_USER:
      return {
        authenticated: true,
        loading: false,
        credentials: { ...action.payload }
      };
    case LOADING_USER:
      return {
        ...state,
        loading: true
      };
    // case LIKE_POST:
    //   return {
    //     ...state,
    //     likes: [
    //       ...state.likes,
    //       {
    //         userHandle: state.credentials.handle,
    //         postId: action.payload.postId
    //       }
    //     ]
    //   };
    // case UNLIKE_POST:
    //   return {
    //     ...state,
    //     likes: state.likes.filter(
    //       (like) => like.postId !== action.payload.postId
    //     )
    //   };
    case GET_USER_NOTIFICATIONS: {
      // console.log(action.payload);
      // state.notifications = [...action.payload];
      // action.payload.forEach((not) => (state.notifications.push(not)));
      state.notifications.push({ test: 'test' });
      // console.log(state.notifications);
      return {
        ...state
      };
    }
    case MARK_NOTIFICATIONS_READ: {
      console.log('state.notifications', state.notifications);
      state.notifications.forEach((not) => (not.read = true));
      return {
        ...state
      };
    }
    default:
      return state;
  }
}

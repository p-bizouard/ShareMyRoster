import { SET_ROSTER_KEY, SET_ROSTER_JSON, SET_ROSTER_TYPE } from '../constants';

export default function roster(state = null, action) {
  switch (action.type) {
    case SET_ROSTER_KEY:
      return {
        ...state,
        key: action.payload.key,
      };
    case SET_ROSTER_JSON:
      return {
        ...state,
        json: action.payload.json,
      };
    case SET_ROSTER_TYPE:
      return {
        ...state,
        type: action.payload.type,
      };
    default:
      return state;
  }
}

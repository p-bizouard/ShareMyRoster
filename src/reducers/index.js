import { combineReducers } from 'redux';
import user from './user';
import runtime from './runtime';
import intl from './intl';
import roster from './roster';

export default combineReducers({
  user,
  runtime,
  roster,
  intl,
});

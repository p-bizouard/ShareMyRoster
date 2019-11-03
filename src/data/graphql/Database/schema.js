import { merge } from 'lodash';

/** * Queries ** */
// import {
//   schema as GetAllUsers,
//   queries as GetAllUsersQueries,
//   resolvers as GetAllUsersResolver,
// } from './users/GetAllUsers';
// import {
//   queries as GetLoggedInUserQueries,
//   resolvers as GetLoggedInUserResolver,
// } from './users/GetLoggedInUser';
import {
  schema as GetRosters,
  queries as GetRostersQueries,
  resolvers as GetRostersResolver,
} from './rosters/GetRosters';

/** * Mutations ** */
// import {
//   schema as CreateUserInput,
//   mutation as CreateUser,
//   resolvers as CreateUserResolver,
// } from './users/CreateUser';
import {
  schema as CreateRosterInput,
  mutation as CreateRoster,
  resolvers as CreateRosterResolver,
} from './rosters/CreateRoster';

// export const schema = [...GetAllUsers, ...CreateUserInput, ...GetRosters, ...CreateRosterInput];

// export const queries = [...GetAllUsersQueries, ...GetLoggedInUserQueries, ...GetRostersQueries];

// export const mutations = [...CreateUser, ...CreateRoster];

// export const resolvers = merge(
//   GetAllUsersResolver,
//   GetLoggedInUserResolver,
//   CreateUserResolver,
//   CreateRosterResolver,
//   GetRostersResolver,
// );

export const schema = [...GetRosters, ...CreateRosterInput];

export const queries = [...GetRostersQueries];

export const mutations = [...CreateRoster];

export const resolvers = merge(CreateRosterResolver, GetRostersResolver);

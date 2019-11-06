import { merge } from 'lodash';

/** * Queries ** */
import {
  schema as GetRosters,
  queries as GetRostersQueries,
  resolvers as GetRostersResolver,
} from './rosters/GetRosters';

/** * Mutations ** */
import {
  schema as CreateRosterInput,
  mutation as CreateRoster,
  resolvers as CreateRosterResolver,
} from './rosters/CreateRoster';

export const schema = [...GetRosters, ...CreateRosterInput];

export const queries = [...GetRostersQueries];

export const mutations = [...CreateRoster];

export const resolvers = merge(CreateRosterResolver, GetRostersResolver);

import { Roster } from 'data/models';

export const schema = [
  `
  # A roster stored in the local database
  type DatabaseRoster {
    id: String
    key: String
    rosz: String
    updatedAt: String
    createdAt: String
  }
`,
];

export const queries = [
  `
  # Retrieves all rosters stored in the local database
  # databaseGetAllRoster: [DatabaseRoster]

  # Retrieves a single roster from the local database
  databaseGetRoster(
    # The roster's email address
    key: String!
  ): DatabaseRoster
`,
];

export const resolvers = {
  Query: {
    // async databaseGetAllRosters() {
    //   const rosters = await Roster.findAll({
    //     include: [
    //       { model: RosterLogin, as: 'logins' },
    //       { model: RosterClaim, as: 'claims' },
    //       { model: RosterProfile, as: 'profile' },
    //     ],
    //   });
    //   return rosters;
    // },
    async databaseGetRoster(parent, { key }) {
      const roster = await Roster.findOne({
        where: { key },
      });
      return roster;
    },
  },
};

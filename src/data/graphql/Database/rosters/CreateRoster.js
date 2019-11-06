import { Roster } from 'data/models';

export const schema = [
  `
`,
];

export const mutation = [
  `
  # Creates a new user and profile in the local database
  databaseCreateRoster(
    # The email of the new user, this email must be unique in the database
    rosz: String!
  ): DatabaseRoster
`,
];

export const resolvers = {
  Mutation: {
    async databaseCreateRoster(parent, args) {
      let key = '';
      let exitCondition = true;
      while (exitCondition) {
        key = Math.random()
          .toString(36)
          .substring(2, 15);

        // eslint-disable-next-line no-await-in-loop
        exitCondition = await Roster.findOne({ where: { key } });
      }

      // Create new user with profile in database
      const roster = await Roster.create({
        key,
        rosz: args.rosz,
      });

      return roster;
    },
  },
};

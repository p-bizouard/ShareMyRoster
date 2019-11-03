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
      while (true) {
        key = Math.random()
          .toString(36)
          .substring(2, 15);

        // If user already exists, throw error
        const lookupRoster = await Roster.findOne({ where: { key } });

        if (!lookupRoster) {
          break;
        }
      }

      // var fs = require('fs');
      // var bitmap = new Buffer(args.rosz, 'base64');
      // // write buffer to file
      // fs.writeFileSync(file, bitmap);

      // Create new user with profile in database
      const roster = await Roster.create({
        key,
        rosz: args.rosz,
      });

      return roster;
    },
  },
};

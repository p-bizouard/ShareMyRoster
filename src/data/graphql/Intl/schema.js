/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
import fs from 'fs';
import { join } from 'path';
// import Promise from 'bluebird';
import glob from 'glob';
import { locales } from '../../../config';

export const schema = [
  `
  type IntlMessage {
    id: String!
    defaultMessage: String!
    message: String
    description: String
    files: [String]
  }
`,
];

export const queries = [
  `
  # Supported locales: "${locales.join('", "')}"
  intl(locale: String!): [IntlMessage]
`,
];

const MESSAGES_DIR = process.env.MESSAGES_DIR || join(__dirname, './messages');

// const readFileSync = Promise.promisify(fs.readFileSync);

export const resolvers = {
  Query: {
    async intl(parent, { locale }) {
      if (!locales.includes(locale)) {
        throw new Error(`Locale '${locale}' not supported`);
      }

      let localeData = [];
      try {
        const jsonFiles = await glob.sync(
          join(MESSAGES_DIR, `*${locale}.json`),
        );

        for (let i = 0; i < jsonFiles.length; i += 1)
          localeData = localeData.concat(
            // eslint-disable-next-line no-await-in-loop
            JSON.parse(fs.readFileSync(jsonFiles[i])),
          );

        const mdFiles = await glob.sync(join(MESSAGES_DIR, `*/*${locale}.md`));

        for (let i = 0; i < mdFiles.length; i += 1) {
          const messageId = mdFiles[i]
            .replace(`.${locale}.md`, '')
            .match(/.*\/cms\/(.*)/);

          localeData.push({
            id: `cms.${messageId[1]}`,
            // eslint-disable-next-line no-await-in-loop
            message: fs.readFileSync(mdFiles[i], 'utf8'),
          });

          // eslint-disable-next-line no-await-in-loop
          // localeData = localeData.concat(
          //   JSON.parse(await readFile(jsonFiles[i])),
          // );
          // console.log(localeData);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          throw new Error(`Locale '${locale}' not found`);
        }
      }
      return localeData;
    },
  },
};

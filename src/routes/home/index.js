/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import Layout from '../../components/Layout';
import Roster from '../../components/Roster/Roster';

async function action({ client, params }) {
  return {
    title: 'React Starter Kit',
    chunks: ['home'],
    component: (
      <Layout client={client} params={params}>
        <Roster />
      </Layout>
    ),
  };
}

export default action;

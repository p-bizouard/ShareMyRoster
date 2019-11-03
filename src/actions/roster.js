/* eslint-disable import/prefer-default-export */

import { SET_ROSTER_KEY, SET_ROSTER_JSON, SET_ROSTER_TYPE } from '../constants';
import queryGetRoster from './rosters.query.graphql';
import mutationSaveRoster from './rosters.mutation.graphql';
import xml2js from 'xml2js';

export function setRosterKey(key) {
  return async (dispatch, getState, { client, history }) => {
    dispatch({
      type: SET_ROSTER_KEY,
      payload: {
        key,
      },
    });
  };
}

export function initRosterFromKey(key) {
  return async (dispatch, getState, { client, history }) => {
    dispatch(setRosterKey(key));

    const { data } = await client.query({
      query: queryGetRoster,
      variables: { key },
    });

    const bitmap = new Buffer(data.databaseGetRoster.rosz, 'base64');

    const zipRosz = new File([bitmap], 'roster2.zip');
    zip.createReader(
      new zip.BlobReader(zipRosz),
      reader => {
        // get all entries from the zip
        reader.getEntries(entries => {
          if (entries.length) {
            entries[0].getData(
              new zip.TextWriter(),
              text => {
                const parser = new xml2js.Parser();

                parser.parseString(text, (err, result) => {
                  // console.log(JSON.stringify(result.roster, null, 2))

                  let gameSystemName = null;
                  if (result.roster.$.gameSystemName === 'Warhammer 40,000')
                    gameSystemName = '40K';
                  if (
                    result.roster.$.gameSystemName ===
                    'Warhammer 40,000: Kill Team (2018)'
                  )
                    gameSystemName = 'Kill Team';

                  dispatch(setRosterType(gameSystemName));
                  dispatch(setRosterJson(result.roster));
                });

                // close the zip reader
                reader.close(() => {
                  // onclose callback
                });
              },
              (current, total) => {
                // onprogress callback
              },
            );
          }
        });
      },
      error => {
        console.error(error);
        // onerror callback
      },
    );
  };
}

export function setRosterJson(json) {
  return async (dispatch, getState, { client, history }) => {
    dispatch({
      type: SET_ROSTER_JSON,
      payload: {
        json,
      },
    });
    if (!json) history.push(``);
  };
}

export function setRosterType(type) {
  return async (dispatch, getState, { client, history }) => {
    dispatch({
      type: SET_ROSTER_TYPE,
      payload: {
        type,
      },
    });
  };
}

export function saveRosterRosz(key) {
  return async (dispatch, getState, { client, history }) => {
    const { data } = await client.mutate({
      mutation: mutationSaveRoster,
      variables: { rosz: getState().runtime.rosz },
    });

    dispatch(setRosterKey(data.databaseCreateRoster.key));
  };
}

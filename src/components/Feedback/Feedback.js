/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { setRuntimeVariable } from '../../actions/runtime';

import s from './Feedback.css';
import Mailto from '../Mailto/Mailto';

class Feedback extends React.Component {
  static propTypes = {
    contactEmail: PropTypes.string.isRequired,
  };

  render() {
    const { contactEmail } = this.props;
    return (
      <div className={s.root}>
        <div className={s.container}>
          <Mailto
            email={contactEmail}
            headers={{ subject: 'Question about RosterViewer' }}
            obfuscate
          >
            <FormattedMessage
              id="layout.feedback"
              defaultMessage="Ask a question or report an issue"
            />
          </Mailto>
          {/* <span className={s.spacer}>|</span> */}
          {/* <a
            className={s.link}
            href="https://github.com/kriasoft/react-starter-kit/issues/new"
          >
            Report an issue
          </a> */}
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  contactEmail: state.runtime.contactEmail,
});
const mapDispatch = {
  setRuntimeVariable,
};

export default injectIntl(
  connect(mapState, mapDispatch)(withStyles(s)(Feedback)),
);

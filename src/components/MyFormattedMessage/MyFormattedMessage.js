/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';

class MyFormattedMessage extends React.Component {
  static formatLabel(label, value) {
    if (!value) {
      return label;
    }
    const split = label.split(value);
    return split.reduce((prev, current, i) => {
      if (!i) {
        return [current];
      }
      if (current.match(value)) return prev.concat(<b>{current}</b>);
      return prev.concat(current);
    }, []);
  }

  static propTypes = {
    prefix: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string,
    message: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
      .isRequired,
    join: PropTypes.string,
    intl: PropTypes.shape(intlShape),
  };

  static defaultProps = {
    defaultMessage: null,
    join: ', ',
    intl: {},
  };

  translateSingle(message) {
    const { intl } = this.props;

    let id = message;
    let suffix = '';
    const regexTest = message.match(/^(.*)(\s+D?[0-9]+)$/);

    if (regexTest) {
      id = regexTest[1].trim();
      suffix = ` ${regexTest[2].trim()}`;
    }

    const translated = intl.formatMessage({
      id: `${this.props.prefix}.${id}`,
      defaultMessage: message,
    });

    if (translated === message) {
      if (this.props.defaultMessage !== null) return this.props.defaultMessage;
      return message;
    }
    return translated + suffix;
  }

  render() {
    const regexTest = /((?:\s|'|"|\.|^)(?:phases? de )?(?:combat|(?:mouvement de )?charge|blessure(?: mortelle)?|touche|perd un PV|Sang-Froid|secouée|abjuration|sauvegarde invulnérable|déploiement|mouvement|avance|psychique|commandement|advance|wound|invulnerable|save|Psychic|deployment|Movement|Fight|hit roll|additional attack|slain|automatically hits|Leadership|once per battle)s*)/i;
    if (Array.isArray(this.props.message))
      return MyFormattedMessage.formatLabel(
        this.props.message
          .filter(n => n) // Remove nulls
          .map(message => this.translateSingle(message))
          .join(this.props.join),
        regexTest,
      );

    if (this.props.message === '') return '';
    return MyFormattedMessage.formatLabel(
      this.translateSingle(this.props.message),
      regexTest,
    );
  }
}

export default injectIntl(MyFormattedMessage);

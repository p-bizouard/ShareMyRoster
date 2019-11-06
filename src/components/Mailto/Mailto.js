// Based on https://github.com/jasonbellamy/react-mailto

import React from 'react';
import PropTypes from 'prop-types';

export const toSearchString = (searchParams = {}) =>
  Object.keys(searchParams)
    .map(key => `${key}=${encodeURIComponent(searchParams[key])}`)
    .join('&');

export const createMailtoLink = (email, headers) => {
  let link = `mailto:${email}`;
  if (headers) {
    link += `?${toSearchString(headers)}`;
  }
  return link;
};

class Mailto extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    email: PropTypes.string.isRequired,
    headers: PropTypes.shape({}),
    obfuscate: PropTypes.bool,
  };

  static defaultProps = {
    obfuscate: false,
    headers: {},
  };

  handleClick(event) {
    event.preventDefault();
    const { email, headers } = this.props;
    window.location.href = createMailtoLink(email, headers);
  }

  renderObfuscatedLink() {
    const { email, obfuscate, headers, children, ...others } = this.props;
    return (
      <a onClick={this.handleClick} href="mailto:obfuscated" {...others}>
        {children}
      </a>
    );
  }

  renderLink() {
    const { email, obfuscate, headers, children, ...others } = this.props;
    return (
      <a href={createMailtoLink(email, headers)} {...others}>
        {children}
      </a>
    );
  }

  render() {
    return this.props.obfuscate
      ? this.renderObfuscatedLink()
      : this.renderLink();
  }
}

export default Mailto;

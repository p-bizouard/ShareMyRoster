import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.isRequired,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

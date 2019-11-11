/* eslint-disable prettier/prettier */
import React from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import PropTypes from 'prop-types';

import { setRuntimeVariable } from '../../actions/runtime';
import s from './Roster.less';

import Force from './Force';

// App component - represents the whole app
class Roster extends React.Component {
  static propTypes = {
    printType: PropTypes.string,
    roster: PropTypes.shape({
      json: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    printType: '',
    roster: null,
  };

  constructor() {
    super();

    this.renderRoster = this.renderRoster.bind(this);
  }

  getRoster() {
    return this.props.roster ? this.props.roster.json : null;
  }

  renderRoster(showOnlyIds) {
    if (this.getRoster()) {
      const title = `${this.getRoster().$.name} (${
        this.getRoster().costs[0].cost
          ? `${this.getRoster().costs[0].cost[0].$.value} ${
              this.getRoster().costs[0].cost[0].$.name
            }`
          : ''
      }${
        this.getRoster().costs[1] && this.getRoster().costs[1].cost
          ? ` ${this.getRoster().costs[0].cost[1].$.value} ${
              this.getRoster().costs[0].cost[1].$.name
            }`
          : ''
      })`;

      return [
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta name="description" content="Check my roster" />
          <meta name="og:description" content="Check my roster" />
        </Helmet>,
        this.getRoster().forces[0].force.map((force, index) => (
          <Force
            key={force.$.id}
            force={force}
            index={index}
            rosterName={this.getRoster().$.name}
            cost={this.getRoster().costs[0].cost}
            showOnlyIds={showOnlyIds}
          />
        )),
      ];
    }
    return null;
  }

  renderModelsRecap(showOnlyIds) {
    if (this.getRoster())
      return (
        <div className="force mt-4 force-recap">
          <h2>
            <FormattedMessage
              id="DatasheetTemplate.sumary_detachment"
              defaultMessage="Summary by detachment"
            />
          </h2>
          <div className="accordion">
            <div className="card">
              <h4 className="card-header">
                <button
                  className="btn btn-link"
                  type="button"
                  data-toggle="collapse"
                  data-target={`#card-recap-${this.getRoster().$.id}`}
                  aria-expanded="true"
                  aria-controls={`card-recap-${this.getRoster().$.id}`}
                >
                  <FormattedMessage
                    id="DatasheetTemplate.sumary"
                    defaultMessage="Summary"
                  />
                </button>
              </h4>
              <div
                id={`card-recap-${this.getRoster().$.id}`}
                className="collapse show"
              >
                {this.getRoster().forces[0].force.map(
                  (force, index) => (
                    <Force
                      key={force.$.id}
                      force={force}
                      index={index}
                      rosterName={this.getRoster().$.name}
                      cost={this.getRoster().costs[0].cost}
                      recap="true"
                      showOnlyIds={showOnlyIds}
                    />
                  ),
                  this,
                )}
              </div>
            </div>
          </div>
        </div>
      );
    return null;
  }

  render() {
    const { printType } = this.props;
    const showOnlyIds = [];
    // const showOnlyIds = ['1816-2c28-ddaf-3ce2'];

    return (
      <div className="container">
        <div id="roster" className={printType}>
          {this.renderRoster(showOnlyIds)}
          {this.renderModelsRecap(showOnlyIds)}
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  roster: state.roster,
  printType: state.runtime.printType,
});

const mapDispatch = {
  setRuntimeVariable,
};

export default injectIntl(
  connect(mapState, mapDispatch)(withStyles(s)(Roster)),
);

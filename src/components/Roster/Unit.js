/* eslint-disable prettier/prettier */
import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import MyFormattedMessage from '../MyFormattedMessage';
import ErrorBoundary from '../ErrorBoundary';

import UnitCategories from './UnitCategories';
import UnitModelsTable from './UnitModelsTable';
import UnitAbilitiesTable from './UnitAbilitiesTable';
import UnitPsychicsTable from './UnitPsychicsTable';
import UnitWeaponsTable from './UnitWeaponsTable';

// eslint-disable-next-line no-unused-vars
const prettyHtml = require('json-pretty-html').default;

class Unit extends React.Component {
  static propTypes = {
    unit: PropTypes.shape({
      $: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }).isRequired,
      categories: PropTypes.array.isRequired,
      selections: PropTypes.array.isRequired,
    }).isRequired,
    rosterType: PropTypes.string,
    showOnlyIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  static defaultProps = {
    rosterType: '',
  };


  static getPoints(unit) {
    const costPts = unit.selections[0].selection.reduce(
      (tot, selection) =>
        tot +
        parseFloat(
          selection.costs[0].cost.find(cost => cost.$.name === 'pts').$.value,
        ),
      parseFloat(
        unit.costs[0].cost.find(cost => cost.$.name === 'pts').$.value,
      ),
    );
    const costPL = unit.selections[0].selection.reduce(
      (tot, selection) =>
        tot +
        parseFloat(
          selection.costs[0].cost.find(cost => cost.$.name === ' PL')
            ? selection.costs[0].cost.find(cost => cost.$.name === ' PL').$
              .value
            : 0,
        ),
      parseFloat(
        unit.costs[0].cost.find(cost => cost.$.name === ' PL')
          ? unit.costs[0].cost.find(cost => cost.$.name === ' PL').$.value
          : 0,
      ),
    );
    const costCP = unit.selections[0].selection.reduce((tot, selection) => {
      let totReturn = tot;
      totReturn += selection.costs[0].cost.find(cost => cost.$.name === 'CP')
        ? parseFloat(
          selection.costs[0].cost.find(cost => cost.$.name === 'CP').$.value,
        )
        : 0;
      if (selection.selections) {
        totReturn += selection.selections[0].selection.reduce((subtot, subselection) => subtot +
          (subselection.costs[0].cost.find(cost => cost.$.name === 'CP')
            ? parseFloat(
              subselection.costs[0].cost.find(cost => cost.$.name === 'CP').$
                .value
            )
            : 0), 0);
      }
      return totReturn;
    }, unit.costs[0].cost.find(cost => cost.$.name === ' CP') ? parseFloat(unit.costs[0].cost.find(cost => cost.$.name === 'CP').$.value) : 0);

    const points = [];
    if (costPts) points.push(`${costPts}pts`);
    if (costPL) points.push(`${costPL}PL`);
    if (costCP) points.push(`${costCP}CP`);

    return points;
  }

  getUnitSpecialisation() {
    if (this.props.rosterType !== 'Kill Team') return null;
    const upgrade = this.props.unit.selections[0].selection.find(
      _upgrade => _upgrade.$.type === 'upgrade' && _upgrade.selections,
    );

    if (!upgrade) return null;
    return upgrade.$.name;
  }

  renderDebug() {
    if (!__DEV__ && this.props)
      return null;
    // const html = prettyHtml(this.props.unit);
    // return <div dangerouslySetInnerHTML={{ __html: html }} />;
    return null;
  }

  render() {
    if (!this.props.unit.selections) return '';
    if (__DEV__ && this.props.showOnlyIds.length) {
      if (!this.props.showOnlyIds.includes(this.props.unit.$.id)) return null;
      console.info(`[${this.props.unit.$.name}]`)
    }

    const category = this.props.unit.categories[0].category.find(
      _category => _category.$.primary === 'true',
    ).$.name;

    const points = Unit.getPoints(this.props.unit);

    return (
      <div className="card">
        <h4 className="card-header">
          <button
            className="btn btn-link"
            type="button"
            data-toggle="collapse"
            data-target={`#card-${this.props.unit.$.id}`}
            aria-expanded="true"
            aria-controls={`card-${this.props.unit.$.id}`}
          >
            <MyFormattedMessage
              prefix="unit.name"
              message={this.props.unit.$.name}
            />
            {this.getUnitSpecialisation()
              ? [
                ' (',
                <MyFormattedMessage
                  prefix="unit.specialisation"
                  message={this.getUnitSpecialisation()}
                />,
                ')',
              ]
              : ''}{' '}
            <span>
              <MyFormattedMessage prefix="unit.keyword" message={category} />
              {points.length ? ` (${points.join(', ')})` : ''}
            </span>
          </button>
        </h4>
        <div id={`card-${this.props.unit.$.id}`} className="collapse show">
          <div className="card-body">
            <ErrorBoundary>
              <UnitCategories
                key={this.props.unit.$.id}
                unit={this.props.unit}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <UnitModelsTable
                key={`models_table_${this.props.unit.$.id}`}
                unit={this.props.unit}
                header="true"
                showOnlyIds={this.props.showOnlyIds}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <UnitWeaponsTable
                key={`weapons_table_${this.props.unit.$.id}`}
                unit={this.props.unit}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <UnitPsychicsTable
                key={`psychic_table_${this.props.unit.$.id}`}
                unit={this.props.unit}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <UnitAbilitiesTable
                key={`abilities_table_${this.props.unit.$.id}`}
                unit={this.props.unit}
              />
            </ErrorBoundary>

            {this.renderDebug()}
          </div>
        </div>
      </div>
    );
  }
}

const mapState = state => ({
  rosterType: state.roster.type,
});

const mapDispatch = {};

export default injectIntl(connect(mapState, mapDispatch)(Unit));

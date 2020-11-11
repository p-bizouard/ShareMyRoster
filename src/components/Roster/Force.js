/* eslint-disable prettier/prettier */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';

import Unit from './Unit';
import UnitModelsTable from './UnitModelsTable';
import ErrorBoundary from '../ErrorBoundary';
import MyFormattedMessage from '../MyFormattedMessage';

export default class Force extends Component {
  static propTypes = {
    force: PropTypes.shape({
      selections: PropTypes.array.isRequired,
      $: PropTypes.shape({
        name: PropTypes.string.isRequired,
        catalogueName: PropTypes.string.isRequired,
      })
    }).isRequired,
    recap: PropTypes.string,
    rosterType: PropTypes.string,
    index: PropTypes.number.isRequired,
    rosterName: PropTypes.string.isRequired,
    cost: PropTypes.arrayOf(PropTypes.shape({
      $: PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired
      })
    })).isRequired,
    showOnlyIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  static defaultProps = {
    recap: 'false',
    rosterType: null
  };


  static getPCs(force) {
    return force.selections[0].selection.reduce((tot, unit) => {
      if (!unit.selections) return tot;
      return unit.selections[0].selection.reduce((subtot, selection) => {
        let returnSubTot = subtot;
        returnSubTot += selection.costs[0].cost.find(cost => cost.$.name === 'CP')
          ? parseFloat(
            selection.costs[0].cost.find(cost => cost.$.name === 'CP').$
              .value,
          )
          : 0;
        if (selection.selections) {
          returnSubTot += selection.selections[0].selection.reduce(
            (subsubtot, subselection) =>
              subsubtot +
              (selection.costs[0].cost.find(cost => cost.$.name === 'CP')
                ? parseFloat(
                  subselection.costs[0].cost.find(cost => cost.$.name === 'CP').$.value,
                )
                : 0),
            0,
          );
        }
        return returnSubTot;
      }, tot + unit.costs[0].cost.find(cost => cost.$.name === ' CP') ? parseFloat(unit.costs[0].cost.find(cost => cost.$.name === 'CP').$.value) : 0);
    }, 0);
  }

  removeIds(obj) {
    // eslint-disable-next-line no-restricted-syntax
    for (const prop in obj) {
      if (['id', 'entryId', 'typeId', 'entryGroupId'].includes(prop))
        // eslint-disable-next-line no-param-reassign
        delete obj[prop];
      else if (typeof obj[prop] === 'object') this.removeIds(obj[prop]);
    }
    return obj;
  }

  renderSelections() {
    const categoryOrder = [
      'HQ',
      'Troops',
      'Elites',
      'Fast Attack',
      'Heavy Support',
      'Flyer',
      'Dedicated Transport',
      'Fortification',
    ];

    const selectionArray = [...this.props.force.selections[0].selection];

    selectionArray.sort((a, b) => {
      const aCat = a.categories[0].category.find(
        category => category.$.primary === 'true',
      ).$.name;
      const bCat = b.categories[0].category.find(
        category => category.$.primary === 'true',
      ).$.name;

      if (categoryOrder.indexOf(aCat) !== categoryOrder.indexOf(bCat))
        return categoryOrder.indexOf(aCat) - categoryOrder.indexOf(bCat);
      return a.$.name < b.$.name ? -1 : 1;
    });

    const unitComponents = [];
    const unitsCompare = [];
    selectionArray.forEach(constUnit => {
      if (constUnit.$.name === 'List Configuration') return;

      const unit = JSON.parse(JSON.stringify(constUnit));
      const unitJSON = JSON.stringify(
        this.removeIds(JSON.parse(JSON.stringify(unit))),
      );

      let countDup = 0;
      selectionArray.forEach(subUnit => {
        const subUnitJSON = JSON.stringify(
          this.removeIds(JSON.parse(JSON.stringify(subUnit))),
        );

        if (subUnitJSON === unitJSON) {
          countDup += 1;
        }
      }, this);

      if (countDup > 1) unit.$.name = `${unit.$.name} (x${countDup})`;

      if (!unitsCompare.includes(unitJSON)) {
        let currentUnitComponent;
        if (this.props.recap === "true") {
          if (unitsCompare.includes(unit.$.name.replace(/\s*\(x?\d+\)/, ''))) return;
          currentUnitComponent = (
            <ErrorBoundary key={`force-unit-${unit.$.id}`}>
              <UnitModelsTable
                unit={unit}
                onlyModel="true"
                showOnlyIds={this.props.showOnlyIds}
              />
            </ErrorBoundary>
          );

          unitsCompare.push(unit.$.name.replace(/\s*\(x?\d+\)/, ''));
        } else {
          currentUnitComponent = <Unit
            key={unit.$.id}
            unit={unit}
            showOnlyIds={this.props.showOnlyIds}
          />;
        }
        unitComponents.push(currentUnitComponent);
        unitsCompare.push(unitJSON);
      }
    }, this);
    return unitComponents;
  }

  render() {
    const pcs = Force.getPCs(this.props.force);

    if (this.props.recap === "true") {
      return (
        <div className="table-responsive">
          <table className="table-models table table-striped table-bordered table-hover table-sm">
            <thead>
              <tr>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.model"
                    defaultMessage="Model"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.m"
                    defaultMessage="M"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.ws"
                    defaultMessage="WS"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.bs"
                    defaultMessage="BS"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.s"
                    defaultMessage="S"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.t"
                    defaultMessage="T"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.w"
                    defaultMessage="W"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.a"
                    defaultMessage="A"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.ld"
                    defaultMessage="Ld"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="DatasheetTemplate.table.save"
                    defaultMessage="Save"
                  />
                </th>
                {this.props.rosterType === 'Kill Team' ? (
                  <th>
                    <FormattedMessage
                      id="DatasheetTemplate.table.max"
                      defaultMessage="Max"
                    />
                  </th>
                ) : (
                    ''
                  )}
              </tr>
            </thead>
            <tbody>{this.renderSelections()}</tbody>
          </table>
        </div>
      );
    }
    return (
      <div className="force mt-4">
        {this.props.index === 0 && (
          <h2>
            {this.props.rosterName} ({this.props.cost[0].$.value}
            {this.props.cost[0].$.name},
            {this.props.cost[1]
              ? `${this.props.cost[1].$.value} ${this.props.cost[1].$.name}`
              : ''}
            )
          </h2>
        )}
        <h3>
          {this.props.force.$.catalogueName} -
          <MyFormattedMessage
            prefix="unit.keyword"
            message={this.props.force.$.name}
          />{' '}
          {pcs ? `(${pcs}CP)` : ''}
        </h3>
        <div className="accordion">{this.renderSelections()}</div>
      </div>
    );
  }
}

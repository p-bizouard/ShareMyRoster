import React, { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

import MyFormattedMessage from '../MyFormattedMessage';

export default class UnitPsychicsTable extends Component {
  unitHasPsychics() {
    return this.unitHasPrimaryPsychics() || this.unitHasSecondaryPsychics();
  }

  unitHasPrimaryPsychics() {
    if (!this.props.unit.profiles) return false;
    if (
      this.props.unit.profiles[0].profile.filter(
        profile => profile.$.typeName === 'Psychic Power',
      ).length > 0
    )
      return true;
    return false;
  }

  unitHasSecondaryPsychics() {
    return this.props.unit.selections[0].selection.reduce((test, selection) => {
      if (!selection.profiles) return test;
      if (
        selection.profiles[0].profile.filter(
          profile => profile.$.typeName === 'Psychic Power',
        ).length > 0
      )
        return true;
      return test;
    }, false);
  }

  getPsychicData(psychic) {
    return {
      id: psychic.$.id,
      name: psychic.$.name,
      charge: psychic.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Warp Charge',
      )._,
      range: psychic.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Range',
      )._,
      description: psychic.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Details',
      )._,
    };
  }

  renderPsychics(characteristicName) {
    let psychics = [];

    if (this.props.unit.selections) {
      psychics = psychics
        .concat(
          this.props.unit.selections[0].selection.map(function(model) {
            let modelPsychics = [];

            if (model.profiles)
              modelPsychics = modelPsychics
                .concat(
                  model.profiles[0].profile
                    .filter(profile => profile.$.typeName === 'Psychic Power')
                    .map(
                      modelPsychic => this.getPsychicData(modelPsychic),
                      this,
                    ),
                )
                .flat();

            if (model.selections) {
              modelPsychics = modelPsychics
                .concat(
                  model.selections[0].selection
                    .filter(upgrade => upgrade.$.type === 'upgrade')
                    .map(function(upgrade) {
                      if (!upgrade.profiles) return null;

                      return upgrade.profiles[0].profile
                        .filter(
                          upgradeAbility =>
                            upgradeAbility.$.typeName === 'Psychic Power',
                        )
                        .map(
                          upgradePsychic => this.getPsychicData(upgradePsychic),
                          this,
                        );
                    }, this),
                )
                .flat();
            }

            return modelPsychics;
          }, this),
        )
        .flat();
    }

    if (this.props.unit.profiles) {
      psychics = psychics
        .concat(
          this.props.unit.profiles[0].profile
            .filter(profile => profile.$.typeName === 'Psychic Power')
            .map(modelPsychic => this.getPsychicData(modelPsychic), this),
        )
        .flat();
    }

    psychics = psychics.flat().filter(n => n);

    const dedupPsychics = Array.from(new Set(psychics.map(a => a.name))).map(
      name => psychics.find(a => a.name === name),
    );

    return dedupPsychics.map(psychic => (
      <tr key={`psychic_${this.props.unit.$.id}_${psychic.id}`}>
        <td>
          <MyFormattedMessage
            prefix="unit.psychic_name"
            message={psychic.name}
          />
        </td>
        <td>{psychic.charge}</td>
        <td>
          {psychic.range === 'Melee' ? (
            <MyFormattedMessage prefix="unit.weapon" message={psychic.range} />
          ) : (
            psychic.range
          )}
        </td>
        <td>
          <MyFormattedMessage
            prefix="unit.psychic_description"
            message={psychic.name}
            defaultMessage={
              psychic.abilities ? psychic.abilities.replace(/^\-$/, '') : ''
            }
          />
        </td>
      </tr>
    ));
  }

  render() {
    if (!this.unitHasPsychics()) return '';
    return (
      <div className="table-responsive">
        <table className="table-psychics table table-striped table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.psychic_power"
                  defaultMessage="Psychic power"
                />
              </th>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.warp_charge"
                  defaultMessage="Warp charge"
                />
              </th>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.range"
                  defaultMessage="Range"
                />
              </th>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.description"
                  defaultMessage="Description"
                />
              </th>
            </tr>
          </thead>
          <tbody>{this.renderPsychics()}</tbody>
        </table>
      </div>
    );
  }
}

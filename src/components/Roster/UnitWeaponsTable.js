import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

import MyFormattedMessage from '../MyFormattedMessage';

class UnitAbilitiesTable extends React.Component {
  unitHasWeapons() {
    return this.unitHasPrimaryWeapons() || this.unitHasSecondaryWeapons();
  }

  unitHasPrimaryWeapons() {
    if (!this.props.unit.profiles) return false;
    if (
      this.props.unit.profiles[0].profile.filter(
        profile =>
          profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
      ).length > 0
    )
      return true;
    return false;
  }

  unitHasSecondaryWeapons() {
    return this.props.unit.selections[0].selection.reduce((test, selection) => {
      if (!selection.profiles) return test;
      if (
        selection.profiles[0].profile.filter(
          profile =>
            profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
        ).length > 0
      )
        return true;
      return test;
    }, false);
  }

  getWeaponData(weapon) {
    return {
      id: weapon.$.id,
      name: weapon.$.name,
      range: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Range',
      )._,
      type: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Type',
      )._,
      strength: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'S',
      )._,
      ap: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'AP',
      )._,
      damage: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'D',
      )._,
      abilities: weapon.characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === 'Abilities',
      )._,
    };
  }

  renderWeapons(characteristicName) {
    const { intl } = this.props;

    let weapons = [];

    if (this.props.unit.selections) {
      weapons = weapons
        .concat(
          this.props.unit.selections[0].selection.map(function(model) {
            let modelWeapons = [];

            if (model.profiles)
              modelWeapons = modelWeapons
                .concat(
                  model.profiles[0].profile
                    .filter(profile => profile.$.typeName === 'Weapon')
                    .map(modelWeapon => this.getWeaponData(modelWeapon), this),
                )
                .flat();

            if (model.selections) {
              modelWeapons = modelWeapons
                .concat(
                  model.selections[0].selection
                    .filter(upgrade => upgrade.$.type === 'upgrade')
                    .map(function(upgrade) {
                      if (!upgrade.profiles) return null;

                      return upgrade.profiles[0].profile
                        .filter(
                          upgradeAbility =>
                            upgradeAbility.$.typeName === 'Weapon',
                        )
                        .map(
                          upgradeWeapon => this.getWeaponData(upgradeWeapon),
                          this,
                        );
                    }, this),
                )
                .flat();
            }

            return modelWeapons;
          }, this),
        )
        .flat();
    }

    if (this.props.unit.profiles) {
      weapons = weapons
        .concat(
          this.props.unit.profiles[0].profile
            .filter(profile => profile.$.typeName === 'Weapon')
            .map(modelWeapon => this.getWeaponData(modelWeapon), this),
        )
        .flat();
    }

    weapons = weapons.flat().filter(n => n);

    const dedupWeapons = Array.from(new Set(weapons.map(a => a.name))).map(
      name => weapons.find(a => a.name === name),
    );

    dedupWeapons.sort((a, b) => {
      if (
        !isNaN(parseInt(a.range)) &&
        !isNaN(parseInt(b.range)) &&
        parseInt(a.range) !== parseInt(b.range)
      )
        return parseInt(a.range) - parseInt(b.range);
      return a.range > b.range ? -1 : 1;
    });

    return dedupWeapons.map(weapon => (
      <tr
        key={`weapon_${this.props.unit.$.id}_${weapon.id}`}
        data-weapon-type={weapon.type}
      >
        <td>
          <MyFormattedMessage prefix="unit.weapon" message={weapon.name} />
        </td>
        <td>
          {weapon.range === 'Melee' ? (
            <MyFormattedMessage prefix="unit.weapon" message={weapon.range} />
          ) : (
            weapon.range
          )}
        </td>
        <td>
          <MyFormattedMessage prefix="unit.weapon" message={weapon.type} />
        </td>
        <td>{weapon.strength}</td>
        <td>{weapon.ap}</td>
        <td>{weapon.damage}</td>
        <td>
          <MyFormattedMessage
            prefix="unit.weapon_ability"
            message={weapon.name}
            defaultMessage={
              weapon.abilities ? weapon.abilities.replace(/^\-$/, '') : ''
            }
          />
        </td>
        {/* <td>{weapon.abilities ? weapon.abilities.replace(/^\-$/, '') : ''}</td> */}
      </tr>
    ));
  }

  render() {
    if (!this.unitHasWeapons()) return '';
    return (
      <div className="table-responsive">
        <table className="table-weapons table table-striped table-bordered table-hover table-sm">
          <thead>
            <tr>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.weapon"
                  defaultMessage="Weapon"
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
                  id="DatasheetTemplate.table.type"
                  defaultMessage="Type"
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
                  id="DatasheetTemplate.table.ap"
                  defaultMessage="AP"
                />
              </th>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.d"
                  defaultMessage="D"
                />
              </th>
              <th>
                <FormattedMessage
                  id="DatasheetTemplate.table.abilities"
                  defaultMessage="Abilities"
                />
              </th>
            </tr>
          </thead>
          <tbody>{this.renderWeapons()}</tbody>
        </table>
      </div>
    );
  }
}
export default injectIntl(UnitAbilitiesTable);

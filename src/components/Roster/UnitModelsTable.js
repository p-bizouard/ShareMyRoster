/* eslint-disable prettier/prettier */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';

import MyFormattedMessage from '../MyFormattedMessage';

class UnitModelsTable extends React.Component {
  static propTypes = {
    unit: PropTypes.shape({
      $: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
      categories: PropTypes.array.isRequired,
      selections: PropTypes.array.isRequired,
      profiles: PropTypes.array.isRequired,
    }).isRequired,
    rosterType: PropTypes.string.isRequired,
    onlyModel: PropTypes.string,
    showOnlyIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  static defaultProps = {
    onlyModel: 'false',
  }

  static getModelCharacteristic(model, profiles, characteristicName) {
    if (
      !profiles
        .find(profile => profile.$.typeName === 'Unit' || profile.$.typeName === 'Model')
        .characteristics[0].characteristic.find(
          characteristic => characteristic.$.name === characteristicName,
        )
    )
      return null;

    const matchedProfiles = profiles.filter(profile => profile.$.typeName === 'Unit' || profile.$.typeName === 'Model');

    if (matchedProfiles.length === 1 || !matchedProfiles.find(profile => profile.$.name === model.$.name))
      return matchedProfiles[0].characteristics[0].characteristic.find(
        characteristic => characteristic.$.name === characteristicName,
      )._;

    return matchedProfiles.find(profile => profile.$.name === model.$.name).characteristics[0].characteristic.find(
      characteristic => characteristic.$.name === characteristicName,
    )._;
  }

  static renderModelsAbilities(model) {
    if (!model.selections) return '';
    let abilities = [
      ...new Set(
        model.selections[0].selection.map(modelAttributs => {
          if (!modelAttributs.profiles) return '';

          return modelAttributs.profiles[0].profile
            .filter(profile => profile.$.typeName === 'Abilities')
            .map(modelAbility => modelAbility.$.name);
        }),
      ),
    ];

    abilities = abilities.flat().filter(ability => ability !== '');
    if (abilities.length)
      return (
        <li>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.abilitie"
              defaultMessage={`{count, plural, one {Abilitiy} other {Abilities}} :`}
              values={{ count: abilities.length }}
            />
          </i>{' '}
          <MyFormattedMessage
            prefix="unit.ability_name"
            message={abilities}
            join=", "
          />
        </li>
      );
    return null
  }

  static renderModelsExplosion(model) {
    if (!model.profiles) return null;
    return model.profiles[0].profile
      .filter(profile => profile.$.typeName === 'Explosion')
      .map(profile => (
        <li key={`explosion_${model.$.id}_${profile.$.id}`}>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.explosion"
              defaultMessage="Explosion :"
            />
          </i>{' '}
          {/* {TAPi18n.__('DatasheetTemplate.explosion_description', {
            postProcess: 'sprintf',
            sprintf: [
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Dice roll',
              )._,
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Mortal wounds',
              )._,
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Distance',
              )._,
            ],
          })} */}
        </li>
      ));
  }

  static renderModelsTransport(model) {
    if (!model.profiles) return null;
    return model.profiles[0].profile
      .filter(profile => profile.$.typeName === 'Transport')
      .map(profile => (
        <li key={`transport_${model.$.id}_${profile.$.id}`}>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.transport"
              defaultMessage="Transport :"
            />
          </i>{' '}
          <MyFormattedMessage
            prefix="unit.ability_description"
            message={
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Capacity',
              )._
            }
          />
        </li>
      ));
  }

  static modelHasSpecificCharacteristics(model) {
    return !!model.profiles;
  }

  static modelIsGroupPrimary(model) {
    return model.$.type === 'unit';
  }

  static modelIsGroupSecondary(model) {
    if (model.$.type === 'model' && model.$.entryGroupId) return true;
    return false;
  }

  static selectiongetGroupPrimary(models) {
    return models.reduce((primary, model) => {
      if (primary) return primary;
      if (this.modelIsGroupPrimary(model)) return model;
      return null;
    }, null);
  }

  static hasDifferentSubModelsCharacteristics(model) {
    const characteristics = [];
    let atLeastOneDifferent = false;

    model.profiles[0].profile.filter(profile => profile.$.typeName === 'Unit').forEach(profile => {
      const characteristic = JSON.stringify(profile.characteristics);
      if (characteristics.length && !characteristics.includes(characteristic))
        atLeastOneDifferent = true;
      characteristics.push(characteristic);
    });
    return atLeastOneDifferent;
  }

  constructor(props) {
    super(props);

    this.characteristicsName = ['M', 'WS', 'BS', 'S', 'T', 'W', 'A', 'Ld'];
    if (props.rosterType === 'Kill Team') {
      this.characteristicsName.push('Sv');
      this.characteristicsName.push('Max');
    } else {
      this.characteristicsName.push('Save');
    }
  }

  unitHasTable() {
    return this.unitHasPrimaryModel() || this.unitHasSecondaryModel();
  }

  unitHasPrimaryModel() {
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

  unitHasSecondaryModel() {
    if (!this.props.unit.selections) return false;
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

  renderOtherWeapons(selections /* , canHaveSubModels */) {
    return selections.map(model => {
      if (model.$.entryGroupId && this.unitHasPrimaryModel())
        return null;
      if (!model.selections && !model.profiles) return null;

      if (
        model.profiles &&
        model.profiles[0].profile.find(
          profile =>
            profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
        )
      )
        return null;

      if (
        !model.profiles &&
        !model.selections[0].selection.find(
          selection => selection.$.type === 'upgrade',
        )
      )
        return null;

      if (
        !model.selections &&
        !model.profiles[0].profile.find(
          profile => profile.$.typeName === 'Weapon',
        )
      )
        return null;

      return (
        <li key={`model-table-otherwapon-${model.$.id}`}>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.weapon"
              defaultMessage={`{count, plural, one {Weapon} other {Weapons}} :`}
              values={{ count: parseInt(model.$.number, 10) }}
            />
          </i>{' '}
          <MyFormattedMessage prefix="unit.weapon" message={model.$.name} />
          {model.$.number !== '1' && <span> ({model.$.number})</span>}
        </li>
      );
    }, this);
  }

  renderModelsWeapons(model, primaryModel) {
    let weapons = [];
    if (model.selections)
      weapons = weapons.concat([
        ...new Set(
          model.selections[0].selection.map(modelAttributs => {
            if (
              !modelAttributs.profiles ||
              !modelAttributs.profiles[0].profile.filter(
                profile => profile.$.typeName === 'Weapon',
              ).length
            )
              return '';
            return modelAttributs.$.name;
          }),
        ),
      ]);

    if (primaryModel && primaryModel.selections)
      weapons = weapons.concat([
        ...new Set(
          primaryModel.selections[0].selection.map(modelAttributs => {
            if (
              !modelAttributs.profiles ||
              !modelAttributs.profiles[0].profile.filter(
                profile => profile.$.typeName === 'Weapon',
              ).length
            )
              return '';
            return modelAttributs.$.name;
          }),
        ),
      ]);

    weapons = weapons.filter(String).sort();

    if (weapons.length)
      return (
        <li key={`ability_${model.$.id}`}>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.weapon"
              defaultMessage={`{count, plural, one {Weapon} other {Weapons}} :`}
              values={{ count: weapons.length }}
            />{' '}
          </i>

          <MyFormattedMessage
            prefix="unit.weapon"
            message={weapons}
            join=", "
          />
        </li>
      );
    return this.renderOtherWeapons(
      this.props.unit.selections[0].selection,
      false,
    );
  }

  renderModelsPsychics(model) {
    if (!this.props.unit.profiles) return null;
    return this.props.unit.profiles[0].profile
      .filter(profile => profile.$.typeName === 'Psyker')
      .map(profile => {
        const other = profile.characteristics[0].characteristic.find(
          characteristic => characteristic.$.name === 'Other',
        );
        return (
          <li key={`psychic_${model.$.id}_${profile.$.id}`}>
            <i>
              <FormattedMessage
                id="DatasheetTemplate.psychic_power"
                defaultMessage="Psychic power"
              />{' '}
            </i>
            {
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Powers Known',
              )._
            }{' '}
            ({
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Cast',
              )._
            }{' '}
            Cast,
            {
              profile.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === 'Deny',
              )._
            }{' '}
            Deny )
            {other && other._ ? <p>{other._.replace('-', '')}</p> : ''}
          </li>
        );
      });
  }

  renderKeywords() {
    const keywords = [
      ...new Set(
        this.props.unit.categories[0].category
          .filter(category => {
            if (category.$.name.match(this.regexFaction)) return false;
            if (category.$.name === this.props.unit.$.name) return false;
            if (category.$primary === 'true') return false;
            return true;
          }, this)
          .map(category => category.$.name),
      ),
    ];

    if (keywords.length)
      return (
        <li>
          <i>
            <FormattedMessage
              id="DatasheetTemplate.keyword"
              defaultMessage={`{count, plural, one {Keyword} other {Keywords}} :`}
              values={{ count: keywords.length }}
            />
          </i>{' '}
          {keywords.join(', ')}
        </li>
      );
    return null
  }

  renderModels(models, canHaveSubModels) {
    const modelsDone = [];

    return models.map(model => {
      if (!model.profiles) return null;

      if (!model.profiles[0].profile.find(profile => profile.$.typeName === 'Unit' || profile.$.typeName === 'Model'))
        return null;

      if (modelsDone.includes(model.$.name)) return null;
      modelsDone.push(model.$.name);

      // If multiples submodels with different characteristics, do not regroup them but display new line for each
      if (UnitModelsTable.hasDifferentSubModelsCharacteristics(model)) {
        return models.filter(selection => selection.selections).map((selection) =>
          selection.selections[0].selection.filter(subModel => subModel.$.type === 'model' && subModel.$.entryGroupId).map((subModel) => {
            if (modelsDone.includes(subModel.$.name))
              return null;
            modelsDone.push(subModel.$.name);
            return [
              <tr key={`model-table-${model.$.id}`}>
                <td>
                  <b>
                    <MyFormattedMessage prefix="unit.name" message={subModel.$.name} />
                    {subModel.$.number !== '1' && <span> ({subModel.$.number})</span>}
                  </b>
                  {this.props.onlyModel !== "true" ? (
                    <ul className="list-unstyled">
                      {this.renderModelsWeapons(subModel, model)}
                      {UnitModelsTable.renderModelsAbilities(subModel)}
                      {this.renderModelsPsychics(subModel)}
                      {UnitModelsTable.renderModelsExplosion(subModel)}
                      {UnitModelsTable.renderModelsTransport(subModel)}
                    </ul>
                  ) : (
                      ''
                    )}
                </td>

                {this.characteristicsName.map(value =>
                  this.renderCharacteristic(subModel, value, model.profiles ? model.profiles[0].profile : null),
                )}
              </tr>
            ]
          }, this), this);
      }

      return (
        <tr key={`model-table-${model.$.id}`}>
          <td>
            <b>
              <MyFormattedMessage prefix="unit.name" message={model.$.name} />
              {model.$.number !== '1' && <span> ({model.$.number})</span>}
            </b>
            {this.props.onlyModel !== "true" ? (
              <ul className="list-unstyled">
                {this.renderModelsWeapons(model)}
                {UnitModelsTable.renderModelsAbilities(model)}
                {this.renderModelsPsychics(model)}
                {UnitModelsTable.renderModelsExplosion(model)}
                {UnitModelsTable.renderModelsTransport(model)}

                {canHaveSubModels ? this.renderSubModels(models, model) : ''}
              </ul>
            ) : (
                ''
              )}
          </td>

          {
            this.characteristicsName.map(value =>
              this.renderCharacteristic(model, value),
            )
          }
        </tr >
      );
    }, this);
  }

  renderCharacteristic(model, characteristicName, primaryModelProfiles) {
    let profiles = [];
    if (model.profiles) {
      profiles = model.profiles[0].profile;
    } else if (primaryModelProfiles !== null) {
      profiles = primaryModelProfiles;
    } else {
      return null;
    }


    // Current model base
    const value = UnitModelsTable.getModelCharacteristic(model, profiles, characteristicName);

    let woundedCharacteristics = null;
    // Current model wounded
    {
      let searchedCharacteristics = [];
      const profileBase = profiles.find(
        profile =>
          profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
      );
      if (profileBase) {
        profileBase.characteristics[0].characteristic.forEach(
          characteristic => {
            if (
              characteristic._ === '*' &&
              characteristic.$.name === characteristicName
            )
              searchedCharacteristics.push(
                `Characteristic ${searchedCharacteristics.length + 1}`,
              );
          },
        );
      }

      const woundedTypeNames = /(Wound Track|Stat Damage)/gi;

      if (characteristicName === 'W')
        searchedCharacteristics = searchedCharacteristics.concat([
          'Remaining W',
          'Wounds',
        ]);
      else if (characteristicName === 'M')
        searchedCharacteristics = searchedCharacteristics.concat(['Movement']);
      else if (characteristicName === 'BS')
        searchedCharacteristics = searchedCharacteristics.concat(['BS']);
      else if (characteristicName === 'A')
        searchedCharacteristics = searchedCharacteristics.concat(['Attacks']);

      if (searchedCharacteristics.length) {
        // Check in profile
        const woundProfileBase = profiles.find(profile =>
          profile.$.typeName.match(woundedTypeNames),
        );

        if (woundProfileBase) {
          const woundProfileWounded = profiles.filter(
            profile =>
              profile.$.typeName.match(woundedTypeNames) &&
              profile.$.name !== model.$.name,
          );

          if (woundProfileWounded) {
            const hasWoundedCharacteristicAvailable = woundProfileWounded.reduce(
              (test, profile) => {
                if (!profile.characteristics) return test;
                if (
                  profile.characteristics[0].characteristic.find(
                    characteristic =>
                      searchedCharacteristics.indexOf(characteristic.$.name) >=
                      0,
                  )
                )
                  return true;
                return test;
              },
              false,
            );

            // If it has at least one decreased value
            if (hasWoundedCharacteristicAvailable) {
              woundedCharacteristics = [
                <span
                  className="d-block"
                  key={`wounded-${model.$.id}-0-${characteristicName}`}
                >
                  &nbsp;
                </span>,
              ];
              woundedCharacteristics = woundedCharacteristics.concat(
                woundProfileWounded.map(profile => (
                  <span
                    className="d-block"
                    key={`wounded-${model.$.id}-${
                      profile.$.id
                      }-${characteristicName}`}
                  >
                    {
                      profile.characteristics[0].characteristic.find(
                        characteristic =>
                          searchedCharacteristics.indexOf(
                            characteristic.$.name,
                          ) >= 0,
                      )._
                    }
                  </span>
                )),
              );
            }
          }
        }
        // Check in subprofile
        if (model.selections) {
          const woundedSelection = model.selections[0].selection.find(
            selection => selection.$.name.match(/^Stat Damage \(.*\)/),
          );
          if (woundedSelection) {
            // let unitName = woundedSelection.$.name.match(/^Stat Damage \((.*)\)/i)[1]
            const woundProfileWounded = woundedSelection.profiles[0].profile.filter(
              profile => profile.$.typeName.match(/^Stat Damage - .*/),
            );
            if (woundProfileWounded) {
              woundedCharacteristics = [
                <span
                  className="d-block"
                  key={`wounded-${model.$.id}-0-${characteristicName}`}
                >
                  &nbsp;
                </span>,
              ];
              woundedCharacteristics = woundedCharacteristics.concat(
                woundProfileWounded.map((profile) => (
                  <span
                    className="d-block"
                    key={`wounded-${model.$.id}-${
                      profile.$.id
                      }-${characteristicName}`}
                  >
                    {
                      profile.characteristics[0].characteristic.find(
                        characteristic =>
                          searchedCharacteristics.indexOf(
                            characteristic.$.name,
                          ) >= 0,
                      )._
                    }
                  </span>
                )),
              );
            }
          }
        }
      }
    }

    // Characteristics of sub models
    let characteristicsOfUnit = this.props.unit.selections[0].selection.map(submodel => {
      if (!submodel.profiles) return [0];

      return submodel.profiles[0].profile
        .filter(
          profile =>
            profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
        )
        .map(unit =>
          parseInt(
            unit.characteristics[0].characteristic.find(
              characteristic => characteristic.$.name === characteristicName,
            )._, 10
          ),
        );
    });

    // Characteristics of top models
    if (this.props.unit.profiles) {
      characteristicsOfUnit = characteristicsOfUnit.concat(
        this.props.unit.profiles[0].profile
          .filter(
            profile =>
              profile.$.typeName === 'Unit' || profile.$.typeName === 'Model',
          )
          .map(
            unit =>
              unit.characteristics[0].characteristic.find(
                characteristic => characteristic.$.name === characteristicName,
              )
                ? parseInt(
                  unit.characteristics[0].characteristic.find(
                    characteristic =>
                      characteristic.$.name === characteristicName,
                  )._, 10
                )
                : 0,
          ),
      );
    }

    characteristicsOfUnit = characteristicsOfUnit.flat().filter(Number); // flatten and filter 0 values

    let getBetterStat = false;
    if (
      Math.min(...characteristicsOfUnit) !== 0 &&
      Math.min(...characteristicsOfUnit) !== Math.max(...characteristicsOfUnit)
    ) {
      if (['M', 'S', 'T', 'W', 'A', 'Ld'].indexOf(characteristicName) !== -1)
        getBetterStat = Math.max(...characteristicsOfUnit) === parseInt(value, 10);
      else
        getBetterStat = Math.min(...characteristicsOfUnit) === parseInt(value, 10);
    }
    return (
      <td
        key={`characteristic-${characteristicName}-${model.$.id}`}
        className={getBetterStat ? 'table-success' : ''}
      >
        {value}
        {woundedCharacteristics}
      </td>
    );
  }

  renderSubModels(models, model) {
    const modelsDone = [];

    // Avoid warning
    if (!model && model) return null;

    return models
      .filter(selection => selection.selections)
      .map((selection) => selection.selections[0].selection
        .filter(
          subModel => subModel.$.type === 'model' && subModel.$.entryGroupId,
        )
        .map((subModel) => {
          if (modelsDone.includes(subModel.$.name))
            return null;
          modelsDone.push(subModel.$.name);
          return [
            <li key={`submodel_${subModel.$.id}`}>
              <u>
                <MyFormattedMessage
                  prefix="unit.name"
                  message={subModel.$.name}
                />
                {subModel.$.number !== '1' && (
                  <span> ({subModel.$.number})</span>
                )}
              </u>
              {this.props.onlyModel !== "true" ? (
                <ul className="list-unstyled">
                  {this.renderModelsWeapons(subModel)}
                  {UnitModelsTable.renderModelsAbilities(subModel)}
                  {this.renderModelsPsychics(subModel)}
                  {UnitModelsTable.renderModelsExplosion(subModel)}
                  {UnitModelsTable.renderModelsTransport(subModel)}
                </ul>
              ) : (
                  ''
                )}
            </li>,
          ];
        }, this), this);
  }

  render() {
    if (!this.unitHasTable()) return '';

    if (__DEV__ && this.props.showOnlyIds.length) {
      if (!this.props.showOnlyIds.includes(this.props.unit.$.id)) return null;
      console.info(`[${this.props.unit.$.name}]`)
    }

    if (this.props.onlyModel === "true")
      return [
        this.renderModels([this.props.unit], true),
        this.renderModels(this.props.unit.selections[0].selection, false),
      ];
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
          <tbody>
            {this.renderModels([this.props.unit], true)}
            {this.renderModels(this.props.unit.selections[0].selection, false)}
          </tbody>
        </table>
      </div>
    );
  }
}

const mapState = state => ({
  rosterType: state.roster.type,
});

const mapDispatch = {};

export default injectIntl(connect(mapState, mapDispatch)(UnitModelsTable));

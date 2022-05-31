/* eslint-disable prettier/prettier */
/* eslint-disable react/default-props-match-prop-types */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import MyFormattedMessage from '../MyFormattedMessage';

export default class UnitCategories extends Component {
  static propTypes = {
    unit: PropTypes.shape({
      $: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
      }),
      categories: PropTypes.array.isRequired,
      selections: PropTypes.array,
      profiles: PropTypes.array,
      rules: PropTypes.array.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.regexFaction = /Faction: /g;
  }

  renderFaction() {
    const factions = [
      ...new Set(
        this.props.unit.categories[0].category
          .filter(category => category.$.name.match(this.regexFaction))
          .map(category => category.$.name.replace(this.regexFaction, '')),
      ),
    ];

    if (factions.length)
      return (
        <li>
          <b>
            <FormattedMessage
              id="DatasheetTemplate.faction"
              defaultMessage={`{count, plural, one {Faction} other {Factions}} :`}
              values={{ count: factions.length }}
            />
          </b>{' '}
          {factions.join(', ')}
        </li>
      );
    return null;
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
          <b>
            <FormattedMessage
              id="DatasheetTemplate.keyword"
              defaultMessage={`{count, plural, one {Keyword} other {Keywords}} :`}
              values={{ count: keywords.length }}
            />
          </b>{' '}
          <MyFormattedMessage
            prefix="unit.keyword"
            message={keywords}
            join=", "
          />
        </li>
      );
    return null;
  }

  renderAbilities() {
    let abilities = [];

    if (this.props.unit.selections) {
      abilities = abilities
        .concat(
          this.props.unit.selections[0].selection.map(model => {
            if (!model.profiles) return '';

            return model.profiles[0].profile
              .filter(profile => profile.$.typeName === 'Abilities')
              .map(modelAbility => modelAbility.$.name);
          }),
        )
        .flat();
    }

    if (this.props.unit.profiles)
      abilities = abilities
        .concat(
          this.props.unit.profiles[0].profile
            .filter(profile => profile.$.typeName === 'Abilities')
            .map(modelAbility => modelAbility.$.name),
        )
        .flat();

    abilities = [...new Set(abilities)].filter(ability => ability !== ''); // dedup & clear empties

    if (abilities.length)
      return (
        <li>
          <b>
            <FormattedMessage
              id="DatasheetTemplate.abilitie"
              defaultMessage={`{count, plural, one {Ability} other {Abilities}} :`}
              values={{ count: abilities.length }}
            />
          </b>{' '}
          {abilities.join(', ')}
        </li>
      );
    return null;
  }

  renderRules() {
    if (!this.props.unit.rules)
      return null;
    const rules = [
      ...new Set(this.props.unit.rules[0].rule.map(rule => rule.$.name)),
    ];

    if (rules.length)
      return (
        <li>
          <b>
            <FormattedMessage
              id="DatasheetTemplate.rules"
              defaultMessage={`{count, plural, one {Rule} other {Rules}} :`}
              values={{ count: rules.length }}
            />
          </b>{' '}
          <MyFormattedMessage
            prefix="unit.keyword"
            message={rules}
            join=", "
          />
        </li>
      );
    return null;
  }

  render() {
    return (
      <ul className="list-unstyled">
        {this.renderFaction()}
        {this.renderKeywords()}
        {this.renderRules()}
        {/* {this.renderAbilities()} */}
      </ul>
    );
  }
}

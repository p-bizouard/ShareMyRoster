/* eslint-disable prettier/prettier */
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';

import { FormattedMessage, injectIntl } from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import PropTypes from 'prop-types';

// import $ from 'jquery';

import { connect } from 'react-redux';
import { setRuntimeVariable } from '../../actions/runtime';

import s from './Header.scss';
import Link from '../Link';
import LanguageSwitcher from '../LanguageSwitcher';

import RoszUploader from '../Roster/RoszUploader';

import {
  setRosterKey,
  setRosterJson,
  saveRosterRosz,
  initRosterFromKey,
} from '../../actions/roster';

const DefaultData = require('../Roster/DefaultData.json');

class Header extends React.Component {
  static propTypes = {
    roster: PropTypes.shape({
      key: PropTypes.string.isRequired,
      json: PropTypes.string.isRequired,
    }),
    initRosterFromKey: PropTypes.func.isRequired,
    saveRosterRosz: PropTypes.func.isRequired,
    setRuntimeVariable: PropTypes.func.isRequired,
    setRosterKey: PropTypes.func.isRequired,
    setRosterJson: PropTypes.func.isRequired,
  };
  static defaultProps = {
    roster: null,
  };

  static hideShow(e) {
    const { action } = e.target.parentElement.dataset;
    // eslint-disable-next-line no-undef
    if (action === 'show') $('.card .collapse').collapse('show');
    else
      // eslint-disable-next-line no-undef
      $('.card .collapse').collapse('hide');
    e.preventDefault();
    return true;
  }

  constructor(props) {
    super(props);
    this.state = { modalShow: false };
  }

  async componentDidMount() {
    this.handlePrintChange('one-in-one');
    if (this.props.roster && this.props.roster.key && !this.props.roster.json) {
      this.props.initRosterFromKey(this.props.roster.key);
    }
  }

  getRosterLink() {
    if (!process.env.BROWSER || !this.props.roster || !this.props.roster.key)
      return '';
    return `${window.location.protocol}//${window.location.hostname}${
      window.location.port ? `:${window.location.port}` : ''
    }/r/${this.props.roster.key}`;
  }

  handlePrintChange(printType) {
    this.props.setRuntimeVariable({ name: 'printType', value: printType });
    const margin = {
      'one-in-one': '20mm',
      'two-in-one': '12mm',
      'four-in-one': '5mm',
    };
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `@media print { @page { margin: ${margin[printType]};} }`;

    document.getElementsByTagName('head')[0].appendChild(style);
  }

  async share() {
    if (!this.props.roster.key) {
      this.props.saveRosterRosz();
    }
    this.setState({ modalShow: true });
  }

  async print(e) {
    const { printType } = e.target.parentElement.dataset;
    e.preventDefault();
    this.handlePrintChange(printType);
    setTimeout(() => {
      window.print();
    }, 500);
    return true;
  }

  render() {
    const { modalShow } = this.state;

    return (
      <div className="header">
        <div className={s.root}>
          <div className={s.container}>
            <LanguageSwitcher />
            <Link className={s.brand} to="/">
              {/* <img
              src={logoUrl}
              srcSet={`${logoUrl2x} 2x`}
              width="38"
              height="38"
              alt="React"
            /> */}
              <span className={s.brandTxt}>
                <FormattedMessage
                  id="layout.title"
                  defaultMessage="ShareMyRoster"
                />
              </span>
            </Link>

            <div className="hidden-print text-center">
              <p className="lead">
                <FormattedMessage
                  id="layout.subtitle"
                  defaultMessage="View, share and print your {link} rosters !"
                  values={{
                    link: <a href="https://battlescribe.net/">Battlescribe</a>,
                  }}
                />
              </p>

              {this.props.roster && this.props.roster.json ? (
                <>
                  <button
                    type="button"
                    className="btn btn-success btn-lg"
                    onClick={e => {
                      this.share();
                      e.preventDefault();
                    }}
                  >
                    <FormattedMessage
                      id="layout.configuration.share"
                      defaultMessage="Share"
                    />
                  </button>

                  <div className="dropdown d-inline ml-2">
                    <button
                      className="btn btn-primary btn-lg dropdown-toggle"
                      type="button"
                      id="dropdownMenuButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <FormattedMessage
                        id="layout.configuration.print_it"
                        defaultMessage="Print"
                      />
                    </button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButton"
                    >
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            <FormattedMessage
                              id="layout.configuration.1_in_1_tooltip"
                              defaultMessage="Default margin and font size"
                            />
                          </Tooltip>
                        }
                      >
                        <button
                          className="dropdown-item"
                          data-print-type="one-in-one"
                          onClick={e => {
                            this.print(e);
                          }}
                        >
                          <FormattedMessage
                            id="layout.configuration.1_in_1"
                            defaultMessage="Full page"
                          />
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            <FormattedMessage
                              id="layout.configuration.2_in_1_tooltip"
                              defaultMessage="12mm margin and 110% font size. Remember to change the pages per sheet in your printer configuration."
                            />
                          </Tooltip>
                        }
                      >
                        <button
                          className="dropdown-item"
                          data-print-type="two-in-one"
                          onClick={e => {
                            this.print(e);
                          }}
                        >
                          <FormattedMessage
                            id="layout.configuration.2_in_1"
                            defaultMessage="Two ine one"
                          />
                        </button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            <FormattedMessage
                              id="layout.configuration.4_in_1_tooltip"
                              defaultMessage="5mm margin and 130% font size. Remember to change the pages per sheet in your printer configuration."
                            />
                          </Tooltip>
                        }
                      >
                        <button
                          className="dropdown-item"
                          data-print-type="four-in-one"
                          onClick={e => {
                            this.print(e);
                          }}
                        >
                          <FormattedMessage
                            id="layout.configuration.4_in_1"
                            defaultMessage="Four ine one"
                          />
                        </button>
                      </OverlayTrigger>
                    </div>
                  </div>

                  <div className="dropdown d-inline ml-2">
                    <button
                      className="btn btn-secondary btn-lg dropdown-toggle"
                      type="button"
                      id="dropdownMenuButtonAccordion"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <FormattedMessage
                        id="layout.configuration.hide_show"
                        defaultMessage="Hide / show"
                      />
                    </button>
                    <div
                      className="dropdown-menu"
                      aria-labelledby="dropdownMenuButtonAccordion"
                    >
                      <button
                        className="dropdown-item"
                        data-action="hide"
                        onClick={e => {
                          Header.hideShow(e);
                        }}
                      >
                        <FormattedMessage
                          id="layout.configuration.hide_all"
                          defaultMessage="Hide all"
                        />
                      </button>
                      <button
                        className="dropdown-item"
                        data-action="show"
                        onClick={e => {
                          Header.hideShow(e);
                        }}
                      >
                        <FormattedMessage
                          id="layout.configuration.show_all"
                          defaultMessage="Show all"
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-lg ml-2"
                    onClick={e => {
                      this.props.setRosterKey(null);
                      this.props.setRosterJson(null);
                      e.preventDefault();
                    }}
                  >
                    <FormattedMessage
                      id="layout.configuration.reset"
                      defaultMessage="Reset"
                    />
                  </button>
                </>
              ) : (
                <div>
                  <RoszUploader />
                  <button
                    className="d-block btn btn-block btn-link"
                    onClick={e => {
                      this.props.setRosterKey(null);
                      this.props.setRosterJson(DefaultData.roster);
                      e.preventDefault();
                    }}
                  >
                    <FormattedMessage
                      id="layout.configuration.load_example"
                      defaultMessage="Load the example"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Modal
            show={modalShow}
            onHide={() => this.setState({ modalShow: false })}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                <FormattedMessage
                  id="layout.configuration.share_title"
                  defaultMessage="Share your roster"
                />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder=""
                  aria-label=""
                  aria-describedby="Share link"
                  defaultValue={this.getRosterLink()}
                />
                <div className="input-group-prepend">
                  <CopyToClipboard text={this.getRosterLink()}>
                    <button className="btn btn-outline-secondary" type="button">
                      <FormattedMessage
                        id="layout.configuration.copy_clipboard"
                        defaultMessage="Copy to clipboard"
                      />
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => this.setState({ modalShow: false })}>
                <FormattedMessage
                  id="layout.configuration.close"
                  defaultMessage="Close"
                />
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
        <a
          href="https://github.com/p-bizouard/RosterViewer"
          className={s.forkMeOnGithub}
        >
          <img
            width="149"
            height="149"
            src="https://github.blog/wp-content/uploads/2008/12/forkme_right_red_aa0000.png?resize=149%2C149"
            alt="Fork me on GitHub"
            data-recalc-dims="1"
          />
        </a>
      </div>
    );
  }
}

const mapState = state => ({
  roster: state.roster,
});

const mapDispatch = {
  setRuntimeVariable,
  setRosterKey,
  setRosterJson,
  saveRosterRosz,
  initRosterFromKey,
};
export default injectIntl(
  connect(mapState, mapDispatch)(withStyles(s)(Header)),
);

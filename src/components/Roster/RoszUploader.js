import React, { createRef } from 'react';
import Dropzone from 'react-dropzone';
import xml2js from 'xml2js';
import PropTypes from 'prop-types';

import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { setRuntimeVariable } from '../../actions/runtime';
import { setRosterJson } from '../../actions/roster';

// App component - represents the whole app
class RoszUploader extends React.Component {
  static propTypes = {
    setRuntimeVariable: PropTypes.func.isRequired,
    setRosterJson: PropTypes.func.isRequired,
  };

  static toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  constructor() {
    super();
    this.onDrop = files => {
      this.readRosz(files[0]);
    };
  }

  readRosz(file) {
    window.zip.createReader(
      new window.zip.BlobReader(file),
      reader => {
        // get all entries from the zip
        reader.getEntries(entries => {
          if (entries.length) {
            entries[0].getData(new window.zip.TextWriter(), text => {
              const parser = new xml2js.Parser();

              parser.parseString(text, async (err, result) => {
                this.props.setRuntimeVariable({
                  name: 'rosz',
                  value: await RoszUploader.toBase64(file),
                });

                const readerB64 = new FileReader();
                readerB64.onload = function() {
                  this.props.setRuntimeVariable({
                    name: 'rosz',
                    value: Buffer.from(readerB64.result).toString('base64'),
                  });
                };
                readerB64.readAsArrayBuffer(file);

                this.props.setRosterJson(result.roster);
              });

              // close the zip reader
              reader.close(() => {
                // onclose callback
              });
            });
          }
        });
      },
      error => {
        console.error(error);
        // onerror callback
      },
    );
  }
  render() {
    const dropzoneRef = createRef();
    const openDialog = () => {
      // Note that the ref is set async,
      // so it might be null at some point
      if (dropzoneRef.current) {
        dropzoneRef.current.open();
      }
    };

    return (
      <Dropzone ref={dropzoneRef} onDrop={this.onDrop} accept=".rosz,.zip,.txt">
        {({ getRootProps, getInputProps }) => (
          <div className="btn btn-primary btn-lg">
            <div {...getRootProps({ className: 'dropzone' })}>
              <FormattedMessage
                id="uploader.title"
                defaultMessage="Upload your roster file (with .rosz extension)"
              />
              <input {...getInputProps()} />
              <br />
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={openDialog}
              >
                <FormattedMessage
                  id="uploader.open_file"
                  defaultMessage="Open file"
                />
              </button>
            </div>
          </div>
        )}
      </Dropzone>
    );
  }
}

const mapState = state => ({
  printType: state.runtime.printType,
  roster: state.runtime.roster,
});

const mapDispatch = {
  setRuntimeVariable,
  setRosterJson,
};
export default injectIntl(connect(mapState, mapDispatch)(RoszUploader));

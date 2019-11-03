import React, { Component, createRef } from 'react';
import Dropzone from 'react-dropzone';
import xml2js from 'xml2js';

import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { setRuntimeVariable } from '../../actions/runtime';
import { setRosterJson } from '../../actions/roster';

// App component - represents the whole app
class RoszUploader extends React.Component {
  constructor() {
    super();
    this.onDrop = files => {
      this.readRosz(files[0]);
      this.setState({ files });
    };
    this.state = {
      files: [],
    };
  }

  toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  readRosz(file) {
    const _this = this;

    const { setRuntimeVariable, setRosterJson } = this.props;

    const callbackApp = this.props.callbackApp;
    zip.createReader(
      new zip.BlobReader(file),
      reader => {
        // get all entries from the zip
        reader.getEntries(entries => {
          if (entries.length) {
            entries[0].getData(
              new zip.TextWriter(),
              text => {
                const parser = new xml2js.Parser();

                parser.parseString(text, async (err, result) => {
                  setRuntimeVariable({
                    name: 'rosz',
                    value: await _this.toBase64(file),
                  });

                  const reader_b64 = new FileReader();
                  reader_b64.onload = function(e) {
                    setRuntimeVariable({
                      name: 'rosz',
                      value: new Buffer(reader_b64.result).toString('base64'),
                    });
                  };
                  reader_b64.readAsArrayBuffer(file);

                  setRosterJson(result.roster);
                });

                // close the zip reader
                reader.close(() => {
                  // onclose callback
                });
              },
              (current, total) => {
                // onprogress callback
              },
            );
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
    const files = this.state.files.map(file => (
      <li key={file.name}>
        {file.name} - {file.size} bytes
      </li>
    ));

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
        {({ getRootProps, getInputProps, isDragActive }) => (
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

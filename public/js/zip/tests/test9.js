const URL = 'lorem.zip';

const zipFs = new zip.fs.FS();

function onerror(message) {
  console.error(message);
}

function zipImportedZip(callback) {
  const directory = zipFs.root.addDirectory('import');
  directory.importHttpContent(
    URL,
    false,
    () => {
      zipFs.exportBlob(callback);
    },
    onerror,
  );
}

function unzipBlob(blob, callback) {
  zipFs.importBlob(
    blob,
    () => {
      const directory = zipFs.root.getChildByName('import');
      const firstEntry = directory.children[0];
      firstEntry.getText(callback);
    },
    onerror,
  );
}

function logText(text) {
  console.log(text);
  console.log('--------------');
}

zipImportedZip(zippedBlob => {
  unzipBlob(zippedBlob, unzippedText => {
    logText(unzippedText);
  });
});

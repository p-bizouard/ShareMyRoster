const zipFs = new zip.fs.FS();

function onerror(message) {
  console.error(message);
}

function logText(text) {
  console.log(text);
  console.log('--------------');
}

zipFs.importHttpContent(
  'lorem.zip',
  false,
  () => {
    const firstEntry = zipFs.root.children[0];
    firstEntry.getText(data => {
      logText(data);
    });
  },
  onerror,
);

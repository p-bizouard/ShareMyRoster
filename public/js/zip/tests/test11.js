const requestFileSystem =
  window.webkitRequestFileSystem ||
  window.mozRequestFileSystem ||
  window.msRequestFileSystem ||
  window.requestFileSystem;
let URL = 'lorem.zip',
  FILENAME = 'lorem.txt';
let filesystem,
  zipFs = new zip.fs.FS();

function onerror(message) {
  console.error(message);
}

function removeRecursively(entry, onend, onerror) {
  const rootReader = entry.createReader();
  rootReader.readEntries(entries => {
    let i = 0;

    function next() {
      i++;
      removeNextEntry();
    }

    function removeNextEntry() {
      const entry = entries[i];
      if (entry) {
        if (entry.isDirectory) removeRecursively(entry, next, onerror);
        if (entry.isFile) entry.remove(next, onerror);
      } else onend();
    }

    removeNextEntry();
  }, onerror);
}

function importZipToFilesystem(callback) {
  zipFs.importHttpContent(
    URL,
    false,
    () => {
      filesystem.root.getFile(
        FILENAME,
        {
          create: true,
        },
        fileEntry => {
          const zippedFile = zipFs.root.getChildByName(FILENAME);
          zippedFile.getFileEntry(fileEntry, callback, null, onerror);
        },
        onerror,
      );
    },
    onerror,
  );
}

function logFile(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    console.log(event.target.result);
    console.log('--------------');
  };
  reader.onerror = onerror;
  reader.readAsText(file);
}

function test() {
  importZipToFilesystem(() => {
    filesystem.root.getFile(
      FILENAME,
      null,
      fileEntry => {
        fileEntry.file(logFile, onerror);
      },
      onerror,
    );
  }, onerror);
}

requestFileSystem(
  TEMPORARY,
  4 * 1024 * 1024 * 1024,
  fs => {
    filesystem = fs;
    removeRecursively(filesystem.root, test, onerror);
  },
  onerror,
);

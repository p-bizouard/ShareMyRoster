const requestFileSystem =
  window.webkitRequestFileSystem ||
  window.mozRequestFileSystem ||
  window.msRequestFileSystem ||
  window.requestFileSystem;
let filesystem,
  zipFs = new zip.fs.FS();
const THRESHOLD = 150;

function onerror(message) {
  console.error(message);
}

function generateFs(entry, onend, onerror) {
  let i = 0;

  function next() {
    i++;
    generateNextEntry();
  }

  function generateNextEntry() {
    if (i <= THRESHOLD)
      entry.getFile(
        i,
        {
          create: true,
        },
        next,
        onerror,
      );
    else onend();
  }

  next();
}

function checkZipFileSystemSize() {
  zipFs.root.addFileEntry(
    filesystem.root,
    () => {
      console.log(zipFs.root.children.length === THRESHOLD);
    },
    onerror,
  );
}

requestFileSystem(
  TEMPORARY,
  4 * 1024 * 1024 * 1024,
  fs => {
    filesystem = fs;
    generateFs(filesystem.root, checkZipFileSystemSize, onerror);
  },
  onerror,
);

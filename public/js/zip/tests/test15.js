function onerror(message) {
  console.error(message);
}

function zipBlobs(blobs, callback) {
  zip.createWriter(
    new zip.BlobWriter('application/zip'),
    zipWriter => {
      let index = 0;

      function next() {
        if (index < blobs.length)
          zipWriter.add(
            blobs[index].name,
            new zip.BlobReader(blobs[index].blob),
            () => {
              index++;
              next();
            },
          );
        else zipWriter.close(callback);
      }

      next();
    },
    onerror,
  );
}

function unzipBlob(blob) {
  zip.createReader(
    new zip.BlobReader(blob),
    zipReader => {
      zipReader.getEntries(entries => {
        entries.forEach(readEntry);
      });
    },
    onerror,
  );

  function readEntry(ent, i) {
    let lastLogPos = 0;
    ent.getData(
      new zip.BlobWriter(),
      blob => {
        console.log(`finished:${ent.filename}, size:${blob.size}`);
        compareResult(blob, i);
      },
      (loaded, size) => {
        if (loaded - lastLogPos > 100 * 1024) {
          // limit progress log
          console.log(
            `onprogress:${ent.filename}, loaded:${loaded}, size:${size}`,
          );
          lastLogPos = loaded;
        }
      },
      true,
    ); // check crc32
  }
}

function compareResult(result, index) {
  let fr1 = new FileReader(),
    fr2 = new FileReader(),
    loadCount = 0;
  fr1.readAsArrayBuffer(blobs[index].blob);
  fr2.readAsArrayBuffer(result);
  fr1.onload = fr2.onload = function onload() {
    if (++loadCount === 2) {
      let a1 = new Float64Array(fr1.result),
        a2 = new Float64Array(fr2.result);
      if (a1.length !== a2.length) return fail();
      for (let i = 0, n = a1.length; i < n; i++) {
        if (a1[i] !== a2[i]) return fail();
      }
      console.log(`compareResult OK at: ${blobs[index].name}`);
    }
  };
  function fail() {
    console.error(`Error: compareBlobs failed at: ${blobs[index].name}`);
  }
}

function getBlob(size) {
  const data = new Float64Array(Math.floor(size / 8));
  const rand = Math.random;
  for (let i = 0, n = data.length; i < n; i++) data[i] = rand();
  return new Blob([data]);
}

const MB = 1024 * 1024;
var blobs = [
  {
    name: 'b1',
    blob: getBlob(3.5 * MB),
  },
  {
    name: 'b2',
    blob: getBlob(5.2 * MB),
  },
  {
    name: 'b3',
    blob: getBlob(4.7 * MB),
  },
  {
    name: 'b4',
    blob: getBlob(2.8 * MB),
  },
];

zipBlobs(blobs, zippedBlob => {
  unzipBlob(zippedBlob);
});

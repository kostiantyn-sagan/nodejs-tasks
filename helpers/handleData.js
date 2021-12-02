// Core
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { promisify } = require("util");

// Instruments
const Json2csv = require("./Json2csv");
const writeFile = promisify(fs.writeFile);

const handleData = async ({ data, meta, socket }) => {
  if (meta.format && !meta.archive) {
    const json2csv = new Json2csv({ data });

    const csv = json2csv.convert();

    return socket.write(Buffer.from(csv));
  }

  if (!meta.format && meta.archive) {
    await writeFile(
      path.join("data", "tmp.json"),
      JSON.stringify(data, null, 4)
    );
    const rs = fs.createReadStream(path.join("data", "tmp.json"));
    const arch = zlib.createGzip();

    return rs.pipe(arch).pipe(socket);
  }

  if (meta.format && meta.archive) {
    const json2csv = new Json2csv({ data });
    const csv = json2csv.convert();

    await writeFile(path.join("data", "tmp.csv"), csv);

    const rs = fs.createReadStream(path.join("data", "tmp.csv"));
    const arch = zlib.createGzip();

    return rs.pipe(arch).pipe(socket);
  }
};

module.exports = handleData;

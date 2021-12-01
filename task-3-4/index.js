const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Instruments
const Archiver = require("./archiver");

class Json2csv {
  constructor({ fileName, delimiter = ",", filter }) {
    this.delimiter = delimiter;
    this.filter = filter;
    this.fileName = path.resolve(fileName);
    this.readFile = promisify(fs.readFile);
    this.writeFile = promisify(fs.writeFile);
    this.access = promisify(fs.access);
  }

  async convert() {
    try {
      await this._checkFileExistence(this.fileName);
      await this._checkDelimiter(this.delimiter);
      this._checkFilter();

      let csv = "";
      const { delimiter } = this;
      const file = await this._readFile();
      const headers = this._getCSVHeader(file[0]);
      csv += headers;

      file.forEach((item) => {
        const row = this._getRow(item);
        csv += row;
      });

      await this._writeFile(csv);
    } catch ({ message }) {
      console.error(message);
    }
  }

  async _checkFileExistence(fileName) {
    try {
      await this.access(fileName, fs.constants.F_OK);
    } catch ({ message }) {
      throw new Error("file does not exists");
    }
  }

  async _checkDelimiter() {
    const isExists = [",", ";"].some((item) => this.delimiter === item);

    if (!isExists) {
      throw new Error(`delimiter should be one of coma or semicolon`);
    }
  }

  _checkFilter() {
    const { filter } = this;
    if (!Array.isArray(filter)) {
      throw new Error("filter should be an array");
    }

    if (!filter.length) {
      throw new Error("filter should not be empty array");
    }
  }

  _getRow(row) {
    let str = "";
    const { postId, id, name, email, body } = row;
    const { delimiter } = this;

    if (postId) {
      str += `${postId}${delimiter}`;
    }

    if (id) {
      str += `${id}${delimiter}`;
    }

    if (name) {
      str += `${name}${delimiter}`;
    }

    if (email) {
      str += `${email}${delimiter}`;
    }

    if (body) {
      const text = body.replace(/\n/g, "");
      str += `${text}`;
    }

    return `${str}\n`;
  }

  _getCSVHeader(object) {
    const headers = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        headers.push(key);
      }
    }

    if (!headers.length) {
      throw new Error("can not get headers");
    }

    const csvHeaders = `${headers.join(this.delimiter)}\n`;

    return csvHeaders;
  }

  async _writeFile(data) {
    try {
      const [name, ext] = this.fileName.split(".");
      await this.writeFile(`${name}.csv`, data, { encoding: "utf-8" });
    } catch ({ message }) {
      console.error(message);
    }
  }

  async _readFile() {
    try {
      const source = await this.readFile(this.fileName, { encoding: "utf-8" });
      const file = JSON.parse(source);

      if (!Array.isArray(file)) {
        throw new Error("file should be an array");
      }

      const data = this._filter(file);

      return data;
    } catch ({ message }) {
      console.error(message);
    }
  }

  _filter(data) {
    const { filter } = this;
    const source = data.map((item) => {
      const obj = {};
      for (const key in item) {
        const isExist = filter.some((field) => field === key);
        if (isExist) {
          obj[key] = item[key];
        }
      }

      return obj;
    });

    return source;
  }
}

const json2csv = new Json2csv({
  fileName: "comments.json",
  filter: ["postId", "name", "body"],
});

(async () => {
  try {
    await json2csv.convert();

    const archiver = new Archiver(
      { fileName: "comments.csv" },
      { algorithm: "deflate" }
    );
    archiver.zip();
    archiver.on("finishArch", () => {
      console.log("archiver is created");

      archiver.unzip();
      archiver.on("finishUnzip", () => {
        console.log("archiver is unzipped");
      });
    });
  } catch ({ message }) {
    console.error(message);
  }
})();

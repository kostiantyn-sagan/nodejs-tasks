const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const EventEmitter = require("events");
const { promisify } = require("util");

class Archiver extends EventEmitter {
  constructor({ fileName }, options = {}) {
    super();
    this._validateOptions(options);

    this.options = options;
    this.fileName = path.resolve(fileName);
    this.readFile = promisify(fs.readFile);
    this.writeFile = promisify(fs.writeFile);
    this.access = promisify(fs.access);
  }

  zip() {
    const { algorithm } = this.options;
    const rs = fs.createReadStream(this.fileName);
    const ws = fs.createWriteStream(`${this.fileName}.gz`);
    const zipper = this._getZipper(algorithm);

    rs.pipe(zipper)
      .on("error", ({ message }) => {
        throw new Error(message);
      })
      .pipe(ws)
      .on("close", () => {
        this.emit("finishArch");
      });
  }

  unzip() {
    const { algorithm } = this.options;
    const rs = fs.createReadStream(`${this.fileName}.gz`);
    const ws = fs.createWriteStream(`${this.fileName}.new`);
    const gunzip = this._getUnzipper(algorithm);

    rs.pipe(gunzip)
      .on("error", ({ message }) => {
        throw new Error(message);
      })
      .pipe(ws)
      .on("close", () => {
        this.emit("finishUnzip");
      });
  }

  _getZipper(algorithm) {
    let zipper = null;
    switch (algorithm) {
      case "gzip": {
        zipper = zlib.createGzip();
        break;
      }
      case "deflate": {
        zipper = zlib.createDeflate();
        break;
      }
      default:
        zipper = zlib.createGzip();
    }

    return zipper;
  }

  _getUnzipper(algorithm) {
    let unzipper = null;
    switch (algorithm) {
      case "gzip": {
        unzipper = zlib.createGunzip();
        break;
      }
      case "deflate": {
        unzipper = zlib.createInflate();
        break;
      }
      default:
        unzipper = zlib.createGunzip();
    }

    return unzipper;
  }

  _validateOptions(options) {
    const keys = [];
    const allowedProperties = ["algorithm"];
    const allowedAlgorithms = ["gzip", "deflate"];
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      const isExist = allowedProperties.some((item) => item === key);

      if (!isExist) {
        throw new Error(`options contains not allowed property ${key}`);
      }
    });

    const { algorithm } = options;

    const isExists = allowedAlgorithms.some((item) => item === algorithm);

    if (!isExists) {
      throw new Error(`not allowed algorithm '${algorithm}'`);
    }
  }

  async _checkFileExistence(fileName) {
    try {
      await this.access(fileName, fs.constants.F_OK);
    } catch ({ message }) {
      throw new Error("file does not exists");
    }
  }
}

module.exports = Archiver;

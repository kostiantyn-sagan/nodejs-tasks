const { promisify } = require("util");
const fs = require("fs");
const path = require("path");

class Json2csv {
  constructor({ data, delimiter = "," }) {
    this.delimiter = delimiter;
    if (!Array.isArray(data)) {
      throw new Error("data should be an array");
    }
    this.data = data;
  }

  convert() {
    try {
      let csv = "";
      const { delimiter } = this;
      const headers = this._getCSVHeader(this.data[0]);
      csv += headers;

      this.data.forEach((item) => {
        const {
          id,
          name: { first, last },
          phone,
          address: { zip, city, country, street },
          email,
        } = item;

        csv += `${id}${delimiter}${first}${delimiter}${last}${delimiter}${phone}${delimiter}${zip}${delimiter}${city}${delimiter}${country}${delimiter}${street}${delimiter}${email}\n`;
      });

      return csv;
    } catch ({ message }) {
      console.error(message);
    }
  }

  _getCSVHeader(object) {
    const headers = [];
    const extractHeaders = (object) => {
      for (const key in object) {
        if (Object.hasOwnProperty(key) && typeof object[key] !== "object") {
          headers.push(key);
        } else {
          extractHeaders(object[key]);
        }
      }
    };

    extractHeaders(object);

    if (!headers.length) {
      throw new Error("can not get headers");
    }

    const csvHeaders = `${headers.join(this.delimiter)}\n`;

    return csvHeaders;
  }
}

module.exports = Json2csv;

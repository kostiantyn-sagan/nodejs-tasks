const { Transform } = require("stream");

class Decryptor extends Transform {
  constructor(options = {}) {
    super(options);
  }

  _transform(customer, encoding, done) {
    const {
      payload: { email, password },
      payload,
      meta: { algorithm },
      meta,
    } = customer;

    this._validateAlgorithm(algorithm);

    const decryptedCustomer = {
      payload: {
        ...payload,
        email: this._fromHex(email, algorithm),
        password: this._fromHex(password, algorithm),
      },
      meta,
    };

    this.push(decryptedCustomer);
    done();
  }

  _fromHex(str, algorithm) {
    return Buffer.from(str, algorithm).toString();
  }

  _validateAlgorithm(algorithm) {
    const algorithms = ["hex", "base64"];
    const isExists = algorithms.some((item) => item === algorithm);

    if (!isExists) {
      this.emit(
        "error",
        new Error(`${Decryptor.name}: algorithm should be one of hex or base64`)
      );
    }
  }
}

module.exports = Decryptor;

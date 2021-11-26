const { Transform } = require("stream");
const { validate, validateFields } = require("../helpers");

class Guardian extends Transform {
  constructor(options = {}) {
    super(options);
  }

  _transform(customer, encoding, done) {
    const {
      payload: { email, password },
      payload,
      meta,
    } = customer;

    const encryptedCustomer = {
      payload: {
        ...payload,
        email: this._toHex(email),
        password: this._toHex(password),
      },
      meta,
    };

    const data = {
      data: encryptedCustomer,
      name: Guardian.name,
      instance: this,
    };

    validateFields(data);
    validate(data);

    this.push(encryptedCustomer);
    done();
  }

  _toHex(str) {
    return Buffer.from(str).toString("hex");
  }
}

module.exports = Guardian;

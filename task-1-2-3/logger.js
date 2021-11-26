const { Transform } = require("stream");
const { validate, validateFields } = require("../helpers");
const db = require("./db");

class Logger extends Transform {
  constructor(options = {}) {
    super(options);
  }

  _transform(customer, encoding, done) {
    const data = {
      data: customer,
      name: Logger.name,
      instance: this,
    };

    validateFields(data);
    validate(data);

    db.save(customer);

    this.push(customer);

    done();
  }
}

module.exports = Logger;

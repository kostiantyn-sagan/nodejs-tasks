const { Writable } = require("stream");
const { validate, validateFields } = require("../helpers");
const db = require("./db");

class AccountManager extends Writable {
  constructor(options = {}) {
    super(options);

    this._init();
  }

  _init() {
    this.on("finish", () => {
      console.log("--> Done <--");
      db.print();
    });
  }

  _write(customer, encoding, done) {
    const data = {
      data: customer,
      name: AccountManager.name,
      instance: this,
    };

    validateFields(data);
    validate(data);

    console.log(JSON.stringify(customer.payload, null, 2));
    done();
  }
}

module.exports = AccountManager;

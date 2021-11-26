const { Readable } = require("stream");

class Ui extends Readable {
  constructor(customers = [], options = {}) {
    super(options);

    this.customers = customers;
  }

  _read() {
    let customer = this.customers.shift();

    if (!customer) {
      this.push(null);
    } else {
      this.push(customer);
    }
  }
}

module.exports = Ui;

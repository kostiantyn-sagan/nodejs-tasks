const EventEmitter = require("events");

class Bank extends EventEmitter {
  constructor() {
    super();

    this.customers = [];
    this._init();
  }

  _init() {
    this.on("add", (personId, amount) => this._enroll(personId, amount));
  }

  register(customer) {
    this._validateCustomer(customer);
    this._checkForDuplicates(customer);

    const id = Date.now() + Math.floor(Math.random() * 10);
    customer.id = id;

    this.customers = [...this.customers, customer];

    return id;
  }

  _validateCustomer(customer) {
    if (customer && typeof customer !== "object") {
      this.emit("error", new Error("Customer should be an object"));
    }

    if (!customer.hasOwnProperty("name")) {
      this.emit("error", new Error("Customer should have a name property"));
    }

    if (!customer.hasOwnProperty("balance")) {
      this.emit("error", new Error("Customer should have a balance property"));
    }

    if (typeof customer.balance !== "number") {
      this.emit("error", new Error("Balance should a number"));
    }

    if (customer.balance < 0) {
      this.emit("error", new Error("Balance should be grater than 0"));
    }
  }

  _checkForDuplicates(customer) {
    const isCustomerExists = this.customers.some(
      ({ name }) => name === customer.name
    );

    if (isCustomerExists) {
      this.emit(
        "error",
        new Error(`Duplicated customer for name: ${customer.name}`)
      );
    }
  }

  _getCustomerById(personId) {
    const index = this.customers.findIndex(({ id }) => id === personId);
    const customer = this.customers[index];
  }

  _enroll(personId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("Amount should be grater than 0"));
    }

    const { customer, index } = this._getCustomerById(personId);
  }
}

const bank = new Bank();

const personId = bank.register({
  name: "Pitter Black",
  balance: 100,
});

bank.emit("add", personId, 20);
bank.emit("get", personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 120₴
});
bank.emit("withdraw", personId, 50);
bank.emit("get", personId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 70₴
});

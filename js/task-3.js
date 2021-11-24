const EventEmitter = require("events");

class Bank extends EventEmitter {
  constructor() {
    super();

    this.customers = [];
    this.init();
  }

  init() {
    this.on("add", (personId, amount) => this.addMoney(personId, amount));

    this.on("get", (personId, callback) => {
      if (typeof callback !== "function") {
        this.emit("error", new TypeError("сallback should be a function"));
      }

      const { customer } = this._getCustomerById(personId);

      callback(customer.balance);
    });

    this.on("withdraw", (personId, amount) => this._withdraw(personId, amount));

    this.on("send", (personFirstId, personSecondId, amount) =>
      this._send(personFirstId, personSecondId, amount)
    );

    this.on("changeLimit", (personId, limit) => {
      if (typeof limit !== "function") {
        this.emit("error", new TypeError("callback should be a function"));
      }

      const { idx } = this._getCustomerById(personId);

      this.customers[idx].limit = limit;
    });

    this.on("error", (error) => {
      console.error(`We have a problem: ${error.message}`);
      process.exit(1);
    });
  }

  register(customer) {
    this._validateCustomer(customer);
    this._checkForDuplicates(customer);

    customer.id = Date.now() + Math.floor(Math.random() * 10);

    this.customers = [...this.customers, customer];

    return customer.id;
  }

  _validateCustomer(customer) {
    if (customer && typeof customer !== "object") {
      this.emit("error", new Error("сustomer should be an object"));
    }

    if (!customer.hasOwnProperty("name")) {
      this.emit("error", new Error("сustomer should have a name property"));
    }

    if (!customer.hasOwnProperty("balance")) {
      this.emit("error", new Error("сustomer should have a balance property"));
    }

    if (!customer.hasOwnProperty("limit")) {
      this.emit("error", new Error("customer should have a limit property"));
    }

    if (typeof customer.balance !== "number") {
      this.emit("error", new Error("balance should a number"));
    }

    if (customer.balance <= 0) {
      this.emit("error", new Error("balance should be grater than 0"));
    }

    if (typeof customer.limit !== "function") {
      this.emit("error", new Error("customer limit should be a function"));
    }
  }

  _checkForDuplicates(customer) {
    const isCustomerExists = this.customers.some(
      ({ name }) => name === customer.name
    );

    if (isCustomerExists) {
      this.emit(
        "error",
        new Error(`duplicated customer for name: ${customer.name}`)
      );
    }
  }

  _getCustomerById(personId) {
    const idx = this.customers.findIndex(({ id }) => id === personId);
    const customer = this.customers[idx];

    if (!customer) {
      this.emit("error", new Error(`customer with id ${personId} not found`));
    }

    return { customer, idx };
  }

  addMoney(personId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("amount should be grater than 0"));
    }

    this._increaseBalance({ id: personId, amount });
  }

  _updateBalance({ customer, idx, balance, amount }) {
    this._checkLimit({ customer, amount });
    this.customers[idx] = { ...customer, balance };
  }

  _withdraw(personId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("amount should be grater than 0"));
    }

    this._decreaseBalance({ id: personId, amount });
  }

  _send(senderId, receiverId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("amount should be grater than 0"));
    }

    this._decreaseBalance({ id: senderId, amount });
    this._increaseBalance({ id: receiverId, amount });
  }

  _checkLimit({ customer, amount }) {
    const currentBalance = customer.balance;
    const futureBalance = customer.balance - amount;
    const checkLimit = customer.limit(amount, currentBalance, futureBalance);

    if (!checkLimit) {
      this.emit(
        "error",
        new Error(
          `can not perform an action for ${customer.name} due to account limitations`
        )
      );
    }
  }

  _increaseBalance({ id, amount }) {
    const { customer, idx } = this._getCustomerById(id);

    const balance = customer.balance + amount;

    this._updateBalance({ customer, idx, balance, amount });
  }

  _decreaseBalance({ id, amount }) {
    const { customer, idx } = this._getCustomerById(id);

    if (customer.balance - amount < 0) {
      this.emit(
        "error",
        new Error("customer does not have enough money for that transaction")
      );
    }

    const balance = customer.balance - amount;

    this._updateBalance({ customer, idx, balance, amount });
  }
}

const bank = new Bank();

const personId = bank.register({
  name: "Oliver White",
  balance: 700,
  limit: (amount) => amount < 10,
});

bank.emit("withdraw", personId, 5);

bank.emit("get", personId, (amount) => {
  console.log(`I have ${amount}₴`); // I have 695₴
});

// Вариант 1
bank.emit("changeLimit", personId, (amount, currentBalance, updatedBalance) => {
  return amount < 100 && updatedBalance > 700;
});

bank.emit("withdraw", personId, 15); // Error

// Вариант 2
bank.emit("changeLimit", personId, (amount, currentBalance, updatedBalance) => {
  return amount < 100 && updatedBalance > 700 && currentBalance > 800;
});

// Вариант 3
bank.emit("changeLimit", personId, (amount, currentBalance) => {
  return currentBalance > 800;
});

// Вариант 4
bank.emit("changeLimit", personId, (amount, currentBalance, updatedBalance) => {
  return updatedBalance > 900;
});

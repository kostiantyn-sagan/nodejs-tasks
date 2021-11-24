const EventEmitter = require("events");

class Bank extends EventEmitter {
  constructor() {
    super();

    this.customers = [];
    this._init();
  }

  _init() {
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

    if (typeof customer.balance !== "number") {
      this.emit("error", new Error("balance should a number"));
    }

    if (customer.balance <= 0) {
      this.emit("error", new Error("balance should be grater than 0"));
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

    const { customer, idx } = this._getCustomerById(personId);
    const balance = customer.balance + amount;

    this._updateBalance({ customer, idx, balance });
  }

  _updateBalance({ customer, idx, balance }) {
    this.customers[idx] = { ...customer, balance };
  }

  _withdraw(personId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("amount should be grater than 0"));
    }

    const { customer, idx } = this._getCustomerById(personId);

    if (customer.balance - amount < 0) {
      this.emit(
        "error",
        new Error("customer does not have enough money for that transaction")
      );
    }

    const balance = customer.balance - amount;

    this._updateBalance({ customer, idx, balance });
  }

  _send(senderId, receiverId, amount) {
    if (amount <= 0) {
      this.emit("error", new Error("amount should be grater than 0"));
    }

    const { customer: sender, idx: senderIdx } =
      this._getCustomerById(senderId);

    const { customer: receiver, idx: receiverIdx } =
      this._getCustomerById(receiverId);

    if (sender.balance - amount < 0) {
      this.emit(
        "error",
        new Error("customer does not have enough money for that transaction")
      );
    }

    this._updateBalance({
      customer: sender,
      idx: senderIdx,
      balance: sender.balance - amount,
    });

    this._updateBalance({
      customer: receiver,
      idx: receiverIdx,
      balance: receiver.balance + amount,
    });
  }
}

const bank = new Bank();

const personFirstId = bank.register({
  name: "Pitter Black",
  balance: 100,
});

const personSecondId = bank.register({
  name: "Oliver White",
  balance: 700,
});

bank.emit("send", personFirstId, personSecondId, 50);

bank.emit("get", personSecondId, (balance) => {
  console.log(`I have ${balance}₴`); // I have 750₴
});

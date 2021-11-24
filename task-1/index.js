const Ui = require("./ui");
const Guardian = require("./guardian");
const AccountManager = require("./accountManager");

const customers = [
  {
    name: "Pitter Black",
    email: "pblack@email.com",
    password: "pblack_123",
  },
  {
    name: "Oliver White",
    email: "owhite@email.com",
    password: "owhite_456",
  },
];

const uiOptions = {
  objectMode: true,
};

const guardianOptions = {
  readableObjectMode: true,
  writableObjectMode: true,
  decodeStrings: false,
};

const managerOptions = {
  objectMode: true,
};

const ui = new Ui(customers);
const guardian = new Guardian();
const manager = new AccountManager();

ui.pipe(guardian).pipe(manager);

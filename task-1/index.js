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

const credentials = {
  password: "very!Strong_pa$$wordNotverYSecur",
  algorithm: "aes-256-cbc",
  signAlgorithm: "RSA-SHA256",
};

const ui = new Ui(customers, uiOptions);
const guardian = new Guardian(credentials, guardianOptions);
const manager = new AccountManager(credentials, managerOptions);

ui.on("error", ({ message }) => {
  console.log(message);
  process.exit(1);
})
  .pipe(guardian)
  .on("error", ({ message }) => {
    console.log(message);
    process.exit(1);
  })
  .pipe(manager)
  .on("error", ({ message }) => {
    console.log(message);
    process.exit(1);
  });

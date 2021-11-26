const Ui = require("./ui");
const AccountManager = require("./accountManager");
const Decryptor = require("./decryptor");

const customers = [
  {
    payload: {
      name: "Pitter Black",
      email: "70626c61636b40656d61696c2e636f6d",
      password: "70626c61636b5f313233",
    },
    meta: {
      algorithm: "hex",
    },
  },
];

const uiOptions = {
  objectMode: true,
};

const decryptorOptions = {
  readableObjectMode: true,
  writableObjectMode: true,
  decodeStrings: false,
};

const managerOptions = {
  objectMode: true,
};

const ui = new Ui(customers, uiOptions);
const decryptor = new Decryptor(decryptorOptions);
const manager = new AccountManager(managerOptions);

ui.on("error", ({ message }) => {
  console.log(message);
  process.exit(1);
})
  .pipe(decryptor)
  .on("error", ({ message }) => {
    console.log(message);
    process.exit(1);
  })
  .pipe(manager)
  .on("error", ({ message }) => {
    console.log(message);
    process.exit(1);
  });

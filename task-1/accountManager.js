const { Writable } = require("stream");
const crypto = require("crypto");
const {
  validate,
  validateFields,
  Cipher,
  certificates,
} = require("../helpers");

class AccountManager extends Writable {
  constructor({ password, algorithm, signAlgorithm }, options = {}) {
    super(options);

    this.signAlgorithm = signAlgorithm;
    this.crypter = new Cipher({ password, algorithm });
    this._init();
    this.storage = [];
  }

  _init() {
    this.on("finish", () => {
      console.log("Finished\n");
      console.log(this.storage);
    });
  }

  _write(customer, encoding, done) {
    const {
      payload: { email, password },
      payload,
      meta: { signature },
      meta,
    } = customer;

    try {
      const verified = this._verify({ data: payload, signature });

      const decryptedPayload = {
        ...payload,
        email: this.crypter.decrypt(email),
        password: this.crypter.decrypt(password),
      };

      const updatedCustomer = {
        ...customer,
        ...{ payload: decryptedPayload },
        ...{ meta: { source: meta.source } },
      };

      const data = {
        data: updatedCustomer,
        name: AccountManager.name,
        instance: this,
      };

      validateFields(data);
      validate(data);

      this.storage.push(updatedCustomer);
    } catch (error) {
      this.emit("error", error);
    }

    done();
  }

  _verify({ data, signature }) {
    if (typeof data !== "object") {
      this.emit("error", new Error("data should be an object"));
    }

    const verifier = crypto.createVerify(this.signAlgorithm);

    verifier.update(JSON.stringify(data));
    verifier.end();

    const verified = verifier.verify(
      certificates.publicKey,
      Buffer.from(signature, "hex")
    );

    if (!verified) {
      this.emit("error", new Error("data is not verified"));
    }

    return verified;
  }
}

module.exports = AccountManager;

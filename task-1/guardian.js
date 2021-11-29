const { Transform } = require("stream");
const crypto = require("crypto");
const {
  validate,
  validateFields,
  Cipher,
  certificates,
} = require("../helpers");

class Guardian extends Transform {
  constructor({ password, algorithm, signAlgorithm }, options = {}) {
    super(options);

    this.signAlgorithm = signAlgorithm;
    this.crypter = new Cipher({ password, algorithm });
  }

  _transform(customer, encoding, done) {
    const {
      payload: { email, password },
      payload,
      meta,
    } = customer;

    try {
      const encryptedCustomer = {
        payload: {
          ...payload,
          email: this.crypter.encrypt(email),
          password: this.crypter.encrypt(password),
        },
        meta,
      };

      const signature = this._sign(encryptedCustomer.payload);

      encryptedCustomer.meta.signature = signature;

      const data = {
        data: encryptedCustomer,
        name: Guardian.name,
        instance: this,
      };

      validateFields(data);
      validate(data);

      this.push(encryptedCustomer);
    } catch (error) {
      this.emit("error", error);
    }

    done();
  }

  _sign(data) {
    if (typeof data !== "object") {
      this.emit("error", new Error("data should be an object"));
    }

    const sign = crypto.createSign(this.signAlgorithm);

    sign.update(JSON.stringify(data));

    const signature = sign.sign(certificates.privateKey).toString("hex");

    return signature;
  }
}

module.exports = Guardian;

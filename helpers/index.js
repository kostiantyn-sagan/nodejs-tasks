const crypto = require("crypto");
const certificates = require("./certificates");

const validate = ({ data, name, instance }) => {
  const { payload, meta } = data;

  if (typeof payload !== "object") {
    instance.emit("error", new Error(`${name}: payload should be an object`));
  }

  if (!payload.hasOwnProperty("name")) {
    instance.emit(
      "error",
      new Error(`${name}: payload should have required field name`)
    );
  }

  if (!payload.name) {
    instance.emit(
      "error",
      new Error(`${name}: payload.name should not be empty`)
    );
  }

  if (typeof payload.name !== "string") {
    instance.emit(
      "error",
      new Error(`${name}: payload.name should be a string`)
    );
  }

  if (!payload.hasOwnProperty("email")) {
    instance.emit(
      "error",
      new Error(`${name}: payload should have required field email`)
    );
  }

  if (!payload.email) {
    instance.emit(
      "error",
      new Error(`${name}: payload.email should not be empty`)
    );
  }

  if (typeof payload.email !== "string") {
    instance.emit(
      "error",
      new Error(`${name}: payload.email should be a string`)
    );
  }

  if (!payload.hasOwnProperty("password")) {
    instance.emit(
      "error",
      new Error(`${name}: payload should have required field password`)
    );
  }

  if (!payload.password) {
    instance.emit(
      "error",
      new Error(`${name}: payload.password should not be empty`)
    );
  }

  if (typeof payload.password !== "string") {
    instance.emit(
      "error",
      new Error(`${name}: payload.password should be a string`)
    );
  }
};

const validateFields = ({ data, name, instance }) => {
  const allowedFields = [
    "payload",
    "name",
    "email",
    "password",
    "meta",
    "source",
    "algorithm",
    "signature",
  ];

  for (const key in data) {
    if (data.hasOwnProperty(key) && typeof data[key] !== "object") {
      const isExist = allowedFields.some((field) => field === key);

      if (!isExist) {
        instance.emit(
          "error",
          new Error(`${name}: data contains not allowed field - ${key}`)
        );
      }
    } else {
      const isExist = allowedFields.some((field) => field === key);

      if (!isExist) {
        instance.emit(
          "error",
          new Error(`${name}: data contains not allowed field - ${key}`)
        );
      }

      validateFields({ data: data[key], name, instance });
    }
  }
};

class Crypter {
  constructor({
    password = "very!Strong_pa$$wordNotverYSecure",
    algorithm = "aes-256-cbc",
  }) {
    this.password = password;
    this.algorithm = algorithm;
    this.encoding = "utf8";
  }

  encrypt(str) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.password),
      iv
    );

    let encrypted = cipher.update(str, this.encoding);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const data = `${iv.toString("hex")}:${encrypted.toString("hex")}`;

    return data;
  }

  decrypt(source) {
    const [iv, str] = source.split(":");

    const cipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.password),
      Buffer.from(iv, "hex")
    );

    let decrypted = cipher.update(Buffer.from(str, "hex"), this.encoding);

    decrypted = Buffer.concat([decrypted, cipher.final()]);

    const data = decrypted.toString();

    return data;
  }
}

module.exports = { validate, validateFields, Crypter, certificates };

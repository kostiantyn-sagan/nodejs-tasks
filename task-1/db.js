const EventEmitter = require("events");

class Db extends EventEmitter {
  constructor() {
    super();

    this.storage = new Map();
    this._init();
  }

  _init() {
    this.on("save", ({ payload, meta } = {}) => {
      const id = Date.now() + Math.floor(Math.random() * 10);
      const log = {
        source: meta.source,
        payload,
        created: new Date(),
      };

      this.storage.set(id, log);
    });

    this.on("print", () => {
      console.log(this.storage);
    });
  }

  save(data) {
    this.emit("save", data);
  }

  print() {
    this.emit("print");
  }
}

module.exports = new Db();

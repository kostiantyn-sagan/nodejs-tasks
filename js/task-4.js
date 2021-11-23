class TimersManager {
  constructor() {
    this.timers = [];
    this.logs = [];
    this.timeout = 0;
  }

  add(timer, ...args) {
    if (!timer.name || typeof timer.name !== "string") {
      throw new Error(
        "The name field contains the wrong type, missing or empty string."
      );
    }

    if (!timer.delay || typeof timer.delay !== "number") {
      throw new Error("The delay field contains the wrong type or missing.");
    }

    if (timer.delay < 0 || timer.delay > 5000) {
      throw new Error("The delay field is less than 0 or more than 5000.");
    }

    if (timer.interval === "undefined" || typeof timer.interval !== "boolean") {
      throw new Error("The interval field contains the wrong type or missing.");
    }

    if (!timer.job || typeof timer.job !== "function") {
      throw new Error("The job field contains the wrong type or missing.");
    }

    if (timer.delay > this.timeout) {
      this.timeout = timer.delay;
    }

    this.timers = [...this.timers, { ...timer, args }];
    return this;
  }

  remove(timerName) {
    const ranTimer = this.timers.find(
      ({ name, id }) => name === timerName && id
    );

    ranTimer && ranTimer.interval
      ? clearInterval(ranTimer.id)
      : clearTimeout(ranTimer.id);

    this.timers = this.timers.filter(({ name }) => name !== ranTimer.name);
  }

  start() {
    this.timers = this.timers.map((timer) => {
      const { interval, job, delay, args, name } = timer;

      let id = null;

      const callback = () => {
        try {
          const result = args.length === 0 ? job() : job(...args);
          this._log({ name, result, args });
        } catch (error) {
          this._log({ name, result: undefined, args, error });
        }
      };

      interval
        ? (id = setInterval(callback, delay))
        : (id = setTimeout(callback, delay));

      this.kill();

      return { ...timer, id };
    });
  }

  stop() {
    this.timers = this.timers.map((timer) => {
      const { interval, job, delay, args, id } = timer;

      interval ? clearInterval(id) : clearTimeout(id);

      return { ...timer, id: null };
    });
  }

  pause(timerName) {
    const ranTimer = this.timers.find(
      ({ name, id }) => name === timerName && id
    );

    ranTimer && ranTimer.interval
      ? clearInterval(ranTimer.id)
      : clearTimeout(ranTimer.id);

    this.timers = this.timers.map((timer) => {
      if (timer.name === timerName) {
        return { ...timer, id: null };
      }

      return timer;
    });
  }

  resume(timerName) {
    const timerToResume = this.timers.find(({ name }) => name === timerName);

    const { interval, args, delay, job } = timerToResume;

    let id = null;

    interval
      ? (id = setInterval(
          () => (args.length === 0 ? job() : job(...args)),
          delay
        ))
      : (id = setTimeout(
          () => (args.length === 0 ? job() : job(...args)),
          delay
        ));

    this.timers = this.timers.map((timer) => {
      if (timer.name === timerName) {
        return { ...timer, id };
      }

      return timer;
    });
  }

  _log({ name, result, args, error }) {
    this.logs = !error
      ? [...this.logs, { name, in: args, out: result, created: new Date() }]
      : [
          ...this.logs,
          {
            name,
            in: args,
            out: result,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
            created: new Date(),
          },
        ];
  }

  print() {
    console.log(this.logs);
    return this.logs;
  }

  kill() {
    setTimeout(() => {
      this.stop();
    }, this.timeout + 10000);
  }
}

const manager = new TimersManager();

const t1 = {
  name: "t1",
  delay: 3000,
  interval: false,
  job: (a, b) => a + b,
};

const t2 = {
  name: "t2",
  delay: 2000,
  interval: false,
  job: () => {
    throw new Error("We have a problem!");
  },
};

const t3 = {
  name: "t3",
  delay: 5000,
  interval: false,
  job: (n) => n,
};

manager.add(t1, 1, 2);
manager.add(t2); // undefined
manager.add(t3, 1); // 1
manager.start();

setTimeout(() => {
  manager.print();
}, 20000);

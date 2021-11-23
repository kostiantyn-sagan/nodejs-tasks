class TimersManager {
  constructor() {
    this.timers = [];
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
      const { interval, job, delay, args } = timer;

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
}

const manager = new TimersManager();

const t1 = {
  name: "t1",
  delay: 1000,
  interval: false,
  job: () => {
    console.log("t1");
  },
};

const t2 = {
  name: "t2",
  delay: 1000,
  interval: false,
  job: (a, b) => a + b,
};

manager.add(t1);
manager.add(t2, 1, 2);
manager.start();
console.log(1);
manager.pause("t1");

// 1. Метод add должен добавлять таймер в очередь на выполнение. В качестве первого
// параметра этот метод принимает объект описывающий таймер, а все последующие
// параметры передаются как аргументы для callback функции таймера.
// 2. Вызовы метода add можно соединять manager.add(t1).add(t2, 1, 2);
// 3. Метод remove должен остановить определённый таймер и удалить его из очереди.
// 4. Метод start должен запустить все таймеры на выполнение.
// 5. Метод stop должен остановить все таймеры.
// 6. Метод pause приостанавливает работу конкретного таймера.
// 7. Метод resume запускает работу конкретного таймера
// 8. Таймеры могут быть как одноразовыми (выполнить задачу через определённый
// промежуток времени), так и периодическими (выполнять задачу с определённым
// интервалом).Если interval = true — таймер периодический.

// Обратите внимание!
// 1. TimeManager должен вызывать ошибку если поле name содержит неверный тип,
// отсутствует или пустая строка.
// 2. TimeManager должен вызывать ошибку если поле delay содержит неверный тип или
// отсутствует.
// 3. TimeManager должен вызывать ошибку если delay меньше 0 и больше 5000.
// 4. TimeManager должен вызывать ошибку если поле interval содержит неверный тип
// или отсутствует.
// 5. TimeManager должен вызывать ошибку если поле job содержит неверный тип или
// отсутствует.
// 6. TimeManager должен вызывать ошибку если запустить метод add после старта.
// 7. TimeManager должен вызывать ошибку если попытаться добавить таймер с именем
// котрое уже было добавлено.

// {
// name*: String, // timer name
// delay*: Number, // timer delay in ms
// interval*: Boolean, // is timer or interval
// job*: Function, // timer job
// }

// Core
const net = require("net");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Instruments
const { validateFilterObj, filterData } = require("./helpers");

const readFile = promisify(fs.readFile);

const server = net.createServer();
const PORT = process.env.PORT || 8080;

server.on("connection", (socket) => {
  console.log("New client connected!");

  socket.on("data", async (msg) => {
    try {
      const filter = JSON.parse(msg);
      validateFilterObj(filter);

      console.log(filter);

      const file = await readFile(path.join("data", "users.json"), {
        encoding: "utf-8",
      });
      const source = JSON.parse(file);

      const data = filterData({ data: source, filter });

      socket.write(JSON.stringify(data));
    } catch ({ message }) {
      socket.write(Buffer.from(`Error: ${message}`));
    }
  });

  socket.on("end", () => {
    console.log("Client is disconnected!");
  });
});

server.on("listening", () => {
  const { port } = server.address();
  console.log(`TCP Server started on port ${port}!`);
});

server.on("error", ({ message }) => {
  console.error(`Error: ${message}`);
});

server.listen(PORT);

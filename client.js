// Core
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { Socket } = require("net");

// Instruments
const writeFile = promisify(fs.writeFile);

const filter = {
  filter: {
    name: {
      first: "John",
    },
    address: {
      zip: "1234",
    },
  },
  meta: {
    format: "csv",
    archive: true,
  },
};

let socketData = [];
const client = new Socket();

client.connect(8080, () => {
  console.log("Connected!");
  socketData = [];
  client.write(JSON.stringify(filter));
});

client.on("data", async (data) => {
  if (data.includes("Error")) {
    client.emit("error", data.toString());
    client.destroy();
    return;
  }

  socketData.push(data);

  try {
    const { meta } = filter;

    if (meta.format && !filter.archive) {
      return await writeFile(
        path.join("data", "received.csv"),
        data.toString()
      );
    }

    console.log("Received data");
  } catch ({ message }) {
    client.emit("error", message);
  }

  client.destroy();
});

client.on("close", async () => {
  const { meta } = filter;

  try {
    let fileName = "received.json.gz";
    if (meta.format && meta.archive) {
      fileName = "received.csv.gz";
    }

    const arch = Buffer.concat(socketData);
    await writeFile(path.join("data", fileName), arch);
  } catch ({ message }) {
    console.log(message);
  }

  socketData = [];
  console.log("Connection closed!");
});

client.on("error", (error) => {
  console.log(error);
});

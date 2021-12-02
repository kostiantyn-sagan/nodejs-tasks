const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const { Socket } = require("net");

const writeFile = promisify(fs.writeFile);

const client = new Socket();
client.connect(8080, () => {
  console.log("Connected!");

  const filter = {
    name: {
      first: "John",
    },
    phone: "56",
    address: {
      city: "Kyiv",
    },
  };

  client.write(JSON.stringify(filter));
});

client.on("data", async (data) => {
  if (data.includes("Error")) {
    client.emit("error", data.toString());
    client.destroy();
    return;
  }

  try {
    await writeFile(
      path.join("data", "received.json"),
      JSON.stringify(JSON.parse(data.toString()), null, 4)
    );
    console.log("Received data");
  } catch ({ message }) {
    client.emit("error", message);
  }
});

client.on("close", () => {
  console.log("Connection closed!");
});

client.on("error", (error) => {
  console.log(error);
});

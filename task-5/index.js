const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const dirname = path.join(__dirname, "files");
const currentFiles = fs.readdirSync(dirname);

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const access = promisify(fs.access);

// update build/index.js file
const handleChangeAndRemove = async () => {
  const filteredCurrentFiles = currentFiles.filter((item) => {
    const { ext } = path.parse(item);

    const isJs = ext.includes("js");

    return isJs;
  });

  const files = await Promise.all(
    filteredCurrentFiles.map((item) => readFile(path.join("files", item)))
  );
  const bufferFiles = Buffer.concat([...files]);

  await writeFile(path.join("build", "bundle.js"), bufferFiles);
};

// get build/index.js file
const getBuildFile = async () => {
  let file = null;

  try {
    await access(path.join("build", "bundle.js"), fs.constants.F_OK);
    file = await readFile(path.join("build", "bundle.js"));
  } catch ({ message }) {
    await writeFile(path.join("build", "bundle.js"), "");
    file = await readFile(path.join("build", "bundle.js"));
  }

  return file;
};

handleChangeAndRemove();

// watcher
fs.watch(dirname, async (eventType, fileName) => {
  const { ext } = path.parse(fileName);
  const isJs = ext.includes("js");
  const file = getBuildFile();

  try {
    if (isJs) {
      if (eventType === "rename") {
        const index = currentFiles.indexOf(fileName);

        if (index >= 0) {
          currentFiles.splice(index, 1);
          handleChangeAndRemove();
          return;
        }

        currentFiles.push(fileName);
        const toAppend = await readFile(path.join("files", fileName));
        await appendFile(path.join("build", "bundle.js"), toAppend);

        return;
      }

      handleChangeAndRemove();
    }
  } catch ({ message }) {
    console.error(message);
  }
});

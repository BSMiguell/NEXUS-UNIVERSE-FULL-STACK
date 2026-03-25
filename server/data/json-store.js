const fs = require("fs");

function readJsonFile(filePath, errorMessage) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(errorMessage, error);
    process.exit(1);
  }
}

function persistJsonFile(filePath, data, label) {
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (error) => {
    if (error) {
      console.error(`Erro ao salvar ${label}:`, error);
    }
  });
}

module.exports = {
  persistJsonFile,
  readJsonFile,
};

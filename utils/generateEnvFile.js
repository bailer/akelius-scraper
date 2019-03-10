const fs = require("fs");
const path = require("path");

fs.writeFileSync(
  path.join(__dirname, "../.env"),
  `ENCRYPTION_KEY=${process.argv[2]}`
);

const crypt = require("../src/crypt");
const encPassword = crypt.encrypt(process.argv[2]);
console.log(encPassword);
console.log(crypt.decrypt(encPassword));

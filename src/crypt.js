"use strict";

require("dotenv").config();
const crypto = require("crypto");

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
const algorithm = "aes-256-cbc";

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv(algorithm, new Buffer(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  let textParts = text.split(":");
  let iv = new Buffer(textParts.shift(), "hex");
  let encryptedText = new Buffer(textParts.join(":"), "hex");
  let decipher = crypto.createDecipheriv(
    algorithm,
    new Buffer(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

module.exports = { decrypt, encrypt };

const nodemailer = require("nodemailer");
const crypt = require("./crypt");
var mailConfig;
if (process.env.NODE_ENV === "production") {
  // all emails are delivered to destination
  mailConfig = {
    host: "smtp.sennerby.se",
    port: 587,
    auth: {
      user: "noreply",
      pass: crypt.decrypt(
        "b4dc5ea33bce7a6058cbe280171eb5a1:6a5c0008972763575f56e7aa5e966920"
      )
    }
  };
} else {
  // all emails are catched by ethereal.email
  mailConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "terrell26@ethereal.email",
      pass: crypt.decrypt(
        "1fef7880fd028933bc77e6218561513d:8d472ea1e37adb0ecb8b30572f15c96e3729b4159a49f495784bfbf48a9ec793"
      )
    }
  };
}
let transport = nodemailer.createTransport(mailConfig);
module.exports = function sendEmail(to, subject, message) {
  const mailOptions = {
    from: "noreply@sennerby.se",
    to,
    subject,
    html: message
  };
  transport.sendMail(mailOptions, error => {
    if (error) {
      console.log(error);
    }
  });
};

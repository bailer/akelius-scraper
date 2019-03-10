const nodemailer = require("nodemailer");
const crypt = require("./crypt");
var mailConfig;
if (process.env.NODE_ENV === "production") {
  // all emails are delivered to destination
  mailConfig = {
    host: "smtp.migadu.com",
    port: 587,
    auth: {
      user: "noreply@sennerby.se",
      pass: crypt.decrypt(
        "660b257fe974cf448ba637afc6ba6894:433388a9c6ecf20c0936deed3fba9501"
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

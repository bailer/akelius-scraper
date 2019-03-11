const fs = require("fs");
const path = require("path");
const request = require("request-promise-native");
const cheerio = require("cheerio");
const jsonfile = require("jsonfile");
const _ = require("lodash");
const sendEmail = require("./src/send-email");
const handlebars = require("handlebars");
const baseUrl = "https://www.akelius.de";
const file = "./data/latestListings.json";
const searchUrl = "/sv/search/apartments/osten/berlin/list?region=Berlin-";
const areas = ["Kreuzberg", "Friedrichshain", "Mitte", "Neukölln"];

const handleResponse = ($, area, currentTime) => {
  const items = $("ul.list-links").children();
  const listings = {};
  items.each((i, elem) => {
    const price = $(".price", elem).text();
    const size = $(".areaSize", elem).text();
    const priceInt = parseInt(price.replace(" €", ""), 10);
    const url = `${baseUrl}${$("a", elem).attr("href")}`;
    if (priceInt <= 1000) {
      listings[elem.attribs.id] = {
        price,
        url,
        area,
        size,
        latestSeen: currentTime
      };
    }
  });
  return listings;
};

createHtmlMessage = context => {
  const source = fs.readFileSync(
    path.join(__dirname, "./src/templates/newListings.hbs"),
    "utf8"
  );
  var template = handlebars.compile(source);
  return template(context);
};

const main = async () => {
  try {
    const currentTime = new Date().toISOString();
    let savedListings;
    try {
      savedListings = await jsonfile.readFile(file);
    } catch (error) {
      savedListings = {};
    }
    let latestListings = {};
    await Promise.all(
      areas.map(async area => {
        try {
          const body = await request(
            encodeURI(`${baseUrl}${searchUrl}${area}`)
          );
          const listings = handleResponse(
            cheerio.load(body),
            area,
            currentTime
          );
          latestListings = { ...latestListings, ...listings };
        } catch (error) {
          console.warn(`Failed fetching for ${area}`, error);
        }
      })
    );
    try {
      fs.mkdirSync(path.join(__dirname, "./data"));
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }
    await jsonfile.writeFile(
      file,
      { ...savedListings, ...latestListings },
      { spaces: 2 }
    );
    const difference = _.difference(
      _.keys(latestListings),
      _.keys(savedListings)
    );
    if (!_.isEmpty(difference)) {
      console.info("Difference found, sending mail!");
      const message = createHtmlMessage({
        header: "New listings:",
        listings: latestListings
      });
      sendEmail("jakob@sennerby.se", "New listings on Akelius", message);
    } else {
      console.info("No difference found, checking again in 15 min");
    }
  } catch (error) {
    console.warn(error);
    return;
  }
};

setInterval(main, 900000); // every 15 min
main();

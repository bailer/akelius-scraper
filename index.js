const fs = require("fs");
const request = require("request-promise-native");
const cheerio = require("cheerio");
const jsonfile = require("jsonfile");
const _ = require("lodash");
const sendEmail = require("./src/send-email");
const handlebars = require("handlebars");
const baseUrl = "https://www.akelius.de";
const file = "./data/latestListings.json";
const searchUrl = "/sv/search/apartments/osten/berlin/list?region=Berlin-";
const areas = ["Kreuzberg", "Friedrichshain", "Mitte"];

const handleResponse = ($, area) => {
  const items = $("ul.list-links").children();
  const listings = {};
  items.each((i, elem) => {
    const price = $(".price", elem).text();
    const size = $(".areaSize", elem).text();
    const priceInt = parseInt(price.replace(" €", ""), 10);
    const url = `${baseUrl}${$("a", elem).attr("href")}`;
    if (priceInt <= 1000) {
      listings[elem.attribs.id] = { price, url, area, size };
    }
  });
  return listings;
};

createHtmlMessage = context => {
  const source = fs.readFileSync("./src/templates/newListings.hbs", "utf8");
  var template = handlebars.compile(source);
  return template(context);
};

const main = async () => {
  let savedListings;
  try {
    savedListings = await jsonfile.readFile(file);
  } catch (error) {
    savedListings = {};
  }
  let latestListings = {};
  await Promise.all(
    areas.map(async area => {
      const body = await request(`${baseUrl}${searchUrl}${area}`);
      const listings = handleResponse(cheerio.load(body), area);
      latestListings = { ...latestListings, ...listings };
    })
  );
  await jsonfile.writeFile(file, latestListings, { spaces: 2 });
  const difference = _.difference(
    _.keys(latestListings),
    _.keys(savedListings)
  );
  if (!_.isEmpty(difference)) {
    const message = createHtmlMessage({
      header: "New listings:",
      listings: latestListings
    });
    sendEmail("jakob@sennerby.se", "New listings on Akelius", message);
  }
};

main();

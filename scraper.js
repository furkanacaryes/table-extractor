const got = require("got");
const { JSDOM } = require("jsdom");

const semiRecoveredData = require("./recovered-1600.json");
const lateEntryIndexes = require("./lateEntryIndexes.json");

const errorLog = [];

const url = "https://www.nadirkitap.com/kitapara_sonuc.php";

const getResultsDOM = (window) => {
  const resultsNodeList = window.document.querySelectorAll(
    ".product-list > li"
  );

  if (!resultsNodeList.length) {
    throw new Error(`No result found with title "${title}"`);
  }

  const resultsDOM = [...resultsNodeList];

  console.log(`\n[200 OK] ${resultsDOM.length} results found.\n`);

  return resultsDOM;
};

const dig = (first) => {
  const author = first.querySelector("p").innerHTML;

  const infoSpan = first.querySelector(
    ".product-list-bottom > li:nth-child(2) span"
  );

  const clutter = infoSpan.querySelector("span");

  infoSpan.removeChild(clutter);

  const [publisher, release] = infoSpan.innerHTML
    .split(",")
    .map((text) => text.replace(" ", ""));

  return { author, publisher, release };
};

const scrape = () => {
  lateEntryIndexes.slice(-3).reduce(async (acc, index) => {
    const { title } = semiRecoveredData[index];

    try {
      const { body } = await got(url, {
        searchParams: {
          kelime: title,
        },
      });

      const { window } = new JSDOM(body);

      const resultsDOM = getResultsDOM(window);

      const [first] = resultsDOM;

      const { author, publisher, release } = dig(first);

      console.log({ title, author, publisher, release });

      // TODO: Compare against meta
      // TODO: Override then save semiRecoveredData
    } catch (error) {
      errorLog.push({ index, error });
    }
  }, null);
};

scrape();

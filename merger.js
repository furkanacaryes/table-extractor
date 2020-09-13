const fs = require("fs");
const healthyData = require("./extracted.healthy.json");
const corruptData = require("./extracted.corrupted.json");

/**
 * Used to separate potentially deleted registeries.
 */
const notFound = [];

/**
 * Used to separate overridden meta.
 */
const metas = [];

/**
 * Checks existence in healthy data, then saves separately
 * if not already existent. It means it belongs to on of late entries.
 * @param {entry} param0 Entry to check and separate if it qualifies
 */
const saveLateMeta = ({ title, ...meta }) => {
  const alreadyExistentMeta = healthyData.find(
    ({ author, publisher, translator, release }) => {
      return (
        author === meta.author &&
        publisher === meta.publisher &&
        release === meta.release &&
        translator === meta.translator
      );
    }
  );

  // ? isLateMeta
  if (!alreadyExistentMeta) {
    console.log("[NEW META] Saved to look up later");
    metas.push({ ...meta });
  }
};

/**
 * Merges healthy data onto corrupt data.
 * Saves meta prior to overriding if it qualifies.
 */
const merge = () => {
  healthyData.forEach((healthy) => {
    const target = corruptData.findIndex(
      ({ title }) => title === healthy.title
    );

    if (target < 0) {
      console.log(`[NOT FOUND] Probably deleted. '${healthy.title}'`);

      notFound.push(healthy);

      return;
    }

    saveLateMeta(corruptData[target]);

    corruptData[target] = healthy;
  });

  console.log(
    `${healthyData.length} entries have been overridden as corrected.`
  );
};

/**
 * Saves separated and overridden data persistently.
 */
const save = () => {
  fs.writeFileSync("recovered-1600.json", JSON.stringify(corruptData));
  fs.writeFileSync("metas.json", JSON.stringify(metas));

  if (notFound.length) {
    fs.writeFileSync("not-found.json", JSON.stringify(notFound));
  }
};

merge();
save();

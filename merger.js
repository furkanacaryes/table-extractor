const fs = require("fs");
const healthyData = require("./extracted.healthy.json");
const corruptData = require("./extracted.corrupted.json");

/**
 * Will be used to address the entries to scrape, later in querying.
 */
const lateEntryIndexes = [];

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
  corruptData.forEach((corrupt, index) => {
    const target = healthyData.findIndex(
      ({ title }) => title === corrupt.title
    );

    if (target < 0) {
      return lateEntryIndexes.push(index);
    }

    saveLateMeta(corrupt);

    corruptData[index] = healthyData[target];
  });

  console.log(
    `${healthyData.length} entries have been overridden as corrected.`
  );

  console.log(
    `${
      corruptData.length - healthyData.length
    } entries remaining to be corrected.`
  );

  console.log(
    `In this matter, ${metas.length} metas have been separated to be queried.`
  );
};

/**
 * Saves separated and overridden data persistently.
 */
const save = () => {
  fs.writeFileSync("recovered-1600.json", JSON.stringify(corruptData));
  fs.writeFileSync("metas.json", JSON.stringify(metas));
  fs.writeFileSync("lateEntryIndexes.json", JSON.stringify(lateEntryIndexes));
};

merge();
save();

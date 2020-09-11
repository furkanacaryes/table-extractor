const findTables = () => {
  const allTables = document.querySelectorAll("tbody");

  const tablesArr = Array.from(allTables);

  tablesArr.splice(0, 1); // ? Discard first sheet

  return tablesArr;
};

const tableToJSON = (table) => {
  const rows = Array.from(table.querySelectorAll("tr"));

  return rows.map((row) => {
    const columnElements = Array.from(row.querySelectorAll("td"));

    const columns = columnElements.map((element) => element.innerText);

    const [title, author, publisher, translator, release] = columns;

    return {
      title,
      author,
      publisher,
      translator,
      release,
    };
  });
};

const convertAll = (tables) => {
  return tables.reduce((all, table) => {
    const jsonTable = tableToJSON(table);

    return all.concat(jsonTable);
  }, []);
};

const tables = findTables();

const allJSON = convertAll(tables);

JSON.stringify(allJSON);

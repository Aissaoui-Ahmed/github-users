/* eslint-disable no-await-in-loop */
const fs = require('fs');
const moment = require('moment');
const accents = require('@aissaoui-ahmed/accents');
const data = require('@amcharts/amcharts4-geodata/json/data/countries2.json');
const { graphql } = require('@octokit/graphql');

const githubAPI = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

const countUsers = async () => {
  const countryCode = Object.keys(data);
  for (let i = 0; i < countryCode.length; i += 1) {
    const key = countryCode[i];
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const countryLow = data[key].maps[0];
      if (countryLow !== undefined) {
        const countryInfo = require(`../data/countries/${countryLow}.json`);
        const fileJSON = `./data/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}/${countryLow}.json`;
        const directory = `./data/${moment().format('YYYY')}/${moment().format('MM')}/${moment().format('DD')}`;
        if (!fs.existsSync(fileJSON)) {
          fs.mkdirSync(directory, { recursive: true });
          fs.writeFileSync(fileJSON, '[]');
        }

        const dataArray = JSON.parse(fs.readFileSync(fileJSON, { encoding: 'utf8' }));
        const condition = dataArray.some((x) => x.date === moment().format('YYYY-MM-DD'));
        if (!condition) {
          const list = [];
          for (let j = 0; j < countryInfo.length; j += 1) {
            const stateName = countryInfo[j].name;
            const stateID = countryInfo[j].id;
            if (accents.hasAccent(stateName)) {
              const searchResults = await githubAPI(`
                              query {
                                   search(
                                        query: "
                                             location:\\"${stateName}\\"
                                             location:\\"${accents.remove(stateName)}\\"
                                        ",
                                        type: USER
                                        )
                                   {userCount}
                                   }`);
              list.push({ users: searchResults.search.userCount, id: stateID });
            } else {
              const searchResults = await githubAPI(`
                              query {
                                   search(
                                        query: "location:\\"${stateName}\\"",
                                        type: USER
                                        )
                                        {userCount}
                                   }`);
              list.push({ users: searchResults.search.userCount, id: stateID });
            }
          }
          const oldFile = JSON.parse(fs.readFileSync(fileJSON, { encoding: 'utf8' }));
          const users = { date: moment().format('YYYY-MM-DD'), list };
          oldFile.push(users);
          fs.writeFileSync(fileJSON, JSON.stringify(oldFile, null, 2));
        }
      }
    }
  }
};

countUsers();

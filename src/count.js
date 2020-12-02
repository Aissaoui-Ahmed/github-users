/* eslint-disable no-await-in-loop */
const {
  existsSync,
  mkdirSync,
  writeFileSync,
  statSync,
} = require('fs');
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
        if (!existsSync(fileJSON)) {
          mkdirSync(directory, { recursive: true });
        }

        const { size } = statSync(directory);

        if (!size) {
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
          writeFileSync(fileJSON, JSON.stringify(list, null, 2));
        }
      }
    }
  }
};

countUsers();

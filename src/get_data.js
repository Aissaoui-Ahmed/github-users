const fs = require('fs');
const data = require('@amcharts/amcharts4-geodata/json/data/countries2.json');

const countryCode = Object.keys(data);
for (let i = 0; i < countryCode.length; i += 1) {
  const key = countryCode[i];
  if (Object.prototype.hasOwnProperty.call(data, key)) {
    const countryLow = data[key].maps[0];
    if (countryLow) {
      const countries = require(`@amcharts/amcharts4-geodata/json/${countryLow}.json`).features;
      const countryInfo = [];
      for (let j = 0; j < countries.length; j += 1) {
        countryInfo.push(countries[j].properties);
      }
      fs.writeFileSync(`./data/countries/${countryLow}.json`, JSON.stringify(countryInfo, null, 2));
    }
  }
}

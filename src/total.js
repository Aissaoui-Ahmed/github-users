const {
  writeFileSync,
  readdirSync,
  statSync,
} = require('fs');

function getFiles(dir, fileParam) {
  fileParam = fileParam || [];
  const files = readdirSync(dir);
  // eslint-disable-next-line no-restricted-syntax
  for (const i in files) {
    if (Object.prototype.hasOwnProperty.call(files, i)) {
      const name = `${dir}/${files[i]}`;
      if (statSync(name).isDirectory()) {
        getFiles(name, fileParam);
      } else {
        fileParam.push(name);
      }
    }
  }
  return fileParam;
}
const date = new Date()
  .toISOString()
  .split('-');
const dd = date[2].split('T')[0];
const mm = date[1];
const yyyy = date[0];
const paths = getFiles(`./data/${yyyy}/${mm}/${dd}`);

const arr = [];
paths.forEach((path, i, array) => {
  let total = 0;
  const data = require(`../${path}`);
  if (data[0] !== undefined) {
    if (data !== []) {
      data.forEach((element) => {
        total += element.users;
      });
      arr.push({ users: total, CNTRYNAME: path.slice(18).slice(0, -8) });
      if (path.slice(path, 18) !== array[i - 1]) {
        writeFileSync(`${path.slice(path, 18)}world.json`, JSON.stringify(arr, null, 2));
        console.log(`Create file: ${path.slice(path, 18)}world.json`);
      }
    }
  }
});

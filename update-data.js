let fs = require('fs');
const Papa = require('papaparse');

const outputDirectory = './website/data';

let bondData = parseCSV('./csv/bond-energies.csv', 'utf8');
let bondDataString = 'let bondData = new Map([';
for (const bond of bondData) {
  const bondType = bond.name.replaceAll(/[A-Za-z]+/g, '');
  const bondString = bond.name.split(/-|=|≡/).sort().toString().replace(',', bondType);
  bondDataString += `['${bondString}', ${bond.energy}],`;
}
bondDataString += '])\n\nexport { bondData };';
fs.writeFileSync(`${outputDirectory}/bond-data.js`, bondDataString);

let elementData = parseCSV('./csv/elements.csv', 'utf8');
let elementDataString = 'let elementData = new Map([';
for (const element of elementData) {
  elementDataString += `['${element.symbol}', ${JSON.stringify(fixProperties(element))}],`;
}
elementDataString += '])\n\nexport { elementData };';
fs.writeFileSync(`${outputDirectory}/element-data.js`, elementDataString);

function fixProperties(object) {
  for (const property in object) {
    if (!isNaN(object[property])) object[property] = +object[property];
    if (object[property] === 'TRUE') object[property] = true;
    if (object[property] === 'FALSE') object[property] = false;
  }
  return object;
}

function parseCSV(fileName) {
  let array = fs.readFileSync(fileName, 'utf8').split('\n');
  array[0] = array[0]
    .split(',')
    .map((x) => camelize(x))
    .toString();
  const csvString = array.join('\n').replaceAll('\r', '');
  return Papa.parse(csvString, { header: true }).data;
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

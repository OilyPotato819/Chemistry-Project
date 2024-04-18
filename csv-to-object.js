let fs = require('fs');

let bondData = fs.readFileSync('./csv/bond-energies.csv').toString().replaceAll('\r', '').split(/,|\n/);
let bondString = 'let bondData = new Map([\n';

for (let i = 0; i < bondData.length; i += 2) {
  bondString += `  ['${bondData[i]}', ${bondData[i + 1]}],\n`;
}

fs.writeFileSync('./website/bond-data.js', `${bondString}]);\n`);

import { bondData } from '../data/bond-data.js';

function getBondInfo(atom1, atom2) {
  const bondString = [atom1.symbol, atom2.symbol].sort().toString().replace(',', '-');
  const bde = bondData.get(bondString);
  const radiiSum = atom1.r + atom2.r;
  return { bde: bde, radiiSum: radiiSum };
}

export { getBondInfo };

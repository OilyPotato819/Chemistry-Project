let allBonds = [];
function getFormulas(atoms) {
  allBonds = [];
  for (let i = 0; i < atoms.length; i++) {
    atoms[i].checked = false;
  }
  for (let i = 0; i < atoms.length; i++) {
    if (!atoms[i].checked) {
      allBonds.push([]);
      findBonds(atoms[i]);
    }
  }
}

function findBonds(atom) {
  for (let i = 0; i < atom.bonds.length; i++) {
    allBonds[allBonds.length - 1].push(atom.symbol);
    atom.checked = true;
    if (atom.bonds[i].type === 'bond') {
      if (!atom.bonds[i].bondedAtom.checked) {
        findBonds(atom.bonds[i].bondedAtom);
      }
    }
  }
  if (allBonds[allBonds.length - 1].length < 2) allBonds.pop();
}
export { getFormulas };

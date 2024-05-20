const allBonds = [];
function getFormulas(atoms) {
  //   for (let atom in atoms) {
  //     atom.checked = false;
  //   }
  //   for (let atom in atoms) {
  //     atom.checked = true;
  //     findBonds(atom);
  //   }
}

function findBonds(atom) {
  for (bond in atom.bonds) {
    if (bond.type === 'bond') {
      if (!bond.bondedAtom.checked) {
        allBonds.push(bond.bondedAtom);
        findBonds(bond.bondedAtom);
      }
    }
  }
}
export { getFormulas };

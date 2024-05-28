function getBonds(atoms) {
  let allBonds = [];
  for (let i = 0; i < atoms.length; i++) {
    // console.log(atoms[i].bonds);
    for (let j = 0; j < atoms[i].bonds.length; j++) {
      if (atoms[i].bonds[j].type === "bond") {
        if (!allBonds.includes(atoms[i].bonds[j].getMirrorBond())) {
          allBonds.push(atoms[i].bonds[j]);
        }
      }
    }
  }
  return allBonds;
}

export { getBonds };

import { getBonds } from "./get-bonds.js";

function getFormulas(atoms) {
  // let formulas = [];
  // let bonds = getBonds(atoms);
  // if (bonds.length == 0) return;
  // for (let i = 0; i < bonds.length; i++) {
  //   const bondedAtoms = [bonds[i].parentAtom, bonds[i].bondedAtom];
  //   const spliceIndex = bonds.findIndex(
  //     (bond) =>
  //       bond !== bonds[i] &&
  //       bondedAtoms.includes(bond.parentAtom) &&
  //       bondedAtoms.includes(bond.bondedAtom)
  //   );
  //   if (spliceIndex !== -1) {
  //     bonds.splice(spliceIndex, 1);
  //     i--;
  //   }
  // }
  // function createFormula(startingAtoms) {
  //   let formulaAtoms = startingAtoms;
  //   bonds.splice(0, 1);
  //   for (let i = 0; i < bonds.length; i++) {
  //     let remove = false;
  //     let add;
  //     if (formulaAtoms.includes(bonds[i].parentAtom)) {
  //       add = bonds[i].bondedAtom;
  //       remove = true;
  //     }
  //     if (formulaAtoms.includes(bonds[i].bondedAtom)) {
  //       add = bonds[i].parentAtom;
  //       remove = true;
  //     }
  //     if (remove) {
  //       bonds.splice(bonds[i], 1);
  //       formulaAtoms.push(add);
  //       i--;
  //     }
  //   }
  //   let compoundType = "molecular";
  //   formulaAtoms.forEach(function (atom) {
  //     if (!atom.nonmetal) compoundType = "ionic";
  //   });
  //   formulaAtoms = formulaAtoms.map((atom) => atom.symbol);
  //   let atomCounts = {};
  //   formulaAtoms.forEach(function (atom) {
  //     if (atomCounts[atom]) {
  //       atomCounts[atom]++;
  //     } else {
  //       atomCounts[atom] = 1;
  //     }
  //   });
  //   formulas.push(orderAtoms(atomCounts, compoundType));
  //   if (bonds.length > 0) {
  //     createFormula([bonds[0].parentAtom, bonds[0].bondedAtom]);
  //   }
  // }
  // createFormula([bonds[0].parentAtom, bonds[0].bondedAtom]);
  // const compoundList = document.getElementById("list");
  // for (let i = 0; i < Array.from(formulas.length); i++) {
  //   if (compoundList.children.find((formula) => formula.innerHTML == formulas[i])) {
  //     formulas.splice(i, 1);
  //     i--;
  //   } else {
  //     const newEl = document.createElement("li");
  //     newEl.innerHTML = formulas[i];
  //     compoundList.appendChild(newEl);
  //   }
  // }
  // for (let i = 0; i < compoundList.children.length; i++) {
  //   if (!formulas.find((formula) => formula == compoundList.children[i].innerHTML)) {
  //     compoundList.removeChild(compoundList.children[i]);
  //   }
  // }
}

function orderAtoms(atomCounts, compoundType) {
  let formula = "";
  if (compoundType == "molecular") {
    const atoms = Object.keys(atomCounts);
    atoms.sort();
    if (atomCounts["C"]) {
      formula += `C${atomCounts["C"]}`;
      delete atomCounts["C"];
      atoms.splice(atoms.indexOf("C"), 1);
      if (atomCounts["H"]) {
        formula += `H${atomCounts["H"]}`;
        delete atomCounts["H"];
        atoms.splice(atoms.indexOf("H"), 1);
      }
    }
    if (atoms.length > 0) {
      atoms.forEach((atom) => {
        formula += `${atom}${atomCounts[atom]}`;
      });
    }
    formula = formula.replace("1", "");
  }
  return formula;
}

export { getFormulas };

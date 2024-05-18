import { calcAngle, calcDist, principalAngle } from './utils.js';

function calcForces(atoms, forces, elapsedTime, collision) {
  let electronPairs = [];
  let previousBonds = [];

  breakAllBonds(atoms[0], previousBonds);

  for (let i = 0; i < atoms.length - 1; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      if (i === 0) breakAllBonds(atom2, previousBonds);

      const atomAngle = calcAngle(atom1, atom2);
      let atomDist = calcDist(atom1, atom2);

      if (atomDist < atom1.r + atom2.r) {
        collision.resolve(atom1, atom2, atomAngle, atomDist);
        atomDist = atom1.r + atom2.r;
      }

      const hasPairs = addElectronPairs(atom1, atom2, previousBonds[i], atomAngle, atomDist, electronPairs);
      if (hasPairs) continue;

      const ljMagnitude = forces.lj(atomDist, atom1, atom2);
      atom1.applyForce(ljMagnitude, atomAngle, elapsedTime);
      atom2.applyForce(ljMagnitude, atomAngle + Math.PI, elapsedTime);
    }
  }

  for (const electronPair of sortElectronPairs(electronPairs)) {
    updateElectronPair(electronPair, forces, elapsedTime);
  }
}

function updateElectronPair(electronPair, forces, elapsedTime) {
  const { electron1, electron2, electronDist, atomAngle, atomDist } = electronPair;
  const atom1 = electron1.parentAtom;
  const atom2 = electron2.parentAtom;

  attractElectrons(electron1, electron2, forces, elapsedTime);

  const electronAngle1 = calcAngle(electron1.parentAtom, electron2);
  const electronAngle2 = calcAngle(electron2.parentAtom, electron1);

  const angleDiff = calcAngleDiff(atomAngle, electron1.angle, electron2.angle);

  const { morseMagnitude, shouldBond } = forces.morse(atom1, atom2, atomDist, electronDist, angleDiff);

  const morseAngle1 = morseMagnitude > 0 ? atomAngle : electronAngle1;
  const morseAngle2 = morseMagnitude > 0 ? atomAngle + Math.PI : electronAngle2;

  atom1.applyForce(morseMagnitude, morseAngle1, elapsedTime);
  atom2.applyForce(morseMagnitude, morseAngle2, elapsedTime);

  electron1.bondTimer -= elapsedTime;
  electron2.bondTimer -= elapsedTime;

  if (shouldBond) {
    atom1.createBond(atom2, electron1, electron2);
    atom2.createBond(atom1, electron2, electron1);
    electron1.bondTimer = electron1.bondCooldown;
    electron2.bondTimer = electron2.bondCooldown;
  }
}

function sortElectronPairs(electronPairs) {
  let sortedPairs = electronPairs.sort((a, b) => a.electronDist - b.electronDist);

  let usedElectrons = new Set();
  let uniquePairs = [];
  for (const pair of sortedPairs) {
    if (usedElectrons.has(pair.electron1) || usedElectrons.has(pair.electron2)) continue;
    uniquePairs.push(pair);
    usedElectrons.add(pair.electron1);
    usedElectrons.add(pair.electron2);
  }

  return uniquePairs;
}

function addElectronPairs(atom1, atom2, bonds1, atomAngle, atomDist, electronPairs) {
  // If bond one or bond two is a lone pair, skip.
  let hasPairs = false;

  for (let electron1 of atom1.bonds) {
    if (electron1.charge === 2) continue;
    for (let electron2 of atom2.bonds) {
      if (electron2.charge === 2) continue;

      const electronDist = calcDist(electron1, electron2);
      const bonded = bonds1[electron1.index].bondedElectron === electron2;

      electronPairs.push({
        electron1: electron1,
        electron2: electron2,
        electronDist: electronDist,
        atomAngle: atomAngle,
        atomDist: atomDist,
        bonded: bonded,
      });

      hasPairs = true;
    }
  }

  return hasPairs;
}

function attractElectrons(electron1, electron2, forces, elapsedTime) {
  const dist1 = calcDist(electron1, electron2.parentAtom);
  const dist2 = calcDist(electron2, electron1.parentAtom);

  const force1 = forces.electrostatic(electron1.charge, 9, dist1);
  const force2 = forces.electrostatic(electron2.charge, 9, dist2);

  const forceAngle1 = calcAngle(electron1, electron2.parentAtom);
  const forceAngle2 = calcAngle(electron2, electron1.parentAtom);

  const angle1 = forceAngle1 + Math.PI - electron1.angle;
  const angle2 = forceAngle2 + Math.PI - electron2.angle;

  electron1.applyTorque(force1, angle1, elapsedTime);
  electron2.applyTorque(force2, angle2, elapsedTime);
}

function calcAngleDiff(atomAngle, angle1, angle2) {
  const angleDiff1 = Math.abs(principalAngle(atomAngle + Math.PI) - principalAngle(angle1));
  const angleDiff2 = Math.abs(principalAngle(atomAngle) - principalAngle(angle2));

  const maxAngleDiff1 = Math.min(angleDiff1, 2 * Math.PI - angleDiff1);
  const maxAngleDiff2 = Math.min(angleDiff2, 2 * Math.PI - angleDiff2);

  return maxAngleDiff1 + maxAngleDiff2;
}

function breakAllBonds(atom, previousBonds) {
  previousBonds.push([...atom.bonds]);

  for (let i = 0; i < atom.bonds.length; i++) {
    const bond = atom.bonds[i];
    if (bond.charge === 2 || bond.type === 'electron') continue;
    atom.bonds[i] = bond.parentElectron;
  }
}

export { calcForces };

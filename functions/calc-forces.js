import { calcAngle, calcDist, principalAngle } from './utils.js';

function calcForces(atoms, forces, elapsedTime, collision) {
  let electronPairs = [];
  let atomPairs = [];

  prepareAtom(atoms[0], elapsedTime);

  for (let i = 0; i < atoms.length - 1; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      if (i === 0) prepareAtom(atom2, elapsedTime);

      const atomAngle = calcAngle(atom1, atom2);
      let atomDist = calcDist(atom1, atom2);

      if (atomDist < atom1.r + atom2.r) {
        collision.resolve(atom1, atom2, atomAngle, atomDist);
        atomDist = atom1.r + atom2.r;
      }

      addElectronPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs);
    }
  }

  const sortedPairs = electronPairs.sort((a, b) => a.electronDist - b.electronDist);
  for (const electronPair of sortedPairs) {
    updateElectronPair(electronPair, forces);
  }

  for (const atomPair of atomPairs) {
    let closestPair = atomPair[0];
    for (const electronPair of atomPair) {
      if (!electronPair.isBonded) continue;
      closestPair = electronPair;
      break;
    }

    const { magnitude, angle1, angle2 } = closestPair.morse;
    const electron1 = closestPair.electron1;
    const electron2 = closestPair.electron2;
    const atom1 = electron1.parentAtom;
    const atom2 = electron2.parentAtom;

    if (closestPair.morse.magnitude) {
      atom1.applyForce(magnitude, angle1, elapsedTime);
      atom2.applyForce(magnitude, angle2, elapsedTime);
    }

    if (closestPair.isBonded) attractElectrons(electron1, electron2, forces, elapsedTime);
  }
}

function updateElectronPair(electronPair, forces) {
  const { electron1, electron2, electronDist, atomAngle, atomDist, wasBonded } = electronPair;
  const atom1 = electron1.parentAtom;
  const atom2 = electron2.parentAtom;

  const bothUnbonded = atom1.bonds[electron1.index].type === 'single' && atom2.bonds[electron2.index].type === 'single';

  const electronAngle1 = calcAngle(electron1.parentAtom, electron2);
  const electronAngle2 = calcAngle(electron2.parentAtom, electron1);

  const angleDiff = calcAngleDiff(atomAngle, electron1.angle, electron2.angle);
  const { morseMagnitude, canBond } = forces.morse(atom1, atom2, atomDist, electronDist, angleDiff, bothUnbonded);

  const morseAngle1 = morseMagnitude > 0 ? atomAngle : electronAngle1;
  const morseAngle2 = morseMagnitude > 0 ? atomAngle + Math.PI : electronAngle2;

  electronPair.morse = { magnitude: morseMagnitude, angle1: morseAngle1, angle2: morseAngle2 };
  electronPair.isBonded = false;

  if (!canBond || !bothUnbonded) return;

  const onCooldown = electron1.bondTimer > 0 || electron2.bondTimer > 0;

  if (wasBonded || !onCooldown) {
    electronPair.isBonded = true;

    atom1.createBond(electron1, atom2, electron2);
    atom2.createBond(electron2, atom1, electron1);

    electron1.charge = 2;
    electron2.charge = 2;
  }

  if (!wasBonded && !onCooldown) {
    electron1.bondTimer = electron1.bondCooldown;
    electron2.bondTimer = electron2.bondCooldown;
  }
}

function addElectronPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs) {
  let newElectronPairs = [];

  // If bond one or bond two is a lone pair, skip.
  for (let electron1 of atom1.bonds) {
    if (electron1.type === 'double') continue;
    for (let electron2 of atom2.bonds) {
      if (electron2.type === 'double') continue;

      const electronDist = calcDist(electron1, electron2);
      const wasBonded = atom1.previousBonds[electron1.index].bondedElectron === electron2;

      const electronPair = {
        electron1: electron1,
        electron2: electron2,
        electronDist: electronDist,
        atomAngle: atomAngle,
        atomDist: atomDist,
        wasBonded: wasBonded,
      };

      electronPairs.push(electronPair);
      newElectronPairs.push(electronPair);
    }
  }

  atomPairs.push(newElectronPairs.sort((a, b) => a.electronDist - b.electronDist));
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

function prepareAtom(atom, elapsedTime) {
  atom.previousBonds = [...atom.bonds];

  for (let i = 0; i < atom.bonds.length; i++) {
    let bond = atom.bonds[i];

    if (bond.type === 'double') continue;

    if (bond.type === 'bond') {
      atom.bonds[i] = bond.parentElectron;
      bond = bond.parentElectron;
    }

    bond.bondTimer -= elapsedTime;
    bond.charge = 1;
  }
}

export { calcForces };
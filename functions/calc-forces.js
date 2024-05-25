import { calcAngle, calcDist, principalAngle } from './utils.js';

function calcForces(simulation) {
  const { atoms, forces, elapsedTime, collision, electronegativityFactor } = simulation;

  let electronPairs = [];
  let atomPairs = [];

  if (atoms[0].canCovalent()) prepareAtom(atoms[0], elapsedTime);

  for (let i = 0; i < atoms.length - 1; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      const atomAngle = calcAngle(atom1, atom2);
      let atomDist = calcDist(atom1, atom2);

      if (atomDist < atom1.r + atom2.r) {
        collision.resolve(atom1, atom2, atomAngle, atomDist);
        atomDist = atom1.r + atom2.r;
      }

      if (i === 0 && atom2.canCovalent()) prepareAtom(atom2, elapsedTime);

      const closestElectronPair = addElectronPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs, forces, elapsedTime);

      // Not covalent or ionic

      if (!atom1.canCovalent() || !atom2.canCovalent()) {
        const ljMagnitude = forces.lj(atomDist, atom1, atom2);
        atom1.applyForce(ljMagnitude, atomAngle, elapsedTime);
        atom2.applyForce(ljMagnitude, atomAngle + Math.PI, elapsedTime);
      }

      // Ionic Bond

      const isIonic = (atom1.nonmetal && !atom2.nonmetal) || (!atom1.nonmetal && atom2.nonmetal);

      if (isIonic && atom1.charge === 0 && atom2.charge === 0) {
        const metal = atom1.nonmetal ? atom2 : atom1;
        const nonmetal = atom1.nonmetal ? atom1 : atom2;

        attractElectrons(closestElectronPair.electron1, closestElectronPair.electron2, forces, elapsedTime);

        const bondDist = electronegativityFactor * Math.abs(atom1.electronegativity - atom2.electronegativity) + atom1.r + atom2.r;
        // console.log(metal.firstIonization, forces.electricPotential(1, atom2.atomicNumber, atomDist));
        if (atomDist < bondDist) {
          const maxTransferred = Math.max(metal.valency - metal.charge, nonmetal.valency + nonmetal.charge);
          metal.charge += maxTransferred;
          nonmetal.charge -= maxTransferred;
          atom1.transferElectron(closestElectronPair.electron1, closestElectronPair.electron2);
        }
      }

      // Ions

      if (atom1.charge != 0 && atom2.charge != 0) {
        const electrostaticMagnitude = forces.electrostatic(atom1.charge, atom2.charge, atomDist, true);
        const oppositeCharge = Math.sign(atom1.charge) != Math.sign(atom2.charge);
        const angle1 = oppositeCharge ? atomAngle + Math.PI : atomAngle;
        const angle2 = oppositeCharge ? atomAngle : atomAngle + Math.PI;

        atom1.applyForce(electrostaticMagnitude, angle1, elapsedTime);
        atom2.applyForce(electrostaticMagnitude, angle2, elapsedTime);
      }
    }
  }

  const sortedPairs = electronPairs.sort((a, b) => a.electronDist - b.electronDist);
  for (const electronPair of sortedPairs) {
    updateElectronPair(electronPair, forces);
  }

  for (const atomPair of atomPairs) {
    let closestPair = atomPair[0];
    for (const electronPair of atomPair) {
      if (!electronPair.isBondedTogether) continue;
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

    if (closestPair.isBondedTogether || closestPair.bothUnbonded) attractElectrons(electron1, electron2, forces, elapsedTime);
  }
}

function updateElectronPair(electronPair, forces) {
  const { electron1, electron2, electronDist, atomAngle, atomDist, wasBondedTogether } = electronPair;
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
  electronPair.bothUnbonded = bothUnbonded;
  electronPair.isBondedTogether = false;

  if (!canBond || !bothUnbonded) return;

  const onCooldown = electron1.bondTimer > 0 || electron2.bondTimer > 0;

  if (wasBondedTogether || !onCooldown) {
    electronPair.isBondedTogether = true;

    atom1.createBond(electron1, atom2, electron2);
    atom2.createBond(electron2, atom1, electron1);

    electron1.charge = 2;
    electron2.charge = 2;
  }

  if (!wasBondedTogether && !onCooldown) {
    electron1.bondTimer = electron1.bondCooldown;
    electron2.bondTimer = electron2.bondCooldown;
  }
}

function addElectronPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs, forces, elapsedTime) {
  const canCovalent = atom1.canCovalent() && atom2.canCovalent();
  let newElectronPairs = [];

  // If bond one or bond two is a lone pair, skip.
  for (let electron1 of atom1.bonds) {
    for (let electron2 of atom2.bonds) {
      const electronDist = calcDist(electron1, electron2);

      if (electron1.charge === 2 || electron2.charge === 2) {
        const electronAngle = calcAngle(electron1, electron2);
        const electrostaticMagnitude = forces.electrostatic(electron1.charge, electron2.charge, electronDist, false);

        // electron1.applyTorque(electrostaticMagnitude, electronAngle, elapsedTime);
        // electron2.applyTorque(electrostaticMagnitude, electronAngle + Math.PI, elapsedTime);
      }

      if (electron1.type != 'single' || electron2.type != 'single') continue;

      let electronPair = {
        electron1: electron1,
        electron2: electron2,
        electronDist: electronDist,
        atomAngle: atomAngle,
        atomDist: atomDist,
      };

      if (canCovalent) {
        electronPair.wasBondedTogether = atom1.previousBonds[electron1.index].bondedElectron === electron2;
        electronPairs.push(electronPair);
      }

      newElectronPairs.push(electronPair);
    }
  }

  if (newElectronPairs.length && canCovalent) {
    atomPairs.push(newElectronPairs.sort((a, b) => a.electronDist - b.electronDist));
  }

  return newElectronPairs[0];
}

function attractElectrons(electron1, electron2, forces, elapsedTime) {
  const dist1 = calcDist(electron1, electron2.parentAtom);
  const dist2 = calcDist(electron2, electron1.parentAtom);

  const force1 = forces.electrostatic(1, forces.nucleusCharge, dist1, false);
  const force2 = forces.electrostatic(1, forces.nucleusCharge, dist2, false);

  const forceAngle1 = calcAngle(electron1, electron2.parentAtom);
  const forceAngle2 = calcAngle(electron2, electron1.parentAtom);

  const angle1 = forceAngle1 + Math.PI;
  const angle2 = forceAngle2 + Math.PI;

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
  if (!atom.nonmetal) return;

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

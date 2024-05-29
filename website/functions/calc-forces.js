import { calcAngle, calcDist, principalAngle } from './utils.js';

function calcForces(simulation) {
  const { atoms, forces, elapsedTime, collision } = simulation;

  // every electron pair sorted
  // [electronPair, electronPair, electronPair]
  let electronPairs = [];

  // electron pairs between the same atoms grouped together and sorted
  // [[electronPair, electronPair, electronPair], [electronPair, electronPair]]
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

      if (atom1.canCovalent() && atom2.canCovalent()) {
        addCovalentPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs);
      }

      let ionicElectronPairs = getIonicPairs(atom1, atom2);

      // Lennard-Jones

      let ionicMaxBondLength;
      if (!atom1.canCovalent() || !atom2.canCovalent()) {
        const { magnitude, minimum } = forces.lj(atomDist, atom1, atom2);
        ionicMaxBondLength = minimum;
        atom1.applyForce(magnitude, atomAngle, elapsedTime);
        atom2.applyForce(magnitude, atomAngle + Math.PI, elapsedTime);
      }

      if (atom1.valency === 0 || atom2.valency === 0) continue;

      // Ionic Bond

      const isIonicPair = (atom1.nonmetal && !atom2.nonmetal) || (!atom1.nonmetal && atom2.nonmetal);
      const highDifference = Math.abs(atom1.electronegativity - atom2.electronegativity) > 1.7;

      if (isIonicPair && highDifference && atomDist < ionicMaxBondLength) {
        const metal = atom1.nonmetal ? atom2 : atom1;
        const nonmetal = atom1.nonmetal ? atom1 : atom2;

        const maxTransferred = Math.min(metal.valency - metal.charge, nonmetal.valency + nonmetal.charge);

        const metalKineticEnergy = forces.kineticEnergy(metal) + forces.kineticEnergy(nonmetal);

        let transferPairs = [];
        for (const electronPair of ionicElectronPairs) {
          if (transferPairs.length === maxTransferred) break;

          attractElectrons(electronPair.metal, electronPair.nonmetal, forces, elapsedTime);

          const potentialDist = calcDist(electronPair.metal, electronPair.nonmetal);
          const electricPotential = forces.electricPotential(potentialDist);
          const ionizationEnergy = metal.ionizationEnergies[metal.charge];

          if (electricPotential + metalKineticEnergy < ionizationEnergy) break;
          transferPairs.push(electronPair);
        }

        for (const electronPair of transferPairs) {
          metal.transferElectron(electronPair.metal, electronPair.nonmetal);
        }
      }

      // Ions

      if (atom1.charge != 0 && atom2.charge != 0) {
        const electrostaticMagnitude = forces.electrostatic(atom1.charge, atom2.charge, atomDist, forces.bondCoulomb);

        const oppositeCharges = Math.sign(atom1.charge) != Math.sign(atom2.charge);

        const angle1 = oppositeCharges ? atomAngle + Math.PI : atomAngle;
        const angle2 = oppositeCharges ? atomAngle : atomAngle + Math.PI;

        atom1.applyForce(electrostaticMagnitude, angle1, elapsedTime);
        atom2.applyForce(electrostaticMagnitude, angle2, elapsedTime);
      }
    }
  }

  const sortedPairs = electronPairs.sort((a, b) => a.electronDist - b.electronDist);
  for (const electronPair of sortedPairs) {
    const neutral1 = electronPair.electron1.parentAtom.charge === 0;
    const neutral2 = electronPair.electron2.parentAtom.charge === 0;
    if (neutral1 && neutral2) updateElectronPair(electronPair, forces);
  }

  for (const atomPair of atomPairs) {
    let closestPair = atomPair[0];

    const neutral1 = closestPair.electron1.parentAtom.charge === 0;
    const neutral2 = closestPair.electron2.parentAtom.charge === 0;
    if (!neutral1 || !neutral2) continue;

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

  const bothUnbonded = !electron1.bond && electron1.type === 'single' && !electron2.bond && electron2.type === 'single';

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

    const bond1 = atom1.createBond(electron1, atom2, electron2);
    const bond2 = atom2.createBond(electron2, atom1, electron1);
    bond1.mirrorBond = bond2;
    bond2.mirrorBond = bond1;

    electron1.charge = 2;
    electron2.charge = 2;
  }

  if (!wasBondedTogether && !onCooldown) {
    electron1.bondTimer = electron1.bondCooldown;
    electron2.bondTimer = electron2.bondCooldown;
  }
}

function addCovalentPairs(atom1, atom2, atomAngle, atomDist, electronPairs, atomPairs) {
  let newElectronPairs = [];

  for (let electron1 of atom1.unpairedElectrons) {
    for (let electron2 of atom2.unpairedElectrons) {
      const electronDist = calcDist(electron1, electron2);

      let electronPair = {
        electron1: electron1,
        electron2: electron2,
        electronDist: electronDist,
        atomAngle: atomAngle,
        atomDist: atomDist,
      };

      electronPair.wasBondedTogether = electron1.previousBond && electron1.previousBond.bondedElectron === electron2;
      electronPairs.push(electronPair);
      newElectronPairs.push(electronPair);
    }
  }

  if (newElectronPairs.length) {
    atomPairs.push(newElectronPairs.sort((a, b) => a.electronDist - b.electronDist));
  }
}

function attractElectrons(electron1, electron2, forces, elapsedTime) {
  const dist1 = calcDist(electron1, electron2.parentAtom);
  const dist2 = calcDist(electron2, electron1.parentAtom);

  const force1 = forces.electrostatic(1, forces.nucleusCharge, dist1, forces.attractionCoulomb);
  const force2 = forces.electrostatic(1, forces.nucleusCharge, dist2, forces.attractionCoulomb);

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

  for (const bond of atom.covalentBonds) {
    atom.unpairedElectrons.push(bond.parentElectron);
  }

  for (const electron of atom.unpairedElectrons) {
    electron.bondTimer -= elapsedTime;
    electron.charge = 1;
    electron.previousBond = electron.bond;
    electron.bond = null;
  }

  atom.covalentBonds.length = 0;
}

function getIonicPairs(atom1, atom2) {
  let electronPairs = [];
  let uniqueElectronPairs = [];
  let usedElectrons = new Set();

  const metal = atom1.nonmetal ? atom2 : atom1;
  const nonmetal = atom1.nonmetal ? atom1 : atom2;

  for (const metalElectron of metal.unpairedElectrons) {
    for (const nonmetalElectron of nonmetal.unpairedElectrons) {
      const dist = calcDist(metalElectron, nonmetalElectron);
      electronPairs.push({ metal: metalElectron, nonmetal: nonmetalElectron, dist: dist });
    }
  }

  electronPairs.sort((a, b) => a.dist - b.dist);

  for (const electronPair of electronPairs) {
    if (!usedElectrons.has(electronPair.metal) && !usedElectrons.has(electronPair.nonmetal)) {
      uniqueElectronPairs.push(electronPair);
      usedElectrons.add(electronPair.metal);
      usedElectrons.add(electronPair.nonmetal);
    }
  }

  return uniqueElectronPairs;
}

export { calcForces };

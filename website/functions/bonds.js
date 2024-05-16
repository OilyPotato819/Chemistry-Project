import { calcAngle, calcDist, principalAngle } from './utils.js';

function calcForces(atoms, forces, collision, elapsedTime, minAngleDiff) {
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
      const { closestBond, bonded } = getClosestBond(atom1, atom2);
      if (!closestBond) {
        const ljMagnitude = forces.lj(atomDist, atom1, atom2);

        atom1.applyForce(ljMagnitude, atomAngle, elapsedTime);
        atom2.applyForce(ljMagnitude, atomAngle + Math.PI, elapsedTime);

        continue;
      }

      const electron1 = closestBond.bond1.parentElectron || closestBond.bond1;
      const electron2 = closestBond.bond2.parentElectron || closestBond.bond2;

      attractElectrons(electron1, electron2, forces, elapsedTime);

      const electronAngle1 = calcAngle(electron1.parentAtom, electron2);
      const electronAngle2 = calcAngle(electron2.parentAtom, electron1);

      const angleDiff = calcAngleDiff(atomAngle, electron1.angle, electron2.angle);

      const { morseMagnitude, shouldBond } = forces.morse(atom1, atom2, atomDist, closestBond.dist, angleDiff);

      atom1.applyForce(morseMagnitude, electronAngle1, elapsedTime);
      atom2.applyForce(morseMagnitude, electronAngle2, elapsedTime);

      if (shouldBond && !bonded) {
        atom1.createBond(atom2, closestBond.bond1, closestBond.bond2);
        atom2.createBond(atom1, closestBond.bond2, closestBond.bond1);
      } else if (!shouldBond && bonded) {
        atom1.breakBond(closestBond.bond1);
        atom2.breakBond(closestBond.bond2);
      }
    }
  }
}

function getBondPairs(atom1, atom2) {
  let bondPairs = [];
  // If bond one or bond two is a lone pair, skip.
  for (let bond1 of atom1.bonds) {
    if (bond1.charge === 2) continue;
    for (let bond2 of atom2.bonds) {
      if (bond2.charge === 2) continue;

      const bondDist = calcDist(bond1.parentElectron || bond1, bond2.parentElectron || bond2);
      bondPairs.push({ bond1: bond1, bond2: bond2, dist: bondDist });
    }
  }

  bondPairs.sort((a, b) => a.dist - b.dist);
  return bondPairs;
}

function getClosestBond(atom1, atom2) {
  const bondPairs = getBondPairs(atom1, atom2);

  for (const bondPair of bondPairs) {
    let bond1 = bondPair.bond1;
    let bond2 = bondPair.bond2;

    if (bond1.bondedElectron && bond1.bondedElectron === bond2.parentElectron) {
      return { closestBond: bondPair, bonded: true };
    }

    const dist1 = bond1.type === 'bond' ? calcDist(bond1.parentElectron, bond1.bondedElectron) : Infinity;
    const dist2 = bond2.type === 'bond' ? calcDist(bond2.parentElectron, bond2.parentElectron) : Infinity;
    const shouldBreakBonds = bondPair.dist < dist1 && bondPair.dist < dist2;

    if (shouldBreakBonds && bond1.type === 'bond') {
      atom1.breakBond(bond1);
      bond1.bondedAtom.breakBond(bond1.getMirrorBond());

      bondPair.bond1 = bond1 = bond1.parentElectron;
    }
    if (shouldBreakBonds && bond2.type === 'bond') {
      atom2.breakBond(bond2);
      bond2.bondedAtom.breakBond(bond2.getMirrorBond());

      bondPair.bond2 = bond2 = bond2.parentElectron;
    }

    if (bond1.type === 'electron' && bond2.type === 'electron') {
      return { closestBond: bondPair, bonded: false };
    }
  }

  return { closestBond: null, bonded: null };
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

export { calcForces };

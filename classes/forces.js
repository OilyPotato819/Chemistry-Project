import { getBondInfo } from '../functions/bond-info.js';

class Forces {
  constructor(coulomb, sizeFactor, dispersionFactor, vibFreq, maxRepulsion) {
    this.coulomb = coulomb;
    this.sizeFactor = sizeFactor;
    this.dispersionFactor = dispersionFactor;
    this.vibFreq = vibFreq;
    this.maxRepulsion = maxRepulsion;
  }

  electrostatic(charge1, charge2, dist) {
    return this.coulomb * ((charge1 * charge2) / dist ** 2);
  }

  lj(dist, atom1, atom2) {
    // Lorentz-Berthelot rules
    const size = this.sizeFactor * ((atom1.r + atom2.r) / 2);
    const dispersion = this.dispersionFactor * Math.sqrt(atom1.polarizability * atom2.polarizability);

    const ljMagnitude = 24 * dispersion * ((2 * size ** 12) / dist ** 13 - size ** 6 / dist ** 7);
    return ljMagnitude;
  }

  morse(atom1, atom2, atomDist, electronDist, angleDiff) {
    const { bde, radiiSum } = getBondInfo(atom1, atom2);

    const reducedMass = (atom1.atomicMass * atom2.atomicMass) / (atom1.atomicMass + atom2.atomicMass);

    const forceConstant = (2 * Math.PI * this.vibFreq) ** 2 * reducedMass;
    const a = Math.sqrt(forceConstant / (2 * bde));

    const naturalLog = Math.log(0.5 + Math.sqrt(this.maxRepulsion / (2 * a * bde) + 0.25));
    let bondLength = naturalLog / a + radiiSum;
    bondLength *= angleDiff;

    const naturalBase = Math.E ** (-a * (atomDist - bondLength));
    const magnitude = 2 * bde * a * naturalBase * (naturalBase - 1);

    const shouldBond = electronDist < Math.log(2) / a + bondLength;

    return { morseMagnitude: magnitude, shouldBond: shouldBond };
  }
}

export { Forces };

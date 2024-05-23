import { getBondInfo } from '../functions/bond-info.js';
import { easeInOutCubic } from '../functions/utils.js';

class Forces {
  constructor(simParams) {
    this.coulomb = simParams.coulomb;
    this.sizeFactor = simParams.sizeFactor;
    this.dispersionFactor = simParams.dispersionFactor;
    this.vibFreq = simParams.vibFreq;
    this.maxRepulsion = simParams.maxRepulsion;
    this.minBdeFactor = simParams.minBdeFactor;
    this.unbondedFactor = simParams.unbondedFactor;
  }

  electrostatic(charge1, charge2, dist) {
    return this.coulomb * ((charge1 * charge2) / dist ** 2);
  }

  lj(dist, atom1, atom2) {
    // Lorentz-Berthelot rules
    const dispersion = this.dispersionFactor * Math.sqrt(atom1.polarizability * atom2.polarizability);

    const sizeFactor = this.calcSizeFactor(atom1.r, atom2.r, dispersion);
    const size = sizeFactor * ((atom1.r + atom2.r) / 2);

    const magnitude = 24 * dispersion * ((2 * size ** 12) / dist ** 13 - size ** 6 / dist ** 7);

    return magnitude;
  }

  morse(atom1, atom2, atomDist, electronDist, angleDiff, bothUnbonded) {
    let { bde, radiiSum } = getBondInfo(atom1, atom2);

    const reducedMass = (atom1.atomicMass * atom2.atomicMass) / (atom1.atomicMass + atom2.atomicMass);

    const forceConstant = (2 * Math.PI * this.vibFreq) ** 2 * reducedMass;
    const a = Math.sqrt(forceConstant / (2 * bde));

    const naturalLog = Math.log(0.5 + Math.sqrt(this.maxRepulsion / (2 * a * bde) + 0.25));
    let bondLength = naturalLog / a + radiiSum;

    const naturalBase = Math.E ** (-a * (atomDist - bondLength));
    let magnitude = 2 * bde * a * naturalBase * (naturalBase - 1);

    // minimum: ln(2) / a + bondLength
    // inflection: ln(4) / a + bondLength
    const canBond = electronDist < Math.log(2) / a + bondLength;

    if (magnitude < 0) {
      magnitude *= this.angleDiffFactor(angleDiff);
      magnitude *= canBond && bothUnbonded ? 1 : this.unbondedFactor;
    }

    return { morseMagnitude: magnitude, canBond: canBond };
  }

  angleDiffFactor(angleDiff) {
    const normAngleDiff = (2 * Math.PI - angleDiff) / (2 * Math.PI);
    const easedAngleDiff = easeInOutCubic(normAngleDiff);
    return (1 - this.minBdeFactor) * easedAngleDiff + this.minBdeFactor;
  }

  calcSizeFactor(r1, r2, dispersion) {
    const fraction = (this.maxRepulsion * (r1 + r2)) / (3 * dispersion);
    const squareRoot = Math.sqrt(1 + fraction);
    return (16 + 16 * squareRoot) ** (1 / 6);
  }
}

export { Forces };

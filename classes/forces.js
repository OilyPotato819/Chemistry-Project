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
    let { bde, radiiSum } = getBondInfo(atom1, atom2);
    bde *= this.calcBdeFactor(angleDiff);

    const reducedMass = (atom1.atomicMass * atom2.atomicMass) / (atom1.atomicMass + atom2.atomicMass);

    const forceConstant = (2 * Math.PI * this.vibFreq) ** 2 * reducedMass;
    const a = Math.sqrt(forceConstant / (2 * bde));

    const naturalLog = Math.log(0.5 + Math.sqrt(this.maxRepulsion / (2 * a * bde) + 0.25));
    let bondLength = naturalLog / a + radiiSum;

    const naturalBase = Math.E ** (-a * (atomDist - bondLength));
    const magnitude = 2 * bde * a * naturalBase * (naturalBase - 1);

    const shouldBond = electronDist < Math.log(2) / a + bondLength;

    return { morseMagnitude: magnitude, shouldBond: shouldBond };
  }

  calcBdeFactor(angleDiff) {
    const normAngleDiff = (2 * Math.PI - angleDiff) / (2 * Math.PI);
    const easedAngleDiff = easeInOutCubic(normAngleDiff);
    return (1 - this.minBdeFactor) * easedAngleDiff + this.minBdeFactor;
  }
}

export { Forces };

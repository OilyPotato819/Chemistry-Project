let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 22;

let kineticEnergyDisplay = document.getElementById('ke');

class Atom {
  constructor(x, y, speed, symbol, color) {
    this.x = x;
    this.y = y;
    //random initial velocity
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;
    this.color = color;

    Object.assign(this, elementData.get(symbol));
    this.r = this.covalentRadius;
    this.bonds = [];

    const bondNum = this.valency + this.lonePairs;
    for (let i = 0; i < bondNum; i++) {
      const angle = i * ((2 * Math.PI) / bondNum);
      const charge = i < this.lonePairs ? 2 : 1;
      this.bonds.push(new Electron(this, angle, charge, i));
    }
  }

  update() {
    this.x += this.vx * elapsedTime;
    this.y += this.vy * elapsedTime;

    this.vx *= friction;
    this.vy *= friction;

    for (let i = 0; i < this.bonds.length - 1; i++) {
      for (let j = i + 1; j < this.bonds.length; j++) {
        this.repulseElectrons(this.bonds[i].parentElectron || this.bonds[i], this.bonds[j].parentElectron || this.bonds[j]);
      }
    }

    for (const bond of this.bonds) {
      bond.update();
    }

    if (this.x - this.r < container.pos[0]) {
      this.x = container.pos[0] + this.r;
      this.vx = Math.abs(this.vx) + container.velocity[0];
    } else if (this.x + this.r > container.pos[1]) {
      this.x = container.pos[1] - this.r;
      this.vx = -Math.abs(this.vx) + container.velocity[1];
    }

    if (this.y - this.r < container.pos[2]) {
      this.y = container.pos[2] + this.r;
      this.vy = Math.abs(this.vy) + container.velocity[2];
    } else if (this.y + this.r > container.pos[3]) {
      this.y = container.pos[3] - this.r;
      this.vy = -Math.abs(this.vy) + container.velocity[3];
    }
  }

  applyForce(force, angle) {
    const components = decomposeForce(force, angle);

    this.vx += (components.x / this.atomicMass) * elapsedTime;
    this.vy += (components.y / this.atomicMass) * elapsedTime;
  }

  repulseElectrons(electron1, electron2) {
    const x = electron1.x - electron2.x;
    const y = electron1.y - electron2.y;

    const dist = Math.sqrt(x ** 2 + y ** 2);
    const forceAngle = Math.atan2(y, x);
    const force = electrostaticForce(electron1.charge, electron2.charge, dist);

    const angle1 = forceAngle - electron1.angle;
    const angle2 = forceAngle + Math.PI - electron2.angle;

    electron1.applyTorque(force, angle1);
    electron2.applyTorque(force, angle2);
  }

  createBond(atom, parentElectron, bondedElectron) {
    this.bonds[parentElectron.index] = new Bond(this, atom, parentElectron, bondedElectron);
  }

  breakBond(bond) {
    this.bonds[bond.parentElectron.index] = bond.parentElectron;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2);
    ctx.fill();

    for (const bond of this.bonds) {
      bond.draw();
    }
  }
}

class Electron {
  constructor(parentAtom, angle, charge, index) {
    this.parentAtom = parentAtom;
    this.atomRadius = parentAtom.covalentRadius;
    this.angle = angle;
    this.calcPosition();
    this.angularVelocity = 0;
    this.charge = charge;
    this.index = index;
    this.color = this.charge === 1 ? 'red' : 'black';
  }

  calcPosition() {
    this.x = this.parentAtom.x + this.atomRadius * Math.cos(this.angle);
    this.y = this.parentAtom.y + this.atomRadius * Math.sin(this.angle);
  }

  applyTorque(magnitude, angle) {
    const torque = this.atomRadius * magnitude * Math.sin(angle);
    const inertia = this.atomRadius ** 2;
    const angularAcceleration = torque / inertia;

    this.angularVelocity += angularAcceleration * elapsedTime;
  }

  update() {
    this.angle += this.angularVelocity * elapsedTime;
    this.calcPosition();
    this.angularVelocity *= friction;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Bond {
  constructor(parentAtom, bondedAtom, parentElectron, bondedElectron) {
    this.parentAtom = parentAtom;
    this.bondedAtom = bondedAtom;
    this.parentElectron = parentElectron;
    this.bondedElectron = bondedElectron;
  }

  update() {
    this.parentElectron.update();
  }

  draw() {
    this.parentElectron.draw();
  }
}

class Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.state = 'up';
  }

  update(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
  }
}

class Container {
  constructor(pos) {
    this.canvasPos = pos;
    this.pos = this.canvasPos.map((x) => x / scale);
    this.velocity = [0, 0, 0, 0];
    this.drag = [null, null];
    this.clickDist = 10;
  }

  update() {
    for (let i = 0; i < this.canvasPos.length; i++) {
      const mousePos = i < 2 ? mouse.x : mouse.y;
      const dist = Math.abs(mousePos - this.canvasPos[i]);
      if (dist > this.clickDist) {
        canvas.style.cursor = 'default';
        continue;
      }
      canvas.style.cursor = 'n-resize';
      if (mouse.state != 'click') continue;
      this.drag[Math.floor(i / 2)] = i;
    }

    if (mouse.state === 'up') {
      this.velocity = [0, 0, 0, 0];
      this.drag = [null, null];
      return;
    }

    if (this.drag[0] != null) {
      const index = this.drag[0];
      this.velocity[index] = mouse.x - this.canvasPos[index];
      this.canvasPos[index] = mouse.x;
    }

    if (this.drag[1] != null) {
      const index = this.drag[1];
      this.velocity[index] = mouse.y - this.canvasPos[index];
      this.canvasPos[index] = mouse.y;
    }

    this.pos = this.canvasPos.map((x) => x / scale);
  }

  draw() {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.canvasPos[0], this.canvasPos[2], this.canvasPos[1] - this.canvasPos[0], this.canvasPos[3] - this.canvasPos[2]);
  }
}

const maxRepulsion = 50;
const simulationSpeed = 0.01;
const scale = 0.5;
const cor = 0.5;
const friction = 0.999;
const vibFreq = 0.1;
const coulomb = 10000;

let lastTime;
let elapsedTime;
let atoms = [];
let mouse = new Mouse();
let container = new Container([0, cnv.width, 0, cnv.height]);

// for (let n = 0; n < 50; n++) {
//   const index = Math.floor(Math.random() * 3);
//   const symbol = ['C', 'H', 'O'][index];
//   const color = ['blue', 'red', 'green'][index];
//   atoms.push(new Atom(Math.random() * (cnv.width / scale), Math.random() * (cnv.height / scale), 1, symbol, color));
// }

atoms.push(new Atom(800, 500, 0, 'N', 'blue'));
atoms.push(new Atom(800, 700, 0, 'C', 'black'));
// atoms.push(new Atom(650, 700, 0, 'H', 'blue'));
// atoms.push(new Atom(400, 400, 0, 'H', 'red'));
// atoms.push(new Atom(500, 350, 0, 'H', 'red'));

document.addEventListener('mousemove', (event) => {
  mouse.update(event);
});

document.addEventListener('mousedown', () => {
  mouse.state = 'click';
});

document.addEventListener('mouseup', () => {
  mouse.state = 'up';
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    lastTime = undefined;
  }
});

function getBondInfo(atom1, atom2) {
  const bondString = [atom1.symbol, atom2.symbol].sort().toString().replace(',', '-');
  const bde = bondData.get(bondString);
  const radiiSum = atom1.covalentRadius + atom2.covalentRadius;
  return { bde: bde, radiiSum: radiiSum };
}

function resolveCollision(obj1, obj2, angle, dist) {
  const m1 = obj1.atomicMass;
  const m2 = obj2.atomicMass;
  const x1 = [obj1.x, obj1.y];
  const x2 = [obj2.x, obj2.y];
  const v1 = [obj1.vx, obj1.vy];
  const v2 = [obj2.vx, obj2.vy];

  const v1New = collisionVelocities(m1, m2, x1, x2, v1, v2);
  const v2New = collisionVelocities(m2, m1, x2, x1, v2, v1);

  [obj1.vx, obj1.vy] = v1New;
  [obj2.vx, obj2.vy] = v2New;

  separate(obj1, obj2, angle, dist);
}

function collisionVelocities(m1, m2, x1, x2, v1, v2) {
  const diffX = [x1[0] - x2[0], x1[1] - x2[1]];
  const diffV = [v1[0] - v2[0], v1[1] - v2[1]];

  const dotProduct = diffV[0] * diffX[0] + diffV[1] * diffX[1];
  const normSquared = diffX[0] ** 2 + diffX[1] ** 2;
  const scalar = (cor * 2 * m2) / (m1 + m2);
  const coefficient = normSquared === 0 ? 0 : scalar * (dotProduct / normSquared);

  return [v1[0] - coefficient * diffX[0], v1[1] - coefficient * diffX[1]];
}

function separate(obj1, obj2, angle, dist) {
  const overlap = dist - (obj1.r + obj2.r) * 1.01;
  const move_x = overlap * Math.cos(angle);
  const move_y = overlap * Math.sin(angle);

  obj1.x -= move_x;
  obj1.y -= move_y;
}

function calcAngle(obj1, obj2) {
  return Math.atan2(obj1.y - obj2.y, obj1.x - obj2.x);
}

function calcDist(obj1, obj2) {
  return Math.sqrt((obj1.y - obj2.y) ** 2 + (obj1.x - obj2.x) ** 2);
}

function decomposeForce(magnitude, angle) {
  return { x: magnitude * Math.cos(angle), y: magnitude * Math.sin(angle) };
}

function morseForce(atom1, atom2, dist) {
  const { bde, radiiSum } = getBondInfo(atom1, atom2);

  const reducedMass = (atom1.atomicMass * atom2.atomicMass) / (atom1.atomicMass + atom2.atomicMass);

  const forceConstant = (2 * Math.PI * vibFreq) ** 2 * reducedMass;
  const a = Math.sqrt(forceConstant / (2 * bde));

  const naturalLog = Math.log(0.5 + Math.sqrt(maxRepulsion / (2 * a * bde) + 0.25));
  const bondLength = naturalLog / a + radiiSum;

  const naturalBase = Math.E ** (-a * (dist - bondLength));
  const force = 2 * bde * a * naturalBase * (naturalBase - 1);

  const shouldBond = dist < Math.log(2) / a + bondLength;

  return { force: force, shouldBond: shouldBond };
}

function electrostaticForce(charge1, charge2, dist) {
  return coulomb * ((charge1 * charge2) / dist ** 2);
}

function kineticEnergy(mass, velocity) {
  return (mass * velocity ** 2) / 2;
}

function calcForces() {
  for (let i = 0; i < atoms.length - 1; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      const angle = calcAngle(atom1, atom2);
      let atomDist = calcDist(atom1, atom2);

      if (atomDist < atom1.r + atom2.r) {
        resolveCollision(atom1, atom2, angle, atomDist);
        atomDist = atom1.r + atom2.r;
      }
      const { closestBond, bonded } = getClosestBond(atom1, atom2);
      if (!closestBond) continue;

      const electron1 = closestBond.bond1.parentElectron || closestBond.bond1;
      const electron2 = closestBond.bond2.parentElectron || closestBond.bond2;
      const bondAngle = calcAngle(electron1, electron2);

      const bondDist = closestBond.dist + atom1.covalentRadius + atom2.covalentRadius;
      const { force, shouldBond } = morseForce(atom1, atom2, bondDist);

      atom1.applyForce(force, bondAngle);
      atom2.applyForce(force, bondAngle + Math.PI);

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
  for (let bond1 of atom1.bonds) {
    if (bond1 instanceof Electron && bond1.charge === 2) continue;
    for (let bond2 of atom2.bonds) {
      if (bond2 instanceof Electron && bond2.charge === 2) continue;

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
    if (bondPair.bond1.bondedAtom === atom2) {
      return { closestBond: bondPair, bonded: true };
    }

    const dist1 = bondPair.bond1 instanceof Bond ? calcDist(bondPair.bond1.parentElectron, bondPair.bond1.bondedElectron) : Infinity;
    const dist2 = bondPair.bond2 instanceof Bond ? calcDist(bondPair.bond2.parentElectron, bondPair.bond2.bondedElectron) : Infinity;
    const shouldBreakBonds = bondPair.dist < dist1 && bondPair.dist < dist2;

    if (shouldBreakBonds && bondPair.bond1 instanceof Bond) {
      atom1.breakBond(bondPair.bond1);
      bondPair.bond1 = bondPair.bond1.parentElectron;
    }
    if (shouldBreakBonds && bondPair.bond2 instanceof Bond) {
      atom2.breakBond(bondPair.bond2);
      bondPair.bond2 = bondPair.bond2.parentElectron;
    }

    if (bondPair.bond1 instanceof Electron && bondPair.bond2 instanceof Electron) {
      return { closestBond: bondPair, bonded: false };
    }
  }

  return { closestBond: null, bonded: null };
}

function simulationStep() {
  container.update();

  calcForces();
  for (const atom of atoms) {
    atom.update();
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  container.draw();
  for (const atom of atoms) {
    atom.draw();
  }

  let totalKineticEnergy = 0;
  for (const atom of atoms) {
    totalKineticEnergy += kineticEnergy(atom.atomicMass, Math.sqrt(atom.vy ** 2 + atom.vx ** 2));
  }
  kineticEnergyDisplay.innerHTML = totalKineticEnergy;

  if (mouse.state === 'click') mouse.state = 'down';
}

function loop(currentTime) {
  elapsedTime = (currentTime - lastTime) * simulationSpeed || 0;
  lastTime = currentTime;

  simulationStep();
  drawFrame();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

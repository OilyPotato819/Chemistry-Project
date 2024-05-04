let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 22;

let kineticEnergyDisplay = document.getElementById('ke');

class Atom {
  constructor(x, y, speed, symbol, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;
    this.color = color;

    Object.assign(this, elementData.get(symbol));
    this.r = this.covalentRadius;
    this.bonds = [];
    this.fullyBonded = false;
    this.furthestBond = { dist: -Infinity };

    const bondNum = this.valency + this.lonePairs;
    for (let n = 0; n < bondNum; n++) {
      const angle = (n + 2) * ((2 * Math.PI) / bondNum);
      const atom = n < this.lonePairs ? 2 : 1;
      this.bonds.push({ angle: angle, angularVelocity: 0, atom: atom });
    }
  }

  update() {
    this.x += this.vx * elapsedTime;
    this.y += this.vy * elapsedTime;

    this.vx *= friction;
    this.vy *= friction;

    for (let i = 0; i < this.bonds.length - 1; i++) {
      for (let j = i + 1; j < this.bonds.length; j++) {
        this.repulseBonds(this.bonds[i], this.bonds[j]);
      }
    }

    for (const bond of this.bonds) {
      bond.angle += bond.angularVelocity * elapsedTime;
      bond.angularVelocity *= friction;
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

  applyTorque(magnitude, angle, bond) {
    const torque = this.covalentRadius * magnitude * Math.sin(angle);
    const inertia = this.covalentRadius ** 2;
    const angularAcceleration = torque / inertia;

    bond.angularVelocity += angularAcceleration * elapsedTime;
  }

  repulseBonds(bond1, bond2) {
    const x = Math.cos(bond1.angle) - Math.cos(bond2.angle);
    const y = Math.sin(bond1.angle) - Math.sin(bond2.angle);

    const dist = Math.sqrt((this.covalentRadius * x) ** 2 + (this.covalentRadius * y) ** 2);
    const forceAngle = Math.atan2(y, x);
    const force = electrostaticForce(bond1.atom, bond2.atom, dist);

    const angle1 = forceAngle - bond1.angle;
    const angle2 = forceAngle + Math.PI - bond2.angle;

    this.applyTorque(force, angle1, bond1);
    this.applyTorque(force, angle2, bond2);
  }

  setFurthestBond() {
    let furthestBond = { dist: -Infinity };

    for (const bondedAtom of this.bonds) {
      const dist = calcDist(this, bondedAtom);
      if (dist > furthestBond.dist) {
        furthestBond = { atom: bondedAtom, dist: dist };
      }
    }

    this.furthestBond = furthestBond;
  }

  createBond(atom) {
    this.bonds.push(atom);
    this.setFurthestBond();
    this.fullyBonded = this.bonds.length === this.valency;
  }

  breakBond(atom) {
    this.bonds.splice(this.bonds.indexOf(atom), 1);
    this.setFurthestBond();
    this.fullyBonded = this.bonds.length === this.valency;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2);
    ctx.fill();

    for (const bond of this.bonds) {
      const x = this.x * scale + this.covalentRadius * scale * Math.cos(bond.angle);
      const y = this.y * scale + this.covalentRadius * scale * Math.sin(bond.angle);

      ctx.fillStyle = bond.atom == 1 ? 'red' : 'black';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
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

const maxRepulsion = 10;
const simulationSpeed = 0.01;
const scale = 0.5;
const cor = 0.5;
const friction = 0.999;
const vibFreq = 0.1;
const coulomb = 1000;

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

atoms.push(new Atom(500, 500, 0, 'Cl', 'blue'));
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

function calcForces(elapsedTime) {
  for (let i = 0; i < atoms.length - 1; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i];
      const atom2 = atoms[j];

      const angle = calcAngle(atom1, atom2);
      let dist = calcDist(atom1, atom2);

      if (dist < atom1.r + atom2.r) {
        resolveCollision(atom1, atom2, angle, dist);
        dist = atom1.r + atom2.r;
      }

      // replaces furthest bond with current atom, if current atom is closer than bonded atom.
      if (atom1.fullyBonded && atom1.furthestBond.dist >= atom2.furthestBond.dist && dist < atom1.furthestBond.dist) {
        atom1.breakBond(atom1.furthestBond.atom);
      } else if (atom2.fullyBonded && atom2.furthestBond.dist > atom1.furthestBond.dist && dist < atom2.furthestBond.dist) {
        atom2.breakBond(atom2.furthestBond.atom);
      }

      const { force, shouldBond } = morseForce(atom1, atom2, dist);
      const bonded = atom1.bonds.includes(atom2);

      if ((atom1.fullyBonded || atom2.fullyBonded) && !bonded) continue;

      if (shouldBond && !bonded) {
        atom1.createBond(atom2);
        atom2.createBond(atom1);
      } else if (!shouldBond && bonded) {
        atom1.breakBond(atom2);
        atom2.breakBond(atom1);
      }

      atom1.applyForce(force, angle, elapsedTime);
      atom2.applyForce(force, angle + Math.PI, elapsedTime);
    }
  }
}

function simulationStep(elapsedTime) {
  container.update();

  calcForces(elapsedTime);
  for (const atom of atoms) {
    atom.update(elapsedTime);
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

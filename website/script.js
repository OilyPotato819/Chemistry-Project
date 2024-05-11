let cnv = document.getElementById("canvas");
let ctx = cnv.getContext("2d");

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 22;

let kineticEnergyDisplay = document.getElementById("ke");

class Atom {
  constructor(x, y, speed, symbol, color) {
    this.x = x;
    this.y = y;
    //random initial velocity
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;
    this.color = color;
    //copies properties from element data (covalentRadius, electronegativity ...) into Atom object
    Object.assign(this, elementData.get(symbol));
    //atom radius = covalent radius
    this.r = this.covalentRadius;
    this.bonds = [];
    //valency = number of lone electrons that are free to bond
    //lonepairs = electron pairs that won't bond
    const bondNum = this.valency + this.lonePairs;
    for (let i = 0; i < bondNum; i++) {
      const angle = i * ((2 * Math.PI) / bondNum);
      //charge for lone pair is 2, charge for free electron is 1
      const charge = i < this.lonePairs ? 2 : 1;
      //pushes electrons to bond array
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
        this.repulseElectrons(
          this.bonds[i].parentElectron || this.bonds[i],
          this.bonds[j].parentElectron || this.bonds[j]
        );
      }
    }

    for (const bond of this.bonds) {
      bond.update();
    }

    if (this.x - this.r < container.pos.left) {
      this.x = container.pos.left + this.r;
      this.vx = Math.abs(this.vx) + container.velocity.left;
    } else if (this.x + this.r > container.pos.right) {
      this.x = container.pos.right - this.r;
      this.vx = -Math.abs(this.vx) + container.velocity.right;
    }

    if (this.y - this.r < container.pos.top) {
      this.y = container.pos.top + this.r;
      this.vy = Math.abs(this.vy) + container.velocity.top;
    } else if (this.y + this.r > container.pos.bottom) {
      this.y = container.pos.bottom - this.r;
      this.vy = -Math.abs(this.vy) + container.velocity.bottom;
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
    //get coulomb force between electrons
    const force = electrostaticForce(electron1.charge, electron2.charge, dist);
    //electrons 1 and 2 have reflected angles
    const angle1 = forceAngle - electron1.angle;
    const angle2 = forceAngle + Math.PI - electron2.angle;

    electron1.applyTorque(force, angle1);
    electron2.applyTorque(force, angle2);
  }

  createBond(atom, parentElectron, bondedElectron) {
    this.bonds[parentElectron.index] = new Bond(
      this,
      atom,
      parentElectron,
      bondedElectron
    );
  }

  breakBond(bond) {
    this.bonds[bond.parentElectron.index] = bond.parentElectron;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillText(this.symbol, this.x * scale, this.y * scale);

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
    this.color = this.charge === 1 ? "red" : "black";
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
    this.angularVelocity *= electronFriction;
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
    this.state = "up";
  }

  update(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
  }
}

class Container {
  constructor(left, right, top, bottom) {
    this.canvasPos = { left: left, right: right, top: top, bottom: bottom };
    this.pos = this.canvasPos.map((x) => x / scale);
    this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
    this.drag = [null, null];
    this.clickDist = 10;
  }

  calcPos() {
    this.pos = Object.keys(this.canvasPos).forEach((key, _index) => {
      this.canvasPos[key] * scale;
    });
  }

  update() {
    for (let i = 0; i < this.canvasPos.length; i++) {
      const mousePos = i < 2 ? mouse.x : mouse.y;
      const dist = Math.abs(mousePos - this.canvasPos[i]);
      if (dist > this.clickDist) {
        canvas.style.cursor = "default";
        continue;
      }
      canvas.style.cursor = "n-resize";
      if (mouse.state != "click") continue;
      this.drag[Math.floor(i / 2)] = i;
    }

    if (mouse.state === "up") {
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
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      this.canvasPos[0],
      this.canvasPos[2],
      this.canvasPos[1] - this.canvasPos[0],
      this.canvasPos[3] - this.canvasPos[2]
    );
  }
}

class listItem {
  constructor(pos, symbol) {
    this.pos = pos;
    this.state = "none";
    Object.assign(this, elementData.get(symbol));
  }

  draw() {
    ctx.strokeStyle = "black";
    ctx.strokeRect(this.pos[0], this.pos[2], this.pos[1], this.pos[3]);

    ctx.font = "bold 16px serif";
    ctx.fillStyle = "black";
    ctx.fillText(this.symbol, this.pos[0], this.pos[2]);
  }
}

class Catalogue {
  constructor(pos) {
    this.canvasPos = pos;
    this.pos = this.canvasPos.map((x) => x / scale);
    this.maps = this.fill_list();
    this.activeList = "page1";
  }

  fill_list() {
    //   elementData.forEach((values, keys) => {
    //     console.log(values, keys);
    // });
    let pageMap = new Map();
    let keys = elementData.keys();
    let size = { w: this.canvasPos[1], h: canvas.height / 40 };

    for (let i = 1; i <= 3; i++) {
      let pageArr = [];
      let itemx = this.canvasPos[0];
      let itemy = 2 * size.h;
      for (let j = 0; j < 40; j++) {
        if (i == 3 && j == 38) {
          break;
        }
        pageArr.push(
          new listItem([itemx, size.w, itemy, size.h], keys.next().value)
        );
        itemy += size.h;
      }
      pageMap.set(`page${i}`, pageArr);
      console.log(pageMap);
    }
    return pageMap;
  }
  draw() {
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      this.canvasPos[0],
      this.canvasPos[2],
      this.canvasPos[1],
      this.canvasPos[3]
    );
    // console.log(this.maps.get("page1"));
    for (let i = 0; i < this.maps.get("page1").length; i++) {
      this.maps.get("page1")[i].draw();
    }
  }
}

const maxRepulsion = 50;
const simulationSpeed = 0.01;
const scale = 0.5;
const cor = 0.5;
const friction = 0.999;
const electronFriction = 0.99;
const vibFreq = 0.1;
const coulomb = 10000;

let lastTime;
let elapsedTime;
let atoms = [];
let mouse = new Mouse();
let container = new Container(0, cnv.width * (2 / 3), 0, cnv.height);
let catalogue = new Catalogue([
  cnv.width * (21 / 30),
  cnv.width * (2 / 7),
  0,
  cnv.height,
]);

// for (let n = 0; n < 50; n++) {
//   const index = Math.floor(Math.random() * 3);
//   const symbol = ['C', 'H', 'O'][index];
//   const color = ['blue', 'red', 'green'][index];
//   atoms.push(new Atom(Math.random() * (cnv.width / scale), Math.random() * (cnv.height / scale), 1, symbol, color));
// }

atoms.push(new Atom(900, 710, 0, "H", "black"));
atoms.push(new Atom(800, 720, 0, "H", "blue"));
atoms.push(new Atom(400, 400, 0, "H", "red"));
atoms.push(new Atom(500, 350, 0, "H", "red"));
atoms.push(new Atom(600, 600, 0, "C", "red"));
atoms.push(new Atom(800, 500, 0, "N", "blue"));

document.addEventListener("mousemove", (event) => {
  mouse.update(event);
});

document.addEventListener("mousedown", () => {
  mouse.state = "click";
});

document.addEventListener("mouseup", () => {
  mouse.state = "up";
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    lastTime = undefined;
  }
});

function getBondInfo(atom1, atom2) {
  const bondString = [atom1.symbol, atom2.symbol]
    .sort()
    .toString()
    .replace(",", "-");
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
  const coefficient =
    normSquared === 0 ? 0 : scalar * (dotProduct / normSquared);

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

function morseForce(atom1, atom2, atomDist, electronDist, angleDiff) {
  const { bde, radiiSum } = getBondInfo(atom1, atom2);

  const reducedMass =
    (atom1.atomicMass * atom2.atomicMass) /
    (atom1.atomicMass + atom2.atomicMass);

  const forceConstant = (2 * Math.PI * vibFreq) ** 2 * reducedMass;
  const a = Math.sqrt(forceConstant / (2 * bde));

  const naturalLog = Math.log(
    0.5 + Math.sqrt(maxRepulsion / (2 * a * bde) + 0.25)
  );
  let bondLength = naturalLog / a + radiiSum;
  bondLength *= angleDiff;

  const naturalBase = Math.E ** (-a * (atomDist - bondLength));
  const force = 2 * bde * a * naturalBase * (naturalBase - 1);

  const shouldBond = electronDist < Math.log(2) / a + bondLength;

  return { force: force, shouldBond: shouldBond };
}

function electrostaticForce(charge1, charge2, dist) {
  return coulomb * ((charge1 * charge2) / dist ** 2);
}

function kineticEnergy(mass, velocity) {
  return (mass * velocity ** 2) / 2;
}

function attractElectrons(electron1, electron2) {
  const dist1 = calcDist(electron1, electron2.parentAtom);
  const dist2 = calcDist(electron2, electron1.parentAtom);

  const force1 = electrostaticForce(electron1.charge, 9, dist1);
  const force2 = electrostaticForce(electron2.charge, 9, dist2);

  const forceAngle1 = calcAngle(electron1, electron2.parentAtom);
  const forceAngle2 = calcAngle(electron2, electron1.parentAtom);

  const angle1 = forceAngle1 + Math.PI - electron1.angle;
  const angle2 = forceAngle2 + Math.PI - electron2.angle;

  electron1.applyTorque(force1, angle1);
  electron2.applyTorque(force2, angle2);
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

      attractElectrons(electron1, electron2);

      // make the morse force care about the distance between bonding electrons

      const angle1 = calcAngle(electron1.parentAtom, electron2);
      const angle2 = calcAngle(electron2.parentAtom, electron1);

      const angleDiff1 = calcAngleDiff(
        angle1 + Math.PI,
        electron2.angle % (2 * Math.PI)
      );
      const angleDiff2 = calcAngleDiff(
        angle2 + Math.PI,
        electron1.angle % (2 * Math.PI)
      );
      const angleDiff = Math.max(angleDiff1, angleDiff2);

      const { force, shouldBond } = morseForce(
        atom1,
        atom2,
        atomDist,
        closestBond.dist,
        angleDiff
      );

      atom1.applyForce(force, angle1);
      atom2.applyForce(force, angle2);

      if (shouldBond && !bonded) {
        atom1.createBond(atom2, closestBond.bond1, closestBond.bond2);
        atom2.createBond(atom1, closestBond.bond2, closestBond.bond1);
      } else if (!shouldBond && bonded) {
        if (
          !(closestBond.bond1 instanceof Bond) ||
          !(closestBond.bond2 instanceof Bond)
        )
          console.log(closestBond);
        atom1.breakBond(closestBond.bond1);
        atom2.breakBond(closestBond.bond2);
      }
    }
  }
}

function calcAngleDiff(angle1, angle2) {
  const angleDiff = Math.min(
    Math.abs(angle1 - angle2),
    2 * Math.PI - Math.abs(angle1 - angle2)
  );
  return 1 + (angleDiff / Math.PI) * (1.15 - 1);
}

function getBondPairs(atom1, atom2) {
  let bondPairs = [];
  //If bond one or bond two is a lone pair, skip.
  for (let bond1 of atom1.bonds) {
    if (bond1 instanceof Electron && bond1.charge === 2) continue;
    for (let bond2 of atom2.bonds) {
      if (bond2 instanceof Electron && bond2.charge === 2) continue;

      const bondDist = calcDist(
        bond1.parentElectron || bond1,
        bond2.parentElectron || bond2
      );
      bondPairs.push({ bond1: bond1, bond2: bond2, dist: bondDist });
    }
  }

  bondPairs.sort((a, b) => a.dist - b.dist);
  return bondPairs;
}

function getClosestBond(atom1, atom2) {
  const bondPairs = getBondPairs(atom1, atom2);

  for (const bondPair of bondPairs) {
    const parentElectron1 = bondPair.bond1.parentElectron;
    const parentElectron2 = bondPair.bond2.parentElectron;
    const bondedElectron1 = bondPair.bond1.bondedElectron;
    const bondedElectron2 = bondPair.bond2.parentElectron;

    if (bondedElectron1 && bondedElectron1 === parentElectron2) {
      return { closestBond: bondPair, bonded: true };
    }

    const dist1 =
      bondPair.bond1 instanceof Bond
        ? calcDist(parentElectron1, bondedElectron1)
        : Infinity;
    const dist2 =
      bondPair.bond2 instanceof Bond
        ? calcDist(parentElectron2, bondedElectron2)
        : Infinity;
    const shouldBreakBonds = bondPair.dist < dist1 && bondPair.dist < dist2;

    if (shouldBreakBonds && bondPair.bond1 instanceof Bond) {
      atom1.breakBond(bondPair.bond1);
      bondPair.bond1 = parentElectron1;
    }
    if (shouldBreakBonds && bondPair.bond2 instanceof Bond) {
      atom2.breakBond(bondPair.bond2);
      bondPair.bond2 = parentElectron2;
    }

    if (
      bondPair.bond1 instanceof Electron &&
      bondPair.bond2 instanceof Electron
    ) {
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
  catalogue.draw();

  let totalKineticEnergy = 0;
  for (const atom of atoms) {
    totalKineticEnergy += kineticEnergy(
      atom.atomicMass,
      Math.sqrt(atom.vy ** 2 + atom.vx ** 2)
    );
  }
  kineticEnergyDisplay.innerHTML = Math.round(totalKineticEnergy / 10 ** 12);

  if (mouse.state === "click") mouse.state = "down";
}

function loop(currentTime) {
  elapsedTime = (currentTime - lastTime) * simulationSpeed || 0;
  lastTime = currentTime;

  simulationStep();
  drawFrame();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 22;

let kineticEnergyDisplay = document.getElementById('ke');

class Atom {
  constructor(x, y, speed, symbol) {
    this.x = x;
    this.y = y;

    //random initial velocity
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;

    //copies properties from element data (covalentRadius, electronegativity ...) into Atom object
    // valency = number of lone electrons that are free to bond
    // lonepairs = electron pairs that won't bond
    Object.assign(this, elementData.get(symbol));

    //atom radius = covalent radius
    this.r = this.covalentRadius;
    this.bonds = [];

    this.font = `${this.r * scale * 0.7}px sans-serif`;
    this.borderColor = changeShade(this.color, 10);

    const bondNum = this.valency + this.lonePairs;
    for (let i = 0; i < bondNum; i++) {
      const angle = i * ((2 * Math.PI) / bondNum);
      //charge for lone pair is 2, charge for free electron is 1
      const charge = i < this.lonePairs ? 2 : 1;
      //pushes electrons to bond array
      this.bonds.push(new Electron(this, angle, charge, i, this.color));
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

    if (this.x - this.r < container.scaledPos.left) {
      this.x = container.scaledPos.left + this.r;
      this.vx = Math.abs(this.vx) + container.velocity.left;
    } else if (this.x + this.r > container.scaledPos.right) {
      this.x = container.scaledPos.right - this.r;
      this.vx = -Math.abs(this.vx) + container.velocity.right;
    }

    if (this.y - this.r < container.scaledPos.top) {
      this.y = container.scaledPos.top + this.r;
      this.vy = Math.abs(this.vy) + container.velocity.top;
    } else if (this.y + this.r > container.scaledPos.bottom) {
      this.y = container.scaledPos.bottom - this.r;
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

    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = this.font;
    ctx.fillText(this.symbol, this.x * scale, this.y * scale);
  }
}

class Electron {
  constructor(parentAtom, angle, charge, index, parentColor) {
    this.parentAtom = parentAtom;
    this.atomRadius = parentAtom.r;
    this.angle = angle;
    this.calcPosition();
    this.angularVelocity = 0;
    this.charge = charge;
    this.index = index;

    const shadeSign = this.charge === 1 ? 1 : -1;
    this.color = changeShade(parentColor, shadeSign * 30);
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

  getMirrorBond() {
    return this.bondedAtom.bonds[this.bondedElectron.index];
  }

  update() {
    this.parentElectron.update();
  }

  draw() {
    this.parentElectron.draw();
  }

  drawConnection() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.parentElectron.x * scale, this.parentElectron.y * scale);
    ctx.lineTo(this.bondedElectron.x * scale, this.bondedElectron.y * scale);
    ctx.stroke();
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
  constructor(left, right, top, bottom) {
    this.canvasPos = { left: left, right: right, top: top, bottom: bottom };
    this.scaledPos = {};
    this.calcPos();

    this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
    this.drag = { x: null, y: null };
    this.clickDist = 10;
  }

  calcPos() {
    for (const side in this.canvasPos) {
      this.scaledPos[side] = this.canvasPos[side] / scale;
    }
  }

  update() {
    for (const side in this.canvasPos) {
      const axis = side === 'left' || side === 'right' ? 'x' : 'y';
      const dist = Math.abs(mouse[axis] - this.canvasPos[side]);

      if (dist > this.clickDist) {
        canvas.style.cursor = 'default';
        continue;
      }

      canvas.style.cursor = 'n-resize';

      if (mouse.state === 'click') {
        this.drag[axis] = side;
      }
    }

    if (mouse.state === 'up') {
      this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
      this.drag = { x: null, y: null };
      return;
    }

    if (this.drag.x != null) {
      const side = this.drag.x;
      this.velocity[side] = mouse.x - this.canvasPos[side];
      this.canvasPos[side] = mouse.x;
    }

    if (this.drag.y != null) {
      const side = this.drag.y;
      this.velocity[side] = mouse.y - this.canvasPos[side];
      this.canvasPos[side] = mouse.y;
    }

    if (this.canvasPos.right > catalogue.x - catalogue.marginLeft) {
      this.canvasPos.right = catalogue.x - catalogue.marginLeft;
      this.velocity.right = 0;
    }

    this.calcPos();
  }

  draw() {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.canvasPos.left, this.canvasPos.top, this.canvasPos.right - this.canvasPos.left, this.canvasPos.bottom - this.canvasPos.top);
  }
}

class listItem {
  constructor(pos, symbol) {
    this.pos = pos;
    this.state = 'none';
    Object.assign(this, elementData.get(symbol));
  }

  draw() {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.pos[0], this.pos[2], this.pos[1], this.pos[3]);

    ctx.font = 'bold 16px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(this.symbol, this.pos[0], this.pos[2]);
  }
}

class Catalogue {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.marginLeft = 30;
    this.maps = this.fillList();
    this.activeList = 'page1';
  }

  fillList() {
    //   elementData.forEach((values, keys) => {
    //     console.log(values, keys);
    // });
    let pageMap = new Map();
    let keys = elementData.keys();
    let size = { w: this.w, h: canvas.height / 40 };

    for (let i = 1; i <= 3; i++) {
      let pageArr = [];
      let itemx = this.x;
      let itemy = 2 * size.h;
      for (let j = 0; j < 40; j++) {
        if (i == 3 && j == 38) {
          break;
        }
        pageArr.push(new listItem([itemx, this.w, itemy, size.h], keys.next().value));
        itemy += size.h;
      }
      pageMap.set(`page${i}`, pageArr);
      // console.log(pageMap);
    }
    return pageMap;
  }
  draw() {
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    // console.log(this.maps.get("page1"));
    for (let i = 0; i < this.maps.get('page1').length; i++) {
      this.maps.get('page1')[i].draw();
    }
  }
}

const simulationSpeed = 0.01;
const scale = 0.5;
const cor = 0.5;
const friction = 0.999;
const electronFriction = 0.99;
const coulomb = 10000;
const morse = { vibFreq: 0.1, maxRepulsion: 50 };
const lj = { sizeFactor: 3, dispersionFactor: 10 };

let lastTime;
let elapsedTime;
let atoms = [];
let mouse = new Mouse();
let container = new Container(0, cnv.width * (2 / 3), 0, cnv.height);
let catalogue = new Catalogue(cnv.width * 0.7, 0, cnv.width * 0.3, cnv.height);

// atoms.push(new Atom(900, 710, 0, 'H'));
// atoms.push(new Atom(800, 720, 0, 'H'));
// atoms.push(new Atom(400, 400, 0, 'H'));
// atoms.push(new Atom(500, 350, 0, 'H'));
// atoms.push(new Atom(600, 600, 0, 'C'));
// atoms.push(new Atom(800, 500, 0, 'N'));

randomAtoms(30, 300, ['H', 'O', 'C', 'N'], [6, 1, 1, 1]);

// atoms.push(new Atom(400, 200, 0, 'H'));
// atoms.push(new Atom(500, 200, 0, 'H'));
// atoms.push(new Atom(700, 400, 0, 'O'));

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

function randomAtoms(maxNum, spacing, symbols, weights) {
  let indexes = [];
  for (let i = 0; i < weights.length; i++) {
    indexes = [...indexes, ...Array(weights[i]).fill(i)];
  }

  let num = 0;
  for (let y = 0; y < cnv.height; y += spacing) {
    for (let x = 0; x < cnv.width; x += spacing) {
      const index = indexes[Math.floor(Math.random() * indexes.length)];
      const symbol = symbols[index];
      atoms.push(new Atom(x, y, 5, symbol));
      num++;
      if (num === maxNum) return;
    }
  }
}

function changeShade(color, amount) {
  let hexString = '#';
  for (let i = 1; i < 6; i += 2) {
    const colorValue = parseInt(color.slice(i, i + 2), 16);
    const newColor = Math.min(Math.max(colorValue + amount, 0), 255);
    hexString += newColor.toString(16).padStart(2, '0');
  }
  return hexString;
}

function getBondInfo(atom1, atom2) {
  const bondString = [atom1.symbol, atom2.symbol].sort().toString().replace(',', '-');
  const bde = bondData.get(bondString);
  const radiiSum = atom1.r + atom2.r;
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

function morseForce(atom1, atom2, atomDist, electronDist, angleDiff) {
  const { bde, radiiSum } = getBondInfo(atom1, atom2);

  const reducedMass = (atom1.atomicMass * atom2.atomicMass) / (atom1.atomicMass + atom2.atomicMass);

  const forceConstant = (2 * Math.PI * morse.vibFreq) ** 2 * reducedMass;
  const a = Math.sqrt(forceConstant / (2 * bde));

  const naturalLog = Math.log(0.5 + Math.sqrt(morse.maxRepulsion / (2 * a * bde) + 0.25));
  let bondLength = naturalLog / a + radiiSum;
  bondLength *= angleDiff;

  const naturalBase = Math.E ** (-a * (atomDist - bondLength));
  const magnitude = 2 * bde * a * naturalBase * (naturalBase - 1);

  const shouldBond = electronDist < Math.log(2) / a + bondLength;

  return { morseMagnitude: magnitude, shouldBond: shouldBond };
}

function ljForce(dist, atom1, atom2) {
  // Lorentz-Berthelot rules
  const size = lj.sizeFactor * ((atom1.r + atom2.r) / 2);
  const dispersion = lj.dispersionFactor * Math.sqrt(atom1.polarizability * atom2.polarizability);

  const ljMagnitude = 24 * dispersion * ((2 * size ** 12) / dist ** 13 - size ** 6 / dist ** 7);
  return ljMagnitude;
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

      const atomAngle = calcAngle(atom1, atom2);
      let atomDist = calcDist(atom1, atom2);

      if (atomDist < atom1.r + atom2.r) {
        resolveCollision(atom1, atom2, atomAngle, atomDist);
        atomDist = atom1.r + atom2.r;
      }
      const { closestBond, bonded } = getClosestBond(atom1, atom2);
      if (!closestBond) {
        const ljMagnitude = ljForce(atomDist, atom1, atom2);

        atom1.applyForce(ljMagnitude, atomAngle);
        atom2.applyForce(ljMagnitude, atomAngle + Math.PI);

        continue;
      }

      const electron1 = closestBond.bond1.parentElectron || closestBond.bond1;
      const electron2 = closestBond.bond2.parentElectron || closestBond.bond2;

      attractElectrons(electron1, electron2);

      const electronAngle1 = calcAngle(electron1.parentAtom, electron2);
      const electronAngle2 = calcAngle(electron2.parentAtom, electron1);

      const angleDiff1 = calcAngleDiff(electronAngle1 + Math.PI, electron2.angle % (2 * Math.PI));
      const angleDiff2 = calcAngleDiff(electronAngle2 + Math.PI, electron1.angle % (2 * Math.PI));
      const maxAngleDiff = Math.max(angleDiff1, angleDiff2);

      const { morseMagnitude, shouldBond } = morseForce(atom1, atom2, atomDist, closestBond.dist, maxAngleDiff);

      atom1.applyForce(morseMagnitude, electronAngle1);
      atom2.applyForce(morseMagnitude, electronAngle2);

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

function calcAngleDiff(angle1, angle2) {
  const angleDiff = Math.min(Math.abs(angle1 - angle2), 2 * Math.PI - Math.abs(angle1 - angle2));
  return 1 + (angleDiff / Math.PI) * (1.15 - 1);
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

    const dist1 = bond1 instanceof Bond ? calcDist(bond1.parentElectron, bond1.bondedElectron) : Infinity;
    const dist2 = bond2 instanceof Bond ? calcDist(bond2.parentElectron, bond2.parentElectron) : Infinity;
    const shouldBreakBonds = bondPair.dist < dist1 && bondPair.dist < dist2;

    if (shouldBreakBonds && bond1 instanceof Bond) {
      atom1.breakBond(bond1);
      bond1.bondedAtom.breakBond(bond1.getMirrorBond());

      bondPair.bond1 = bond1 = bond1.parentElectron;
    }
    if (shouldBreakBonds && bond2 instanceof Bond) {
      atom2.breakBond(bond2);
      bond2.bondedAtom.breakBond(bond2.getMirrorBond());

      bondPair.bond2 = bond2 = bond2.parentElectron;
    }

    if (bond1 instanceof Electron && bond2 instanceof Electron) {
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

  for (const atom of atoms) {
    for (const bond of atom.bonds) {
      if (bond.drawConnection) bond.drawConnection();
    }
  }

  for (const atom of atoms) {
    for (const bond of atom.bonds) {
      bond.draw();
    }
  }

  catalogue.draw();

  let totalKineticEnergy = 0;
  for (const atom of atoms) {
    totalKineticEnergy += kineticEnergy(atom.atomicMass, Math.sqrt(atom.vy ** 2 + atom.vx ** 2));
  }
  kineticEnergyDisplay.innerHTML = Math.round(totalKineticEnergy / 10 ** 12);

  if (mouse.state === 'click') mouse.state = 'down';
}

function tabify(element) {
  const header = element.querySelector('.tabs-header');
  const content = element.querySelector('.tabs');
  const tab_headers = [...header.children];
  const tab_contents = [...content.children];
  tab_contents.forEach((x) => (x.style.display = 'none'));
  let current_tab_index = -1;

  function setTab(index) {
    if (current_tab_index > -1) {
      tab_headers[current_tab_index].style.fontWeight = 400;
      tab_contents[current_tab_index].style.display = 'none';
    }
    tab_headers[index].style.fontWeight = 800;
    tab_contents[index].style.display = 'flex';
    current_tab_index = index;
  }
  default_tab_index = 0;
  setTab(default_tab_index);
  tab_headers.forEach((x, i) => (x.onclick = (event) => setTab(i)));
}

// this is where the magic happens!
[...document.querySelectorAll('.tabs-container')].forEach((x) => tabify(x));

function loop(currentTime) {
  elapsedTime = (currentTime - lastTime) * simulationSpeed || 0;
  lastTime = currentTime;

  simulationStep();
  drawFrame();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

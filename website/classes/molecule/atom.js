import { elementData } from '../../data/element-data.js';
import { Bond } from './bond.js';
import { Electron } from './electron.js';
import { changeShade, decomposeForce, calcDist, getIonText } from '../../functions/utils.js';
class Atom {
  constructor(x, y, speed, symbol, simulation, clicked) {
    this.x = x;
    this.y = y;
    this.clicked = clicked;
    //random initial velocity
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;

    this.mouse = simulation.mouse;
    this.leftOffset = simulation.leftSidebar.width;
    //copies properties from element data (covalentRadius, electronegativity ...) into Atom object
    // valency = number of lone electrons that are free to bond
    // lonepairs = electron pairs that won't bond
    Object.assign(this, elementData.get(symbol));
    this.ionizationEnergies = [this.firstIonization, this.secondIonization, this.thirdIonization, this.fourthIonization].filter((x) => x != 0);

    //atom radius = covalent radius
    this.r = this.covalentRadius;

    this.bonds = [];
    this.previousBonds = [];

    this.friction = simulation.atomFriction;
    this.forces = simulation.forces;
    this.container = simulation.container;
    this.simulationScale = simulation.scale;
    this.atoms = simulation.atoms;

    this.checked = false;
    this.font = `${this.r * simulation.scale * 0.7}px sans-serif`;
    this.text = this.symbol;
    this.borderColor = changeShade(this.color, 10);
    this.charge = 0;

    const bondNum = this.valency + this.lonePairs;
    for (let i = 0; i < bondNum; i++) {
      const angle = i * ((2 * Math.PI) / bondNum);
      // charge for lone pair is 2, charge for free electron is 1
      const charge = i < this.lonePairs ? 2 : 1;
      // pushes electrons to bond array
      this.bonds.push(new Electron(this, angle, charge, i, this.color, simulation));
    }
  }

  destroy() {
    const index = this.atoms.indexOf(this);
    this.atoms.splice(index, 1);
  }

  applyForce(force, angle, elapsedTime) {
    const components = decomposeForce(force, angle);

    this.vx += (components.x / this.atomicMass) * elapsedTime;
    this.vy += (components.y / this.atomicMass) * elapsedTime;
  }

  repulseElectrons(electron1, electron2, elapsedTime) {
    const x = electron1.x - electron2.x;
    const y = electron1.y - electron2.y;

    const dist = Math.sqrt(x ** 2 + y ** 2);
    const forceAngle = Math.atan2(y, x);
    // get coulomb force between electrons
    const force = this.forces.electrostatic(electron1.charge, electron2.charge, dist, this.forces.repulsionCoulomb);
    // electrons 1 and 2 have reflected angles
    electron1.applyTorque(force, forceAngle, elapsedTime);
    electron2.applyTorque(force, forceAngle + Math.PI, elapsedTime);
  }

  createBond(parentElectron, bondedAtom, bondedElectron) {
    this.bonds[parentElectron.index] = new Bond(this, bondedAtom, parentElectron, bondedElectron);
  }

  breakBond(bond) {
    this.bonds[bond.parentElectron.index] = bond.parentElectron;
  }

  canCovalent() {
    return this.nonmetal && this.charge === 0 && this.valency != 0;
  }

  transferElectron(metalElectron, nonmetalElectron) {
    const dist1 = calcDist(metalElectron, nonmetalElectron.calcDoublePos(-1));
    const dist2 = calcDist(metalElectron, nonmetalElectron.calcDoublePos(1));
    const donorSign = dist1 < dist2 ? -1 : 1;
    const acceptorSign = donorSign * -1;

    metalElectron.donorTransfer(nonmetalElectron, donorSign);
    nonmetalElectron.acceptorTransfer(acceptorSign);
  }

  removeElectron(electron) {
    this.bonds.splice(electron.index, 1);
    for (let i = 0; i < this.bonds.length; i++) {
      this.bonds[i].index = i;
    }
  }

  dragUpdate() {
    this.x = this.mouse.x / this.simulationScale;
    this.y = this.mouse.y / this.simulationScale;
    let hidden = false;
    if (this.mouse.x > canvas.width - this.simulationScale * this.r || this.mouse.x < this.simulationScale * this.r) {
      hidden = true;

      const mousePos = this.mouse.getGlobalPos();
      this.mouse.cursor.style.left = `${mousePos.x - this.simulationScale * this.r}px`;
      this.mouse.cursor.style.top = `${mousePos.y - this.simulationScale * this.r}px`;
      this.mouse.cursor.style.width = `${this.r}px`;
      this.mouse.cursor.style.height = `${this.r}px`;
      this.mouse.cursor.style.visibility = 'visible';
    } else {
      this.mouse.cursor.style.visibility = 'hidden';
    }
    if (this.mouse.state === 'up') {
      if (!hidden) {
        this.clicked = false;
        this.vx = 0;
        this.vy = 0;
      } else {
        this.destroy();
      }
      this.mouse.cursor.style.visibility = 'hidden';
    }
  }

  containerCollision() {
    if (this.x - this.r < this.container.scaledPos.left) {
      this.x = this.container.scaledPos.left + this.r;
      this.vx = Math.abs(this.vx) + this.container.velocity.left;
    } else if (this.x + this.r > this.container.scaledPos.right) {
      this.x = this.container.scaledPos.right - this.r;
      this.vx = -Math.abs(this.vx) + this.container.velocity.right;
    }

    if (this.y - this.r < this.container.scaledPos.top) {
      this.y = this.container.scaledPos.top + this.r;
      this.vy = Math.abs(this.vy) + this.container.velocity.top;
    } else if (this.y + this.r > this.container.scaledPos.bottom) {
      this.y = this.container.scaledPos.bottom - this.r;
      this.vy = -Math.abs(this.vy) + this.container.velocity.bottom;
    }
  }

  addCharge(charge) {
    this.charge += charge;
    this.text = getIonText(this.symbol, this.charge);
  }

  update(elapsedTime) {
    this.x += this.vx * elapsedTime;
    this.y += this.vy * elapsedTime;

    this.vx *= this.friction;
    this.vy *= this.friction;

    for (let i = 0; i < this.bonds.length - 1; i++) {
      for (let j = i + 1; j < this.bonds.length; j++) {
        const electron1 = this.bonds[i].parentElectron || this.bonds[i];
        const electron2 = this.bonds[j].parentElectron || this.bonds[j];
        this.repulseElectrons(electron1, electron2, elapsedTime);
      }
    }

    if (this.clicked) {
      this.dragUpdate();
    } else {
      this.containerCollision();
    }

    for (const bond of this.bonds) {
      bond.update(elapsedTime);
    }
  }

  draw(ctx, scale) {
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
    ctx.fillText(this.text, this.x * scale, this.y * scale);
  }
}

export { Atom };

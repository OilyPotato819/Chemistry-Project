import { elementData } from '../../data/element-data.js';
import { Bond } from './bond.js';
import { Electron } from './electron.js';
import { changeShade, decomposeForce } from '../../functions/utils.js';

class Atom {
  constructor(x, y, speed, symbol, simulation, angle) {
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
    this.previousBonds = [];
    this.friction = simulation.atomFriction;
    this.electrostaticForce = simulation.forces.electrostatic.bind(simulation.forces);
    this.container = simulation.container;
    this.checked = false;
    this.font = `${this.r * simulation.scale * 0.7}px sans-serif`;
    this.borderColor = changeShade(this.color, 10);

    const bondNum = this.valency + this.lonePairs;
    for (let i = 0; i < bondNum; i++) {
      // const angle = i * ((2 * Math.PI) / bondNum);
      //charge for lone pair is 2, charge for free electron is 1
      const charge = i < this.lonePairs ? 2 : 1;
      //pushes electrons to bond array
      this.bonds.push(new Electron(this, angle, charge, i, this.color, simulation));
    }
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

    for (const bond of this.bonds) {
      bond.update(elapsedTime);
    }

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
    const force = this.electrostaticForce(electron1.charge, electron2.charge, dist);
    // electrons 1 and 2 have reflected angles
    const angle1 = forceAngle - electron1.angle;
    const angle2 = forceAngle + Math.PI - electron2.angle;

    electron1.applyTorque(force, angle1, elapsedTime);
    electron2.applyTorque(force, angle2, elapsedTime);
  }

  createBond(parentElectron, bondedAtom, bondedElectron) {
    this.bonds[parentElectron.index] = new Bond(this, bondedAtom, parentElectron, bondedElectron);
  }

  breakBond(bond) {
    this.bonds[bond.parentElectron.index] = bond.parentElectron;
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
    ctx.fillText(this.symbol, this.x * scale, this.y * scale);
  }
}

export { Atom };

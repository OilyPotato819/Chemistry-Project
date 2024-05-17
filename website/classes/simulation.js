import { Atom } from './molecule/atom.js';
import { Forces } from './forces.js';
import { Collision } from './collision.js';
import { calcForces } from '../functions/bonds.js';

class Simulation {
  constructor(simParams, cnv, mouse, catalogue, container) {
    this.speed = simParams.speed;
    this.scale = simParams.scale;
    this.atomFriction = simParams.atomFriction;
    this.electronFriction = simParams.electronFriction;

    this.forces = new Forces(simParams);
    this.collision = new Collision(simParams.cor);

    this.mouse = mouse;
    this.catalogue = catalogue;
    this.container = container;

    this.atoms = [];
    this.cnv = cnv;
    this.ctx = cnv.getContext('2d');
    this.lastTime = 0;
    this.elapsedTime = 0;

    this.atoms.push(new Atom(900, 280, 0, 'H', this, Math.PI / 2));
    this.atoms.push(new Atom(900, 370, 0, 'H', this, (3 / 2) * Math.PI));
    this.atoms.push(new Atom(850, 450, 0, 'H', this, 0));
    this.atoms.push(new Atom(950, 450, 0, 'H', this, 3));

    // this.randomAtoms(100, 150, ['H', 'O', 'C', 'N'], [6, 1, 1, 1]);

    this.createEventListeners();
  }

  randomAtoms(maxNum, spacing, symbols, weights) {
    let indexes = [];
    for (let i = 0; i < weights.length; i++) {
      indexes = [...indexes, ...Array(weights[i]).fill(i)];
    }

    let num = 0;
    for (let y = 0; y < this.cnv.height; y += spacing) {
      for (let x = 0; x < this.cnv.width; x += spacing) {
        const index = indexes[Math.floor(Math.random() * indexes.length)];
        const symbol = symbols[index];
        this.atoms.push(new Atom(x / this.scale, y / this.scale, 5, symbol, this));
        num++;
        if (num === maxNum) return;
      }
    }
  }

  createEventListeners() {
    document.addEventListener('mousemove', (event) => {
      this.mouse.update(event);
    });

    document.addEventListener('mousedown', () => {
      this.mouse.state = 'click';
    });

    document.addEventListener('mouseup', () => {
      this.mouse.state = 'up';
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.lastTime = 0;
      }
    });
  }

  update() {
    this.container.update(this.scale);

    calcForces(this.atoms, this.forces, this.elapsedTime, this.collision);
    for (const atom of this.atoms) {
      atom.update(this.elapsedTime);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);

    this.container.draw(this.ctx);

    for (const atom of this.atoms) {
      atom.draw(this.ctx, this.scale);
    }

    for (const atom of this.atoms) {
      for (const bond of atom.bonds) {
        if (bond.drawConnection) bond.drawConnection(this.ctx, this.scale);
      }
    }

    for (const atom of this.atoms) {
      for (const bond of atom.bonds) {
        bond.draw(this.ctx, this.scale);
      }
    }

    this.catalogue.draw(this.ctx);

    // let totalKineticEnergy = 0;
    // for (const atom of this.atoms) {
    //   totalKineticEnergy += kineticEnergy(atom.atomicMass, Math.sqrt(atom.vy ** 2 + atom.vx ** 2));
    // }
    // kineticEnergyDisplay.innerHTML = Math.round(totalKineticEnergy / 10 ** 12);

    if (this.mouse.state === 'click') this.mouse.state = 'down';
  }

  loop(currentTime) {
    this.elapsedTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) * this.speed;
    this.lastTime = currentTime;

    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

export { Simulation };

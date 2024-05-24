import { Atom } from "./molecule/atom.js";
import { Forces } from "./forces.js";
import { Collision } from "./collision.js";
import { calcForces } from "../functions/calc-forces.js";
import { getFormulas } from "../functions/get-formulas.js";

class Simulation {
  constructor(simParams, cnv, mouse, container) {
    this.speed = simParams.speed;
    this.scale = simParams.scale;
    this.atomFriction = simParams.atomFriction;
    this.electronFriction = simParams.electronFriction;
    this.bondCooldown = simParams.bondCooldown;
    this.electronegativityFactor = simParams.electronegativityFactor;

    this.forces = new Forces(simParams);
    this.collision = new Collision(simParams.cor);

    this.mouse = mouse;
    // this.catalogue = catalogue;
    this.container = container;

    this.atoms = [];
    this.cnv = cnv;
    this.ctx = cnv.getContext("2d");
    this.lastTime = 0;
    this.elapsedTime = 0;

    this.atoms.push(new Atom(700, 300, 0, "C", this, 0));
    this.atoms.push(new Atom(700, 450, 0, "H", this, Math.PI));
    this.atoms.push(new Atom(700, 600, 0, "H", this, Math.PI));
    this.atoms.push(new Atom(500, 600, 0, "Na", this, Math.PI));
    // this.atoms.push(new Atom(725, 600, 0, 'H', this, 0));

    // this.atoms.push(new Atom(600, 300, 0, 'C', this, 0));
    // this.atoms.push(new Atom(800, 500, 0, 'C', this, 0));

    // this.randomAtoms(50, 150, ['H', 'O', 'C', 'N'], [6, 1, 1, 1]);

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
        this.atoms.push(new Atom(x / this.scale, y / this.scale, 5, symbol, this, false));
        num++;
        if (num === maxNum) return;
      }
    }
  }

  createEventListeners() {
    document.addEventListener("mousemove", (event) => {
      this.mouse.update(event);
    });

    document.addEventListener("mousedown", () => {
      this.mouse.state = "click";
    });

    document.addEventListener("mouseup", () => {
      this.mouse.state = "up";
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.lastTime = 0;
      }
    });
  }

  update() {
    this.container.update(this.scale);

    calcForces(this);
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

    // this.catalogue.draw(this.ctx);

    // let totalKineticEnergy = 0;
    // for (const atom of this.atoms) {
    //   totalKineticEnergy += kineticEnergy(atom.atomicMass, Math.sqrt(atom.vy ** 2 + atom.vx ** 2));
    // }
    // kineticEnergyDisplay.innerHTML = Math.round(totalKineticEnergy / 10 ** 12);

    if (this.mouse.state === "click") this.mouse.state = "down";
  }

  loop(currentTime) {
    getFormulas(this.atoms);
    this.elapsedTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) * this.speed;
    this.lastTime = currentTime;

    this.update();
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

export { Simulation };

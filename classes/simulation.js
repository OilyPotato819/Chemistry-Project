import { Atom } from './molecule/atom.js';
import { Forces } from './forces.js';
import { Collision } from './collision.js';
import { calcForces } from '../functions/calc-forces.js';
import { getFormulas } from '../functions/get-formulas.js';

class Simulation {
  constructor(simParams, forceParams, mouse, keyboard, container, leftSidebar, rightSidebar) {
    Object.assign(this, simParams);
    delete this.cor;

    this.leftSidebar = leftSidebar;
    this.rightSidebar = rightSidebar;

    this.forces = new Forces(forceParams);
    this.collision = new Collision(simParams.cor);

    this.keyboard = keyboard;
    this.mouse = mouse;
    this.container = container;

    this.atoms = [];
    this.ctx = canvas.getContext('2d');
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.pause = false;
    this.lines = true;
    // this.atoms.push(new Atom(400, 600, 0, 'Nh', this, false));
    // this.atoms.push(new Atom(1000, 800, 0, 'O', this, false));

    // this.randomAtoms(50, 150, ['H', 'O', 'C', 'N'], [6, 1, 1, 1]);

    this.createEventListeners();

    this.pauseButton = document.getElementById('pause');
    this.pauseButton.addEventListener('click', () => {
      if (this.pauseButton.innerHTML === 'pause') {
        this.pause = true;
        this.pauseButton.innerHTML = 'play';
      } else {
        this.pause = false;
        this.pauseButton.innerHTML = 'pause';
      }
    });

    this.linesButton = document.getElementById('lines');
    this.linesButton.addEventListener('click', () => {
      if (this.linesButton.innerHTML === 'hide bond lines') {
        this.lines = false;
        this.linesButton.innerHTML = 'see bond lines';
      } else {
        this.lines = true;
        this.linesButton.innerHTML = 'hide bond lines';
      }
    });
  }

  randomAtoms(maxNum, spacing, symbols, weights) {
    let indexes = [];
    for (let i = 0; i < weights.length; i++) {
      indexes = [...indexes, ...Array(weights[i]).fill(i)];
    }

    let num = 0;
    for (let y = 0; y < canvas.height; y += spacing) {
      for (let x = 0; x < canvas.width; x += spacing) {
        const index = indexes[Math.floor(Math.random() * indexes.length)];
        const symbol = symbols[index];
        this.atoms.push(new Atom(x / this.scale, y / this.scale, 5, symbol, this, false));
        num++;
        if (num === maxNum) return;
      }
    }
  }

  createEventListeners() {
    document.addEventListener('mousemove', (event) => {
      this.mouse.updatePos(event);
    });

    document.addEventListener('mousedown', (event) => {
      this.mouse.mousedown(event);
    });

    document.addEventListener('mouseup', (event) => {
      this.mouse.mouseup(event);
    });

    document.addEventListener('keydown', (event) => {
      this.keyboard.keydown(event);
    });

    document.addEventListener('keyup', (event) => {
      this.keyboard.keyup(event);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.lastTime = 0;
      }
    });

    canvas.addEventListener('contextmenu', function (event) {
      event.preventDefault();
    });
  }

  update() {
    this.container.update(this.scale);
    this.mouse.updateSpeed(this.elapsedTime);

    if (this.atoms.length) calcForces(this);
    for (const atom of this.atoms) {
      atom.update(this.elapsedTime);
    }

    this.mouse.updateState();
  }

  draw() {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.container.draw(this.ctx);

    for (const atom of this.atoms) {
      atom.draw(this.ctx, this.scale);
    }

    for (const atom of this.atoms) {
      for (const bond of atom.covalentBonds) {
        if (this.lines) bond.drawConnection(this.ctx, this.scale);
      }
    }

    for (const atom of this.atoms) {
      for (const bond of atom.covalentBonds) {
        bond.draw(this.ctx, this.scale);
      }
      for (const electron of atom.unpairedElectrons) {
        electron.draw(this.ctx, this.scale);
      }
      for (const lonePair of atom.lonePairs) {
        lonePair.draw(this.ctx, this.scale);
      }
      for (const electron of atom.transferElectrons) {
        electron.draw(this.ctx, this.scale);
      }
    }
  }

  loop(currentTime) {
    // this.leftSidebar.element;
    // this.leftSidebar.toggleBtn.style.display;
    getFormulas(this.atoms);
    this.elapsedTime = this.lastTime === 0 ? 0 : (currentTime - this.lastTime) * this.speed;
    this.lastTime = currentTime;
    if (!this.pause) {
      this.update();
    }
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

export { Simulation };

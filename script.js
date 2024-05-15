import { Atom } from './classes/molecule/atom.js';
import { Catalogue } from './classes/ui/catalogue.js';
import { Container } from './classes/ui/container.js';
import { Mouse } from './classes/ui/mouse.js';
import { calcForces } from './functions/bonds.js';
import { kineticEnergy } from './functions/utils.js';
import { Forces } from './classes/forces.js';
import { Collision } from './classes/collision.js';

let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 32;

let kineticEnergyDisplay = document.getElementById('ke');

let simParams = {
  speed: 0.01,
  scale: 0.5,
  atomFriction: 0.999,
  electronFriction: 0.99,
  forces: new Forces(10000, 3, 10, 0.1, 50),
  collision: new Collision(0.5),
};

let lastTime;
let elapsedTime;
let atoms = [];
let mouse = new Mouse();
// let catalogue = new Catalogue(cnv.width * 0.7, 0, cnv.width * 0.3, cnv.height);
let catalogue = new Catalogue(cnv.width, cnv.height, 0, 0);
// let container = new Container(0, cnv.width * (2 / 3), 0, cnv.height, mouse, catalogue);
let container = new Container(0, cnv.width, 0, cnv.height, mouse, catalogue, simParams.scale);

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

function simulationStep(elapsedTime) {
  container.update(simParams.scale);

  calcForces(atoms, simParams.forces, simParams.collision, elapsedTime);
  for (const atom of atoms) {
    atom.update(elapsedTime);
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  container.draw(ctx);

  for (const atom of atoms) {
    atom.draw(ctx, simParams.scale);
  }

  for (const atom of atoms) {
    for (const bond of atom.bonds) {
      if (bond.drawConnection) bond.drawConnection(ctx, simParams.scale);
    }
  }

  for (const atom of atoms) {
    for (const bond of atom.bonds) {
      bond.draw(ctx, simParams.scale);
    }
  }

  catalogue.draw(ctx);

  let totalKineticEnergy = 0;
  for (const atom of atoms) {
    totalKineticEnergy += kineticEnergy(atom.atomicMass, Math.sqrt(atom.vy ** 2 + atom.vx ** 2));
  }
  kineticEnergyDisplay.innerHTML = Math.round(totalKineticEnergy / 10 ** 12);

  if (mouse.state === 'click') mouse.state = 'down';
}

function loop(currentTime) {
  elapsedTime = (currentTime - lastTime) * simParams.speed || 0;
  lastTime = currentTime;

  simulationStep(elapsedTime);
  drawFrame();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

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
      atoms.push(new Atom(x, y, 5, symbol, container, simParams));
      num++;
      if (num === maxNum) return;
    }
  }
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
  const default_tab_index = 0;
  setTab(default_tab_index);
  tab_headers.forEach((x, i) => (x.onclick = () => setTab(i)));
}

// this is where the magic happens!
[...document.querySelectorAll('.tabs-container')].forEach((x) => tabify(x));

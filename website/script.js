import { Catalogue } from './classes/ui/catalogue.js';
import { Container } from './classes/ui/container.js';
import { Mouse } from './classes/ui/mouse.js';
import { Simulation } from './classes/simulation.js';
import { kineticEnergy } from './functions/utils.js';

let cnv = document.getElementById('canvas');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 32;

let kineticEnergyDisplay = document.getElementById('ke');

let simParams = {
  speed: 0.01,
  scale: 0.5,
  atomFriction: 1,
  electronFriction: 0.95,
  bondCooldown: 300,
  coulomb: 10000,
  sizeFactor: 2,
  dispersionFactor: 5,
  vibFreq: 0.1,
  maxRepulsion: 50,
  minBdeFactor: 0.01,
  unbondedFactor: 0,
  cor: 0.5,
};

const mouse = new Mouse();
// let catalogue = new Catalogue(cnv.width * 0.7, 0, cnv.width * 0.3, cnv.height);
const catalogue = new Catalogue(cnv.width, cnv.height, 0, 0);
// let container = new Container(0, cnv.width * (2 / 3), 0, cnv.height, mouse, catalogue);
const container = new Container(0, cnv.width, 0, cnv.height, mouse, catalogue, simParams.scale);

let simulation = new Simulation(simParams, cnv, mouse, catalogue, container);

requestAnimationFrame(simulation.loop.bind(simulation));

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

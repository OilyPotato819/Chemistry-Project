import { Catalogue } from "./classes/ui/catalogue.js";
import { Container } from "./classes/ui/container.js";
import { Mouse } from "./classes/ui/mouse.js";
import { Simulation } from "./classes/simulation.js";
import { kineticEnergy } from "./functions/utils.js";
import { elementData } from "./data/element-data.js";

let cnv = document.getElementById("canvas");

let periodicTable = document.getElementById("periodic_table");

let containerEl = document.getElementById("container");

function resizeCanvas() {
  const containerHeight = containerEl.clientHeight;
  const canvasWidth = containerEl.clientWidth * 0.65;

  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${containerHeight}px`;
  canvas.width = canvasWidth;
  canvas.height = containerHeight;
}
resizeCanvas();

// Resize canvas whenever the window is resized
window.addEventListener("resize", resizeCanvas);

periodicTable.children[0].addEventListener("click", function (event) {
  console.log(event.target.innerHTML);
});
periodicTable.children[1].addEventListener("click", function (event) {
  console.log(event.target.innerHTML);
});

const periodicTableDivs = Array.prototype.slice
  .call(periodicTable.children[0].children)
  .concat(Array.prototype.slice.call(periodicTable.children[1].children));

for (let i = 0; i < periodicTableDivs.length; i++) {
  for (let j = 0; j < periodicTableDivs[i].children.length; j++) {
    periodicTableDivs[i].children[j].style.backgroundColor = elementData.get(
      periodicTableDivs[i].children[j].innerHTML
    ).color;
  }
}

let kineticEnergyDisplay = document.getElementById("ke");

let simParams = {
  speed: 0.01,
  scale: 0.5,
  atomFriction: 1,
  electronFriction: 0.95,
  bondCooldown: 300,
  coulomb: 10000,
  dispersionFactor: 3,
  vibFreq: 0.1,
  maxRepulsion: 50,
  minBdeFactor: 0.01,
  unbondedFactor: 0.1,
  electronegativityFactor: 10,
  cor: 0.5,
};

const mouse = new Mouse();
// let catalogue = new Catalogue(cnv.width * 0.7, 0, cnv.width * 0.3, cnv.height);
// const catalogue = new Catalogue(cnv.width, cnv.height, 0, 0);
// let container = new Container(0, cnv.width * (2 / 3), 0, cnv.height, mouse, catalogue);
const container = new Container(0, cnv.width, 0, cnv.height, mouse, simParams.scale);

let simulation = new Simulation(simParams, cnv, mouse, container);

function periodicTableClick(event) {
  simulation.atoms.push(new Atom(mouse.x, mouse.y, 0, event.target.innerHTML, simulation, true));
}

requestAnimationFrame(simulation.loop.bind(simulation));

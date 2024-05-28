import { Container } from "./classes/ui/container.js";
import { Mouse } from "./classes/ui/mouse.js";
import { Simulation } from "./classes/simulation.js";
import { kineticEnergy } from "./functions/utils.js";
import { elementData } from "./data/element-data.js";
import { Atom } from "./classes/molecule/atom.js";
import { Sidebar } from "./classes/ui/sidebar.js";

let cnv = document.getElementById("canvas");
let periodicTable = document.getElementById("periodic_table");
const rightSidebar = new Sidebar(
  document.getElementById("sidebar-r"),
  document.getElementById("toggle-r"),
  1,
  40
);
const leftSidebar = new Sidebar(
  document.getElementById("sidebar-l"),
  document.getElementById("toggle-l"),
  0,
  0
);

let forceParams = {
  bondCoulomb: 2000000,
  attractionCoulomb: 1000,
  repulsionCoulomb: 8000,
  potentialCoulomb: 6e9,
  maxIonicBondLength: 1.4,
  nucleusCharge: 200,
  dispersionFactor: 3,
  vibFreq: 0.1,
  maxRepulsion: 50,
  minBdeFactor: 0.001,
  unbondedFactor: 0.1,
  kineticFactor: 0.00008,
};

let simParams = {
  speed: 0.01,
  scale: 0.5,
  atomFriction: 1,
  electronFriction: 0.95,
  bondCooldown: 300,
  cor: 0.7,
};

function resizeCanvas() {
  rightSidebar.resize();
  leftSidebar.resize();

  const cnvStyle = window.getComputedStyle(cnv);
  const marginLeft = +cnvStyle.marginLeft.replace("px", "");
  const marginRight = +cnvStyle.marginRight.replace("px", "");
  const marginTop = +cnvStyle.marginTop.replace("px", "");
  const marginBottom = +cnvStyle.marginBottom.replace("px", "");

  cnv.width = window.innerWidth - rightSidebar.width - leftSidebar.width - marginRight - marginLeft;
  cnv.height = window.innerHeight - marginTop - marginBottom;
}

resizeCanvas();

const mouse = new Mouse(document.getElementById("cursor"));
const container = new Container(
  0,
  cnv.width,
  0,
  cnv.height,
  mouse,
  simParams.scale,
  leftSidebar,
  rightSidebar
);
rightSidebar.container = container;
leftSidebar.container = container;
let simulation = new Simulation(
  simParams,
  forceParams,
  mouse,
  container,
  leftSidebar,
  rightSidebar
);

window.addEventListener("resize", () => {
  resizeCanvas();
  container.maximise(simParams.scale);
});

for (const row of periodicTable.children[1].children) {
  for (const cell of row.children) {
    if (cell.className != "show") continue;
    cell.style.backgroundColor = elementData.get(cell.innerHTML).color;
    cell.addEventListener("mousedown", periodicTableClick);
  }
}

function periodicTableClick(event) {
  simulation.atoms.push(
    new Atom(
      mouse.x / simulation.scale,
      mouse.y / simulation.scale,
      0,
      event.target.innerHTML,
      simulation,
      true
    )
  );
}

requestAnimationFrame(simulation.loop.bind(simulation));

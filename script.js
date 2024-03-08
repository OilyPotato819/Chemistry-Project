let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = 800;
cnv.height = 800;

class Atom {
  constructor(x, y, r, mass, color) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.r = r;
    this.mass = mass;
    this.color = color;
  }

  update() {
    for (const atom of atoms) {
      if (atom === this) continue;
      const angle = calcAngle(this, atom);
      const dist = calcDist(this, atom);
      const force = LJForce(dist, 10, 100);
      const components = decomposeForce(angle, force);

      this.vx += components.x / this.mass;
      this.vy += components.y / this.mass;
      this.vx *= 0.9999;
      this.vy *= 0.9999;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x + this.r > cnv.width) {
      this.x = cnv.width - this.r;
      this.vx *= -1;
    } else if (this.x - this.r < 0) {
      this.x = this.r;
      this.vx *= -1;
    }

    if (this.y + this.r > cnv.height) {
      this.y = cnv.height - this.r;
      this.vy *= -1;
    } else if (this.y - this.r < 0) {
      this.y = this.r;
      this.vy *= -1;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

let atoms = [];

for (let n = 0; n < 20; n++) {
  atoms.push(new Atom((n % 5) * 150 + 20, Math.floor(n / 5) * 150 + 20, 20, 1, `hsl(${n * 50}, 50, 50)`));
}

function calcAngle(obj1, obj2) {
  return Math.atan2(obj1.y - obj2.y, obj1.x - obj2.x);
}

function calcDist(obj1, obj2) {
  return Math.sqrt((obj1.y - obj2.y) ** 2 + (obj1.x - obj2.x) ** 2);
}

function decomposeForce(angle, magnitude) {
  return { x: magnitude * Math.cos(angle), y: magnitude * Math.sin(angle) };
}

function LJForce(distance, dispersion, size) {
  return Math.min(24 * dispersion * ((2 * size ** 12) / distance ** 13 - size ** 6 / distance ** 7));
}

function draw() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  for (const atom of atoms) {
    atom.update();
  }
  for (const atom of atoms) {
    atom.draw();
  }
  requestAnimationFrame(draw);
}

draw();

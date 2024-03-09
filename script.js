let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = window.innerWidth - 22;
cnv.height = window.innerHeight - 22;

class Atom {
  constructor(x, y, r, speed, mass, color) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * speed * 2 - speed;
    this.vy = Math.random() * speed * 2 - speed;
    this.r = r;
    this.mass = mass;
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    for (const atom of atoms) {
      if (atom === this) continue;

      const angle = calcAngle(this, atom);
      let dist = calcDist(this, atom);

      if (dist < this.r + atom.r) {
        resolveCollision(this, atom, angle, dist);
        dist = this.r + atom.r;
      }

      const force = LJForce(dist, 0.5, 22);
      const components = decomposeForce(angle, force);

      this.vx += components.x / this.mass;
      this.vy += components.y / this.mass;
    }

    if (this.x - this.r < container.pos[0]) {
      this.x = container.pos[0] + this.r;
      this.vx = Math.abs(this.vx) + container.velocity[0];
    } else if (this.x + this.r > container.pos[1]) {
      this.x = container.pos[1] - this.r;
      this.vx = -Math.abs(this.vx) + container.velocity[1];
    }

    if (this.y - this.r < container.pos[2]) {
      this.y = container.pos[2] + this.r;
      this.vy = Math.abs(this.vy) + container.velocity[2];
    } else if (this.y + this.r > container.pos[3]) {
      this.y = container.pos[3] - this.r;
      this.vy = -Math.abs(this.vy) + container.velocity[3];
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.state = 'up';
  }

  update(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
  }
}

class Container {
  constructor(pos) {
    this.pos = pos;
    this.velocity = [0, 0, 0, 0];
    this.drag = [null, null];
    this.clickDist = 10;
  }

  update() {
    if (mouse.state === 'up') {
      this.drag = [null, null];
      return;
    }

    if (this.drag[0] != null) {
      const index = this.drag[0];
      this.velocity[index] = mouse.x - this.pos[index];
      this.pos[index] = mouse.x;
    }

    if (this.drag[1] != null) {
      const index = this.drag[1];
      this.velocity[index] = mouse.y - this.pos[index];
      this.pos[index] = mouse.y;
    }

    if (mouse.state != 'click') return;

    for (let i = 0; i < this.pos.length; i++) {
      const mousePos = i < 2 ? mouse.x : mouse.y;
      const dist = Math.abs(mousePos - this.pos[i]);
      if (dist > this.clickDist) continue;
      this.drag[Math.floor(i / 2)] = i;
    }
  }

  draw() {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.pos[0], this.pos[2], this.pos[1] - this.pos[0], this.pos[3] - this.pos[2]);
  }
}

let atoms = [];
let mouse = new Mouse();
let container = new Container([0, cnv.width, 0, cnv.height]);

const atomNum = 200;
for (let n = 0; n < atomNum; n++) {
  const colorStep = 360 / atomNum;
  const color = `rgb(${n * colorStep}, ${360 - n * colorStep}, ${360 - n * colorStep})`;
  atoms.push(new Atom((n % 15) * 20 + 20, Math.floor(n / 15) * 20 + 20, 10, 1, 1, color));
}

document.addEventListener('mousemove', (event) => {
  mouse.update(event);
});

document.addEventListener('mousedown', () => {
  mouse.state = 'click';
});

document.addEventListener('mouseup', () => {
  mouse.state = 'up';
});

function resolveCollision(obj1, obj2, angle, dist) {
  const m1 = obj1.mass;
  const m2 = obj2.mass;
  const x1 = [obj1.x, obj1.y];
  const x2 = [obj2.x, obj2.y];
  const v1 = [obj1.vx, obj1.vy];
  const v2 = [obj2.vx, obj2.vy];

  const v1New = collisionVelocities(m1, m2, x1, x2, v1, v2);
  const v2New = collisionVelocities(m2, m1, x2, x1, v2, v1);

  [obj1.vx, obj1.vy] = v1New;
  [obj2.vx, obj2.vy] = v2New;

  separate(obj1, obj2, angle, dist);
}

function collisionVelocities(m1, m2, x1, x2, v1, v2) {
  const C = 0.8;

  let diffX = [x1[0] - x2[0], x1[1] - x2[1]];
  let diffV = [v1[0] - v2[0], v1[1] - v2[1]];

  let dotProduct = diffV[0] * diffX[0] + diffV[1] * diffX[1];
  let normSquared = diffX[0] ** 2 + diffX[1] ** 2;
  let scalar = ((C * 2 * m2) / (m1 + m2)) * (dotProduct / normSquared);

  return [v1[0] - scalar * diffX[0], v1[1] - scalar * diffX[1]];
}

function separate(obj1, obj2, angle, dist) {
  const overlap = dist - (obj1.r + obj2.r);
  const move_x = overlap * Math.cos(angle);
  const move_y = overlap * Math.sin(angle);

  obj1.x -= move_x;
  obj1.y -= move_y;
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
  return 24 * dispersion * ((2 * size ** 12) / distance ** 13 - size ** 6 / distance ** 7);
}

function draw() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);

  container.update();

  for (const atom of atoms) {
    atom.update();
  }

  container.draw();
  for (const atom of atoms) {
    atom.draw();
  }

  if (mouse.state === 'click') mouse.state = 'down';

  requestAnimationFrame(draw);
}

draw();

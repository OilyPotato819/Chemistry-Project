let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = 800;
cnv.height = 800;

class Atom {
  constructor(x, y, r, mass, color) {
    this.x = x;
    this.y = y;
    this.vx = 10;
    this.vy = 10;
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

      // this.vx += components.x / this.mass;
      // this.vy += components.y / this.mass;

      if (dist <= this.r + atom.r) resolveCollision(this, atom, angle, dist);
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

for (let n = 0; n < 2; n++) {
  atoms.push(new Atom((n % 5) * 150 + 20, Math.floor(n / 5) * 150 + 20, 20, 1, `hsl(${n * 50}, 50, 50)`));
}

function resolveCollision(obj1, obj2, angle, dist) {
  separate(obj1, obj2, angle, dist);

  let unitVector = [Math.cos(angle), Math.sin(angle)];
  const vector1X = vectorProjection([obj1.vx, obj1.vy], unitVector);
  const vector1Y = [obj1.vx - vector1X[0], obj1.vy - vector1X[1]];
  const vector2X = vectorProjection([obj2.vx, obj2.vy], unitVector);
  const vector2Y = [obj2.vx - vector2X[0], obj2.vy - vector2X[1]];

  const C = 1;
  const totalMomentum = obj1.mass * vector1X[0] + obj2.mass * vector2X[0];
  const totalMass = obj1.mass + obj2.mass;

  const magnitude1 = (C * obj2.mass * (vector2X[0] - vector1X[0]) + totalMomentum) / totalMass;
  const magnitude2 = (C * obj1.mass * (vector1X[0] - vector2X[0]) + totalMomentum) / totalMass;

  const newVector1X = setMagnitude(vector1X, magnitude1);
  const newVector2X = setMagnitude(vector2X, magnitude2);

  obj1.vx = newVector1X[0] + vector1Y[0];
  obj1.vy = newVector1X[1] + vector1Y[1];
  obj2.vx = newVector2X[0] + vector2Y[0];
  obj2.vy = newVector2X[1] + vector2Y[1];

  // all terrible
}

function setMagnitude(vector, magnitude) {
  const length = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
  return [(vector[0] / length) * magnitude, (vector[1] / length) * magnitude];
}

function vectorProjection(a, b) {
  const dotProduct = a[0] * b[0] + a[1] * b[1];
  return [dotProduct * b[0], dotProduct * b[1]];
}

function separate(obj1, obj2, angle, dist) {
  let overlap = obj1.r + obj2.r - dist;
  overlap *= obj1.x > obj2.x ? 1 : -1;

  const vector = { x: overlap * Math.cos(angle), y: overlap * Math.sin(angle) };

  obj1.x += vector.x;
  obj1.y += vector.y;

  obj2.x -= vector.x;
  obj2.y -= vector.y;
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
  if (distance < 100) return 0;
  return 24 * dispersion * ((2 * size ** 12) / distance ** 13 - size ** 6 / distance ** 7);
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

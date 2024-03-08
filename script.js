let cnv = document.getElementById('canvas');
let ctx = cnv.getContext('2d');

cnv.width = 300;
cnv.height = 600;

class Atom {
  constructor(x, y, vx, vy, r, mass, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
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

      //this.vx += components.x / this.mass;
      //this.vy += components.y / this.mass;

      if (dist < this.r + atom.r) resolveCollision(this, atom, angle, dist);
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

let atom1 = new Atom(90, 100, 5, 5, 20, 1, "black");
let atom2 = new Atom(100, 300, 5, -5, 20, 1, "black");

let atoms = [atom1, atom2];

//for (let n = 0; n < 3; n++) {
//  atoms.push(new Atom((n % 5) * 150 + 20, Math.floor(n) * 150 + 20, 20, 1, `hsl(${n * 50}, 50, 50)`));
//}

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
  let diffX = [x1[0] - x2[0], x1[1] - x2[1]];
  let diffV = [v1[0] - v2[0], v1[1] - v2[1]];

  let dotProduct = diffV[0] * diffX[0] + diffV[1] * diffX[1];
  let normSquared = diffX[0] ** 2 + diffX[1] ** 2;
  let scalar = (2 * m2 / (m1 + m2)) * (dotProduct / normSquared);
    
  return [v1[0] - scalar * diffX[0], v1[1] - scalar * diffX[1]];
}

function separate(obj1, obj2, angle, dist) {
  let overlap = obj1.r + obj2.r - dist;
  overlap *= Math.sign(Math.cos(angle));

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
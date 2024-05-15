class Collision {
  constructor(cor) {
    this.cor = cor;
  }

  resolve(obj1, obj2, angle, dist) {
    const m1 = obj1.atomicMass;
    const m2 = obj2.atomicMass;
    const x1 = [obj1.x, obj1.y];
    const x2 = [obj2.x, obj2.y];
    const v1 = [obj1.vx, obj1.vy];
    const v2 = [obj2.vx, obj2.vy];

    const v1New = this.velocities(m1, m2, x1, x2, v1, v2);
    const v2New = this.velocities(m2, m1, x2, x1, v2, v1);

    [obj1.vx, obj1.vy] = v1New;
    [obj2.vx, obj2.vy] = v2New;

    this.separate(obj1, obj2, angle, dist);
  }

  velocities(m1, m2, x1, x2, v1, v2) {
    const diffX = [x1[0] - x2[0], x1[1] - x2[1]];
    const diffV = [v1[0] - v2[0], v1[1] - v2[1]];

    const dotProduct = diffV[0] * diffX[0] + diffV[1] * diffX[1];
    const normSquared = diffX[0] ** 2 + diffX[1] ** 2;
    const scalar = (this.cor * 2 * m2) / (m1 + m2);
    const coefficient = normSquared === 0 ? 0 : scalar * (dotProduct / normSquared);

    return [v1[0] - coefficient * diffX[0], v1[1] - coefficient * diffX[1]];
  }

  separate(obj1, obj2, angle, dist) {
    const overlap = dist - (obj1.r + obj2.r) * 1.01;
    const move_x = overlap * Math.cos(angle);
    const move_y = overlap * Math.sin(angle);

    obj1.x -= move_x;
    obj1.y -= move_y;
  }
}

export { Collision };

import { changeShade } from '../../functions/utils.js';

class Electron {
  constructor(parentAtom, angle, charge, index, parentColor, friction) {
    this.parentAtom = parentAtom;
    this.atomRadius = parentAtom.r;
    this.angle = angle;
    this.calcPosition();
    this.angularVelocity = 0;
    this.charge = charge;
    this.index = index;
    this.type = 'electron';
    this.friction = friction;

    const shadeSign = this.charge === 1 ? 1 : -1;
    this.color = changeShade(parentColor, shadeSign * 30);
  }

  calcPosition() {
    this.x = this.parentAtom.x + this.atomRadius * Math.cos(this.angle);
    this.y = this.parentAtom.y + this.atomRadius * Math.sin(this.angle);
  }

  applyTorque(magnitude, angle, elapsedTime) {
    const torque = this.atomRadius * magnitude * Math.sin(angle);
    const inertia = this.atomRadius ** 2;
    const angularAcceleration = torque / inertia;

    this.angularVelocity += angularAcceleration * elapsedTime;
  }

  update(elapsedTime) {
    this.angle += this.angularVelocity * elapsedTime;
    this.calcPosition();
    this.angularVelocity *= this.friction;
  }

  draw(ctx, scale) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x * scale, this.y * scale, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export { Electron };

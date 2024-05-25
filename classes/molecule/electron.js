import { changeShade, getRGB } from '../../functions/utils.js';

class Electron {
  constructor(parentAtom, angle, charge, index, parentColor, simulation) {
    this.parentAtom = parentAtom;
    this.atomRadius = parentAtom.r;
    this.angle = angle;
    this.charge = charge;
    this.index = index;
    this.friction = simulation.electronFriction;

    this.updatePosition(this.angle);
    this.angularVelocity = 0;
    this.type = charge === 1 ? 'single' : 'double';

    this.target = null;
    this.transferTime = 5;
    this.transferTimer = 0;
    this.transferSpeeds = {};
    this.angleOffset = 0;
    this.xOffset = 0;
    this.yOffset = 0;

    this.bondCooldown = simulation.bondCooldown * simulation.speed;
    this.bondTimer = 0;

    this.color = changeShade(parentColor, 30);
    this.r = 5;
    this.doubleSpacing = 1.7;
    this.doubleAngleDiff = (this.doubleSpacing * this.r) / this.atomRadius;
  }

  updatePosition(angle) {
    const position = this.calcPosition(angle);
    this.x = position.x;
    this.y = position.y;
  }

  calcPosition(angle) {
    const x = this.parentAtom.x + this.atomRadius * Math.cos(angle);
    const y = this.parentAtom.y + this.atomRadius * Math.sin(angle);
    return { x: x, y: y };
  }

  calcDoublePos(sign) {
    const angle = this.angle + sign * this.doubleAngleDiff;
    return this.calcPosition(angle);
  }

  applyTorque(magnitude, angle, elapsedTime) {
    const torque = this.atomRadius * magnitude * Math.sin(angle - this.angle);
    const inertia = this.atomRadius ** 2;
    const angularAcceleration = torque / inertia;

    this.angularVelocity += angularAcceleration * elapsedTime;
  }

  prepareForTransfer(target) {
    if (target) {
      this.target = target;
      this.transferSpeeds.pos = 1 / this.transferTime;

      const targetColor = getRGB(target.color);
      const currentColor = getRGB(this.color);

      const redSpeed = (targetColor[0] - currentColor[0]) / this.transferTime;
      const greenSpeed = (targetColor[1] - currentColor[1]) / this.transferTime;
      const blueSpeed = (targetColor[2] - currentColor[2]) / this.transferTime;

      this.transferSpeeds.rgb = [redSpeed, greenSpeed, blueSpeed];
    } else {
      this.transferSpeeds.angle = this.doubleAngleDiff / this.transferTime;
    }

    this.transferTimer = this.transferTime;
  }

  finishTransfer() {
    if (this.target) {
      this.parentAtom.removeElectron(this);
    } else {
      this.type = 'double';
      this.angleOffset = 0;
    }
  }

  moveToTarget() {
    const targetPos = this.target.calcDoublePos(-1);
    const dx = targetPos.x - this.x;
    const dy = targetPos.y - this.y;

    const distFactor = (this.transferTime - this.transferTimer) * this.transferSpeeds.pos;
    this.xOffset = dx * distFactor;
    this.yOffset = dy * distFactor;
  }

  changeColor(elapsedTime) {
    const currentColor = getRGB(this.color);

    const red = currentColor[0] + this.transferSpeeds.rgb[0] * elapsedTime;
    const green = currentColor[1] + this.transferSpeeds.rgb[1] * elapsedTime;
    const blue = currentColor[2] + this.transferSpeeds.rgb[2] * elapsedTime;

    this.color = `rgb(${red}, ${green}, ${blue})`;
  }

  moveToDouble(elapsedTime) {
    this.angleOffset += this.transferSpeeds.angle * elapsedTime;
  }

  update(elapsedTime) {
    if (this.transferTimer < 0) {
      this.finishTransfer();
    }

    if (this.target) {
      this.moveToTarget();
      this.changeColor(elapsedTime);
    } else if (this.transferTimer > 0) {
      this.moveToDouble(elapsedTime);
    }

    if (this.transferTimer > 0) {
      this.transferTimer -= elapsedTime;
      return;
    }

    this.angle += this.angularVelocity * elapsedTime;
    this.updatePosition(this.angle);
    this.angularVelocity *= this.friction;
  }

  draw(ctx, scale) {
    if (this.xOffset || this.yOffset) {
      const x = this.x + this.xOffset;
      const y = this.y + this.yOffset;

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, this.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.angleOffset) {
      const pos = this.calcPosition(this.angle + this.angleOffset);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(pos.x * scale, pos.y * scale, this.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'single') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x * scale, this.y * scale, this.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'double') {
      const pos1 = this.calcDoublePos(1);
      const pos2 = this.calcDoublePos(-1);

      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(pos1.x * scale, pos1.y * scale, this.r, 0, Math.PI * 2);
      ctx.arc(pos2.x * scale, pos2.y * scale, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export { Electron };

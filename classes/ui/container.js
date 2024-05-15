class Container {
  constructor(left, right, top, bottom, mouse, catalogue, scale) {
    this.canvasPos = { left: left, right: right, top: top, bottom: bottom };
    this.scaledPos = {};
    this.calcPos(scale);

    this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
    this.drag = { x: null, y: null };
    this.clickDist = 10;
    this.mouse = mouse;
    this.catalogue = catalogue;
  }

  calcPos(scale) {
    for (const side in this.canvasPos) {
      this.scaledPos[side] = this.canvasPos[side] / scale;
    }
  }

  update(scale) {
    for (const side in this.canvasPos) {
      const axis = side === 'left' || side === 'right' ? 'x' : 'y';
      const dist = Math.abs(this.mouse[axis] - this.canvasPos[side]);

      if (dist > this.clickDist) {
        canvas.style.cursor = 'default';
        continue;
      }

      canvas.style.cursor = 'n-resize';

      if (this.mouse.state === 'click') {
        this.drag[axis] = side;
      }
    }

    if (this.mouse.state === 'up') {
      this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
      this.drag = { x: null, y: null };
      return;
    }

    if (this.drag.x != null) {
      const side = this.drag.x;
      this.velocity[side] = this.mouse.x - this.canvasPos[side];
      this.canvasPos[side] = this.mouse.x;
    }

    if (this.drag.y != null) {
      const side = this.drag.y;
      this.velocity[side] = this.mouse.y - this.canvasPos[side];
      this.canvasPos[side] = this.mouse.y;
    }

    if (this.canvasPos.right > this.catalogue.x - this.catalogue.marginLeft) {
      this.canvasPos.right = this.catalogue.x - this.catalogue.marginLeft;
      this.velocity.right = 0;
    }

    this.calcPos(scale);
  }

  draw(ctx) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.canvasPos.left, this.canvasPos.top, this.canvasPos.right - this.canvasPos.left, this.canvasPos.bottom - this.canvasPos.top);
  }
}

export { Container };

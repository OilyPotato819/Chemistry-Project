class Container {
  constructor(left, right, top, bottom, mouse, scale, cnv, leftSideBar, rightSideBar) {
    this.leftSideBar = leftSideBar;
    this.rightSideBar = rightSideBar;

    this.canvasPos = { left: left, right: right, top: top, bottom: bottom };
    this.scaledPos = {};
    this.calcScaledPos(scale);

    this.velocity = { left: 0, right: 0, top: 0, bottom: 0 };
    this.drag = { x: null, y: null };
    this.clickDist = 10;
    this.mouse = mouse;
  }

  calcScaledPos(scale) {
    for (const side in this.canvasPos) {
      this.scaledPos[side] = this.canvasPos[side] / scale;
    }
  }

  updatePos(scale) {
    this.canvasPos.left = Math.max(this.canvasPos.left, 0);
    this.canvasPos.right = Math.min(this.canvasPos.right, canvas.width);
    this.canvasPos.top = Math.max(this.canvasPos.top, 0);
    this.canvasPos.bottom = Math.min(this.canvasPos.bottom, canvas.height);
    this.calcScaledPos(scale);
  }

  maximise(scale) {
    this.canvasPos.left = 0;
    this.canvasPos.right = canvas.width;
    this.canvasPos.top = 0;
    this.canvasPos.bottom = canvas.height;
    this.calcScaledPos(scale);
  }

  update(scale) {
    let inRange = [];
    canvas.style.cursor = 'default';

    for (const side in this.canvasPos) {
      const axis = side === 'left' || side === 'right' ? 'x' : 'y';
      const dist = Math.abs(this.mouse[axis] - this.canvasPos[side]);

      if (dist > this.clickDist) continue;

      inRange.push(side);
      if (this.mouse.state === 'click') {
        this.drag[axis] = side;
      }
    }

    const leftInRange = inRange.includes('left') || this.drag.x === 'left';
    const rightInRange = inRange.includes('right') || this.drag.x === 'right';
    const topInRange = inRange.includes('top') || this.drag.y === 'top';
    const bottomInRange = inRange.includes('bottom') || this.drag.y === 'bottom';

    if (leftInRange || rightInRange) {
      canvas.style.cursor = 'ew-resize';
    } else if (topInRange || bottomInRange) {
      canvas.style.cursor = 'ns-resize';
    }

    if ((leftInRange && topInRange) || (rightInRange && bottomInRange)) {
      canvas.style.cursor = 'nwse-resize';
    } else if ((leftInRange && bottomInRange) || (rightInRange && topInRange)) {
      canvas.style.cursor = 'nesw-resize';
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

    this.updatePos(scale);
  }

  draw(ctx) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.canvasPos.left, this.canvasPos.top, this.canvasPos.right - this.canvasPos.left, this.canvasPos.bottom - this.canvasPos.top);
  }
}

export { Container };

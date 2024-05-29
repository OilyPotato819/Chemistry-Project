class Mouse {
  constructor(cursor) {
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.vx = 0;
    this.vy = 0;
    this.leftState = 'up';
    this.rightState = 'up';
    this.cursor = cursor;
  }

  mousedown(event) {
    if (event.button === 0) {
      this.leftState = 'click';
    } else if (event.button === 2) {
      this.rightState = 'click';
    }
  }

  mouseup(event) {
    if (event.button === 0) {
      this.leftState = 'up';
    } else if (event.button === 2) {
      this.rightState = 'up';
    }
  }

  getGlobalPos() {
    const rect = canvas.getBoundingClientRect();
    return { x: rect.left + this.x, y: rect.top + this.y };
  }

  updatePos(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
  }

  updateSpeed(elapsedTime) {
    this.vx = (this.x - this.lastX) / elapsedTime;
    this.vy = (this.y - this.lastY) / elapsedTime;

    this.lastX = this.x;
    this.lastY = this.y;
  }

  updateState() {
    if (this.leftState === 'click') this.leftState = 'down';
    if (this.rightState === 'click') this.rightState = 'down';
  }
}

export { Mouse };

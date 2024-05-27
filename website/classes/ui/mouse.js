class Mouse {
  constructor(cursor) {
    this.x = 0;
    this.y = 0;
    this.state = 'up';
    this.cursor = cursor;
  }

  getGlobalPos() {
    const rect = canvas.getBoundingClientRect();
    return { x: rect.left + this.x, y: rect.top + this.y };
  }

  update(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
  }
}

export { Mouse };

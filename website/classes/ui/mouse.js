class Mouse {
  constructor(cursor) {
    this.x = 0;
    this.y = 0;
    this.state = "up";
    window.addEventListener("mousemove", this.update);
    this.cursor = cursor;
  }

  update(event) {
    const rect = canvas.getBoundingClientRect();
    this.x = event.clientX - rect.left;
    this.y = event.clientY - rect.top;
    console.log(this.x);
  }
}

export { Mouse };

class Bond {
  constructor(parentAtom, bondedAtom, parentElectron, bondedElectron) {
    this.parentAtom = parentAtom;
    this.bondedAtom = bondedAtom;
    this.parentElectron = parentElectron;
    this.bondedElectron = bondedElectron;
    this.type = 'bond';
  }

  update(elapsedTime) {
    this.parentElectron.update(elapsedTime);
  }

  draw(ctx, scale) {
    this.parentElectron.draw(ctx, scale);
  }

  drawConnection(ctx, scale) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.parentElectron.x * scale, this.parentElectron.y * scale);
    ctx.lineTo(this.bondedElectron.x * scale, this.bondedElectron.y * scale);
    ctx.stroke();
  }
}

export { Bond };

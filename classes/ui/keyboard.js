class Keyboard {
  keydown(event) {
    this[this.getPropertyName(event.key)] = true;
  }

  keyup(event) {
    this[this.getPropertyName(event.key)] = false;
  }

  getPropertyName(key) {
    return key.replace('Arrow', '').toLowerCase();
  }
}

export { Keyboard };

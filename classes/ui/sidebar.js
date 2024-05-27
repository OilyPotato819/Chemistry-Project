class Sidebar {
  constructor(element, toggleBtn, directionIndex, percentage) {
    this.element = element;
    this.element.style.visibility = 'visible';
    this.toggleBtn = toggleBtn;
    this.percentage = percentage;
    this.directionIndex = directionIndex;
    this.directions = ['left', 'right'];
    this.width = window.innerWidth * (this.percentage / 100);
    this.element.setAttribute('style', `width: ${percentage}%;`);
    toggleBtn.addEventListener('click', () => {
      this.element.classList.toggle('collapsed');
      if (this.element.classList.contains('collapsed')) {
        canvas.width += this.width;
        this.container.maximise();
        this.toggleBtn.src = `img/${this.directions[directionIndex ^ 1]}.png`;
      } else {
        canvas.width -= this.width;
        this.container.maximise();
        this.toggleBtn.src = `img/${this.directions[directionIndex]}.png`;
      }
    });
  }
  resize() {
    this.width = window.innerWidth * (this.percentage / 100);
  }
}

export { Sidebar };

function changeShade(color, amount) {
  let rgb = getRGB(color);

  let newRed = Math.min(Math.max(rgb[0] + amount, 0), 255);
  let newGreen = Math.min(Math.max(rgb[1] + amount, 0), 255);
  let newBlue = Math.min(Math.max(rgb[2] + amount, 0), 255);

  return `rgb(${newRed}, ${newGreen}, ${newBlue})`;
}

function getRGB(string) {
  return string
    .replace(/rgb\(|\)/g, '')
    .split(', ')
    .map((x) => +x);
}

function principalAngle(angle) {
  const positiveAngle = (angle % (2 * Math.PI)) + 2 * Math.PI;
  return positiveAngle % (2 * Math.PI);
}

function calcAngle(obj1, obj2) {
  return Math.atan2(obj1.y - obj2.y, obj1.x - obj2.x);
}

function calcDist(obj1, obj2) {
  return Math.sqrt((obj1.y - obj2.y) ** 2 + (obj1.x - obj2.x) ** 2);
}

function decomposeForce(magnitude, angle) {
  return { x: magnitude * Math.cos(angle), y: magnitude * Math.sin(angle) };
}

function kineticEnergy(mass, velocity) {
  return (mass * velocity ** 2) / 2;
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function getIonText(symbol, charge) {
  const numbers = ['', '²', '³', '⁴'];
  const signs = ['⁻', '⁺'];

  const number = numbers[Math.abs(charge) - 1];
  const sign = signs[Math.sign(charge) === -1 ? 0 : 1];
  return `${symbol}${number}${sign}`;
}

export { changeShade, getRGB, principalAngle, calcAngle, calcDist, decomposeForce, kineticEnergy, easeInOutCubic, getIonText };

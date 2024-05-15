function changeShade(color, amount) {
  let hexString = '#';
  for (let i = 1; i < 6; i += 2) {
    const colorValue = parseInt(color.slice(i, i + 2), 16);
    const newColor = Math.min(Math.max(colorValue + amount, 0), 255);
    hexString += newColor.toString(16).padStart(2, '0');
  }
  return hexString;
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

export { changeShade, calcAngle, calcDist, decomposeForce, kineticEnergy };
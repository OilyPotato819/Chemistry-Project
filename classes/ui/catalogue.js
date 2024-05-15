import { elementData } from '../../data/element-data.js';

class Catalogue {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.marginLeft = 30;
    this.maps = this.fillList();
    this.activeList = 'page1';
  }

  fillList() {
    //   elementData.forEach((values, keys) => {
    //     console.log(values, keys);
    // });
    let pageMap = new Map();
    let keys = elementData.keys();
    let size = { w: this.w, h: canvas.height / 40 };

    for (let i = 1; i <= 3; i++) {
      let pageArr = [];
      let itemx = this.x;
      let itemy = 2 * size.h;
      for (let j = 0; j < 40; j++) {
        if (i == 3 && j == 38) {
          break;
        }
        pageArr.push(new listItem([itemx, this.w, itemy, size.h], keys.next().value));
        itemy += size.h;
      }
      pageMap.set(`page${i}`, pageArr);
      // console.log(pageMap);
    }
    return pageMap;
  }
  draw(ctx) {
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.x, this.y, this.w, this.h);
    // console.log(this.maps.get("page1"));
    for (let i = 0; i < this.maps.get('page1').length; i++) {
      this.maps.get('page1')[i].draw(ctx);
    }
  }
}

class listItem {
  constructor(pos, symbol) {
    this.pos = pos;
    this.state = 'none';
    Object.assign(this, elementData.get(symbol));
  }

  draw(ctx) {
    ctx.strokeStyle = 'black';
    ctx.strokeRect(this.pos[0], this.pos[2], this.pos[1], this.pos[3]);

    ctx.font = 'bold 16px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(this.symbol, this.pos[0], this.pos[2]);
  }
}

export { Catalogue };

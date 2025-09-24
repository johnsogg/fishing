class Fisher {
    constructor({ horizonY, lakeMidX, lakeWidth }) {
        this.y = horizonY;
        this.x = lakeMidX;
        this.minX = lakeMidX - (lakeWidth / 2) + 50;
        this.maxX = lakeMidX + (lakeWidth / 2) - 50;
        this.width = 100;
        this.height = 40;
        this.pole = new FishingPole({ poleHeight: 100 });
    }

    draw() {
        push();
        this.pole.draw({ x: this.x, y: this.y });
        this.drawBoat();
        pop();
    }

    drawBoat() {
        noStroke();
        fill('green');
        rect(this.x + (-this.width / 2), this.y - this.height, this.width, this.height);
    }

    move(dir) {
        if (this.pole.isHookAboveWater()) {
            this.x = clampToRange(this.x + dir, this.minX, this.maxX);
            this.pole.setDirection(dir);
        }
    }
}
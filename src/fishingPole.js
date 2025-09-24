class FishingPole {

    static poleTipX = 100;

    constructor({ poleHeight }) {
        this.side = 'left'; // or 'right'
        this.poleTip = { x: -100, y: -poleHeight };
        this.lineLength = 200;
        this.hookSize = 10;
        this.geom = undefined;
    }

    draw({ x, y }) {
        push();
        stroke('red');
        strokeWeight(2);
        line(x, y, x + this.poleTip.x, y + this.poleTip.y);
        this.drawHook({ x, y });
        pop();
    }

    drawHook({ x, y }) {
        strokeWeight(1);
        stroke('#ffffff50');
        line(
            x + this.poleTip.x,
            y + this.poleTip.y,
            x + this.poleTip.x,
            y + this.poleTip.y + this.lineLength);
        ellipseMode(CENTER);
        fill('#20202090')
        circle(x + this.poleTip.x, y + this.poleTip.y + this.lineLength, this.hookSize);
        this.geom = {
            hookPt: { x: x + this.poleTip.x, y: y + this.poleTip.y + this.lineLength },
        }
    }

    setDirection(dir) {
        if (dir < 0) {
            this.poleTip.x = -FishingPole.poleTipX;
        } else {
            this.poleTip.x = FishingPole.poleTipX;
        }
    }

    isHookAboveWater() {
        return (this.lineLength + this.poleTip.y) < 0;
    }

    moveLine(game, dir) {
        const { x, y } = this.geom.hookPt;
        const delta = [{ x, y }, { x, y: y + dir }];
        const sequence = game.world.lake.lakeBottom;
        const ix = intersectLineSegmentWithSequence({ line: delta, sequence });

        if (!ix) {
            this.lineLength = clampToRange(
                // where it 'wants' to be
                this.lineLength + dir,
                // smaller bound - should be able to get out of water
                50,
                // higher bound is handled by the above intersection thing
                9001);
        }
    }
}
class Lake {
    constructor({ horizonY, lakeDepth, lakeX, lakeWidth }) {
        this.horizonY = horizonY;
        this.lakeDepth = lakeDepth;
        this.lakeWidth = lakeWidth;
        this.lakeX = lakeX;
        this.buildLakeBottom();
        this.populateFish();
    }

    buildLakeBottom() {
        // Create a set of points based on a circular bottom, and jiggle the
        // points up or down a little bit to get an organic-ish shape.
        let topLeft = { x: this.lakeX, y: this.horizonY };
        let topRight = { x: this.lakeX + this.lakeWidth, y: this.horizonY };
        let bottom = { x: (topLeft.x + topRight.x) / 2, y: this.horizonY + this.lakeDepth };
        this.lakeCenter = { x: bottom.x, y: this.horizonY + (this.lakeDepth / 2) }

        this.c = getCircleCenter(topLeft, bottom, topRight);
        const xAxis = createVector(1, 0);
        const toTopLeft = createVector(topLeft.x - this.c.x, topLeft.y - this.c.y);
        const toTopRight = createVector(topRight.x - this.c.x, topRight.y - this.c.y);
        const angLeft = xAxis.angleBetween(toTopLeft);
        const angRight = xAxis.angleBetween(toTopRight);
        const initialPoints = getPointsOnCircle({
            center: this.c,
            startAngle: angLeft,
            endAngle: angRight,
            numPoints: FisherGame.lakeNumPoints,
            radius: distBetweenPoints(this.c, topLeft)
        });
        const buildPoints = initialPoints.map(pt => {
            return {
                x: pt.x,
                y: clampToRange(
                    randomGaussian(pt.y, FisherGame.lakeRandomnessY),
                    this.horizonY,
                    height - FisherGame.pad),
            }
        });
        this.lakeBottom = [topLeft, ...buildPoints, topRight];
    }

    populateFish() {
        this.fish = [];
        repeat(FisherGame.generateNumFish(), (() => {
            this.fish.push(new Fish(this.lakeCenter.x, this.lakeCenter.y, 60, 40));
        }));
    }

    draw() {
        push();
        fill('lightblue');
        beginShape();
        const pts = [this.lakeBottom[0], ...this.lakeBottom, this.lakeBottom[this.lakeBottom.length - 1]];
        for (let i = 0; i < pts.length; i++) {
            curveVertex(pts[i + 0].x, pts[i + 0].y);
        }
        endShape();
        pop();
        this.drawFish();
    }

    drawFish() {
        this.fish.forEach(f => {
            push();
            f.draw();
            pop();
        });
    }

}
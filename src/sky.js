class Sky {
    constructor({ horizonY }) {
        this.horizonY = horizonY;
        this.palette = generateSkyColors();
        this.clouds = [new Cloud(),];

    }

    draw() {
        this.drawGradient();
        this.clouds.forEach(c => c.draw());
        // this.clouds = this.clouds.filter(c => c.aarb.isOnscreen({ x: c.x, y: c.y, w: width, h: height }));
    }

    drawGradient() {
        // Gradients are not really straightforward in p5js.
        // You can do it, but it relies on directly accessing
        // the web API object. Creating a gradient fill style
        // applies to the entire drawing context, not to
        // individually filled shapes.
        push();
        let grad = drawingContext.createLinearGradient(
            0 + width / 3, 0, width / 2, height);

        this.palette.forEach((color, idx, list) => {
            grad.addColorStop(
                // color stops must be in range [0, 1]
                idx / list.length,
                // next color in the list
                color);
        })

        drawingContext.save();
        drawingContext.fillStyle = grad;
        rect(0, 0, width, this.horizonY);
        drawingContext.restore();
        pop();
    }

}
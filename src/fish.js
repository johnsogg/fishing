class Fish {
    constructor(x, y, w, h) {
        // x and y are the fish's actual position
        this.x = x;
        this.y = y;
        // w an h are the fish's visual width and height
        this.w = w;
        this.h = h;
        // v is the fish's current velocity
        this.v = { x: 0, y: 0 };
        // turnProb is used to determine how many frames the fish will move
        // before deciding to turn
        this.turnProb = { mean: 4 * 60, sd: 1 * 60 };
        // turnFrame is the frame the fish will next turn on its own
        this.turnFrame = 0;
        // xProb and yProb are the distributions for picking velocity amounts.
        // the x amount will oscillate between positive and negative, so it is
        // only expressed in positive terms here - it will flip ± each time.
        this.xProb = { mean: 0.8, sd: 0.3 };
        this.yProb = { mean: 0.2, sd: 0.05 };

        // catch likelihood increases when the fish is near the hook, and when
        // it exceeds this fish's randomly determined limit, it will bite. Set
        // a boolean 'caught' flag and note time of death for a fun animation.
        this.catchLikelihood = 0;
        this.catchLikelihoodLimit = randomGaussian(130, 40);
        this.caught = false;
        this.caughtTime = 0;

        // turning right away essentially picks a random initial vector and sets
        // the next turnFrame value
        this.turn();
    }

    /**
     * Unconditionally turns the fish's x direction
     */
    turn() {
        // pick a new heading. If this is the first time, pick a random x
        // direction sign so the fish start off heading left or right randomly.
        const xHeading = this.v.x === 0 ? Math.sign(randomGaussian(0, 1)) : Math.sign(this.v.x);
        const yHeading = this.v.y === 0 ? Math.sign(randomGaussian(0, 1)) : Math.sign(this.v.y);
        this.v.x = randomGaussian(-xHeading * this.xProb.mean, this.xProb.sd);
        this.v.y = randomGaussian(-yHeading * this.yProb.mean, this.yProb.sd);
        this.turnFrame = frameCount + randomGaussian(this.turnProb.mean, this.turnProb.sd);
    }

    draw() {
        if (this.caught) {
            this.drawCaught();
            return;
        }
        push();
        fill('midnightblue');
        ellipseMode(CENTER);
        ellipse(this.x, this.y, this.w, this.h);
        const catchAmount = this.catchLikelihood / this.catchLikelihoodLimit;
        if (catchAmount > 0) {
            fill('pink');
            ellipse(this.x, this.y, this.w * catchAmount, this.h * catchAmount);
        }
        pop();
    }

    drawCaught() {
        const t = frameCount - this.caughtTime;
        const clarity = map(t, 0, 60, 255, 0);
        if (clarity >= 255) return;
        push();
        translate(0, -t * 3);
        fill(0, 0, 0, clarity);
        ellipse(this.x, this.y, this.w, this.h);
        pop();
    }

    move() {
        const next = {
            x: this.x + this.v.x,
            y: this.y + this.v.y
        };

        const delta = [this, next];
        const sequence = game.world.lake.lakeBottom;
        const ix = intersectLineSegmentWithSequence({ line: delta, sequence, closedSequence: true, debug: false });
        if (ix) {
            this.turn();
        } else if (frameCount > this.turnFrame) {
            this.turn();
        } else {
            this.x += this.v.x;
            this.y += this.v.y;
        }
    }

    bite(hookPt) {
        if (distBetweenPoints(hookPt, this) < FisherGame.biteMinDist) {
            this.catchLikelihood++;
        } else {
            this.catchLikelihood = Math.max(this.catchLikelihood - 1, 0);
        }
        return (this.catchLikelihood > this.catchLikelihoodLimit);
    }

    setCaught() {
        this.caught = true;
        this.caughtTime = frameCount;
    }
}
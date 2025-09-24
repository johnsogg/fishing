class Cloud {
    constructor() {
        this.x = width / 2;
        this.y = 120;
        this.w = 140;
        this.h = 110;
        this.v = randomGaussian(0, 0.5);
        this.puffs = makePuffs(10);
        this.aarb = new AARB();
        this.puffs.forEach(puff => {
            getPuffAarb(puff).points().forEach(p => this.aarb.addPoint(p));
        });
    }

    draw() {
        push();
        translate(this.x, this.y);
        this.puffs.forEach(p => {
            translate(p.x, p.y);
            fill(p.c, p.c, p.c, p.a);
            ellipse(0, 0, p.d, p.d / 2);
        });
        pop();
        this.move();
    }

    move() {
        this.x += this.v;
    }
}

const makePuffs = (n) => {
    const ret = [];
    for (let i = 0; i < n; i++) {
        const t = map(i, 0, n, 0, 40);
        const x = randomGaussian(t, 10);
        const y = randomGaussian(0, 20);
        const d = randomGaussian(120, 40);
        const c = clampToRange(randomGaussian(128, 100), 0, 255);
        const a = clampToRange(randomGaussian(128, 100), 0, 255);
        ret.push({ x, y, d, c, a });
    }
    return ret;
}

const getPuffAarb = (puff) => {
    const ret = new AARB();
    ret.addPoint(
        { x: puff.x - puff.d, y: puff.y - puff.d },
        { x: puff.x + puff.d, y: puff.y - puff.d },
        { x: puff.x - puff.d, y: puff.y + puff.d },
        { x: puff.x + puff.d, y: puff.y + puff.d },
    );
    return ret;
}
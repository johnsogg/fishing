class AARB {
    constructor() {
        this.minX = Infinity;
        this.maxX = -Infinity;
        this.minY = Infinity;
        this.maxY = -Infinity;
    }

    addPoint({ x, y }) {
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);
    }

    isOnscreen(x, y, w, h) {
        return (
            (0 < x + this.minX && x + this.minX < w) ||
            (0 < x + this.maxX && x + this.maxX < w)
        ) &&
            (0 < y + this.minY && y + this.minY < h) ||
            (0 < y + this.maxY && y + this.maxY < h)
            ;
    }

    points() {
        const ret = [];
        ret.push(
            { x: this.minX, y: this.minY },
            { x: this.maxX, y: this.minY },
            { x: this.minX, y: this.maxY },
            { x: this.maxX, y: this.maxY },
        );
        return ret;
    }
}
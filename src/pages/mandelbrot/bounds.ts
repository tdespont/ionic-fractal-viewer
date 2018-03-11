export class Bounds {

    x0: any;
    x1: any;
    y0: any;
    y1: any;

    previousBounds: Bounds;

    constructor(previousBounds: Bounds) {
        this.previousBounds = previousBounds;
    }
}
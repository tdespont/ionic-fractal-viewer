export class Settings {
    gradientSize: number = 100;
    maxIteration: number = 700;
    scale: number = 3;

    constructor() {
    }

    copy() {
        return new Settings().setGradientSize(this.gradientSize).setMaxIteration(this.maxIteration);
    }

    setGradientSize(gradientSize: number) {
        this.gradientSize = gradientSize;
        return this;
    }

    setMaxIteration(maxIteration: number) {
        this.maxIteration = maxIteration;
        return this;
    }

    setScale(scale: number) {
        this.scale = scale;
        return this;
    }
}
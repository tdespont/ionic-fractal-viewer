export class Gradient {

    private data = new Array();
    private gradientSize: number;

    constructor(gradientSize: number, colors: any) {
        this.gradientSize = gradientSize;
        this.initGradient(colors);
    }

    private initGradient(colors: any): void {
        let size = colors.length;
        let chunk = Math.ceil(this.gradientSize / (size - 1));
        for (let i = 0; i < size - 1; i++) {
            let diffColor = this.createDiffColor(colors[i], colors[i + 1]);
            this.writeGradient(diffColor, colors[i], i * chunk, (i + 1) * chunk);
        }
    }

    private createDiffColor(startColor: any, endColor: any): any {
        return {
            red: endColor.red - startColor.red,
            green: endColor.green - startColor.green,
            blue: endColor.blue - startColor.blue,
        }
    }

    private writeGradient(diffColor: any, startColor: any, start: any, size: any): void {
        for (let i = start; i <= size; i++) {
            let percent = i / size;
            this.data[i] = {
                red: Math.floor((diffColor.red * percent) + startColor.red),
                green: Math.floor((diffColor.green * percent) + startColor.green),
                blue: Math.floor((diffColor.blue * percent) + startColor.blue)
            };
        }
    }

    public getData(i: number): any {
        return this.data[i % this.gradientSize];
    }
}
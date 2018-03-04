import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';

@Component({
    selector: 'page-mandelbrot',
    templateUrl: 'mandelbrot.html'
})
export class MandelbrotPage {

    @ViewChild('canvas') canvasEl: ElementRef;

    private canvas: any;
    private ctx: any;
    private width: any;
    private height: any;
    private imageData: any;
    private data: any;
    private maxIteration = 500;
    private x0: any;
    private x1: any;
    private y0: any;
    private y1: any;
    private new_x0: any;
    private new_y0: any;
    private new_x1: any;
    private new_y1: any;
    private gradient = new Array();
    private gradientSize = 40;
    private scale: any;

    constructor(public navCtrl: NavController, private navParams: NavParams) {
        this.gradientSize = navParams.get('gradientSize');
        this.maxIteration = navParams.get('maxIteration');
    }

    initGradient(colors: any): void {
        let size = colors.length;
        let chunk = Math.ceil(this.gradientSize / (size - 1));
        for (let i = 0; i < size - 1; i++) {
            let diffColor = this.createDiffColor(colors[i], colors[i + 1]);
            this.writeGradient(diffColor, colors[i], i * chunk, (i + 1) * chunk);
        }
    }

    createDiffColor(startColor: any, endColor: any): any {
        return {
            red: endColor.red - startColor.red,
            green: endColor.green - startColor.green,
            blue: endColor.blue - startColor.blue,
        }
    }

    writeGradient(diffColor: any, startColor: any, start: any, size: any): void {
        for (let i = start; i <= size; i++) {
            let percent = i / size;
            this.gradient[i] = {
                red: Math.floor((diffColor.red * percent) + startColor.red),
                green: Math.floor((diffColor.green * percent) + startColor.green),
                blue: Math.floor((diffColor.blue * percent) + startColor.blue)
            };
        }
    }

    ionViewDidLoad(): void {
        this.canvas = this.canvasEl.nativeElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.scale = window.devicePixelRatio;
        this.canvas.width *= this.scale;
        this.canvas.height *= this.scale;
        this.ctx.scale(this.scale, this.scale);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.data = this.imageData.data;

        this.x0 = -2.8;
        this.x1 = 1.2;
        this.y0 = (this.x0 - this.x1) * this.height / (2 * this.width); //-1.2;
        this.y1 = -this.y0; //1.2;

        let colors = new Array();
        colors[0] = { red: 255, green: 0, blue: 0 };
        colors[1] = { red: 0, green: 255, blue: 0 };
        colors[2] = { red: 0, green: 0, blue: 255 };
        this.initGradient(colors);

        this.drawMandelbrot();

        this.canvas.mandel = this;

        this.canvas.addEventListener("mousedown", function (evt) {
            evt.preventDefault();
            if (evt.button == 0 && evt.buttons == 1) {
                this.mandel.startSelection(this, evt.clientX, evt.clientY);
            }
        }, false);

        this.canvas.addEventListener("touchstart", function (evt) {
            evt.preventDefault();
            let touch = evt.touches[0];
            this.mandel.startSelection(this, touch.clientX, touch.clientY);
        }, false);

        this.canvas.addEventListener("mousemove", function (evt) {
            evt.preventDefault();
            if (evt.button == 0 && evt.buttons == 1) {
                this.mandel.moveSelection(this, evt.clientX, evt.clientY);
            }
        }, false);

        this.canvas.addEventListener('touchmove', function (evt) {
            evt.preventDefault();
            let touch = evt.touches[0];
            this.mandel.moveSelection(this, touch.clientX, touch.clientY);
        }, false);

        this.canvas.addEventListener('mouseup', function (evt) {
            evt.preventDefault();
            if (evt.button == 0 && evt.buttons == 0) {
                this.mandel.endSelection();
            }
        }, false);

        this.canvas.addEventListener('touchend', function (evt) {
            evt.preventDefault();
            this.mandel.endSelection();
        }, false);
    }

    startSelection(canvas, clientX, clientY): void {
        let pos = this.getMousePos(canvas, clientX, clientY);
        this.new_x0 = pos.x;
        this.new_y0 = pos.y;
    }

    moveSelection(canvas, clientX, clientY): void {
        let pos = this.getMousePos(canvas, clientX, clientY);
        this.new_x1 = pos.x;
        this.computeYfromX(pos.y);
        this.drawSelection();
    }

    endSelection(): void {
        let tempX0 = this.map(this.new_x0, 0, this.width, this.x0, this.x1);
        let tempX1 = this.map(this.new_x1, 0, this.width, this.x0, this.x1);
        let tempY0 = this.map(this.new_y0, 0, this.height, this.y0, this.y1);
        let tempY1 = this.map(this.new_y1, 0, this.height, this.y0, this.y1);
        if (tempX0 < tempX1) {
            this.x0 = tempX0;
            this.x1 = tempX1;
        } else {
            this.x1 = tempX0;
            this.x0 = tempX1;
        }
        if (tempY0 < tempY1) {
            this.y0 = tempY0;
            this.y1 = tempY1;
        } else {
            this.y1 = tempY0;
            this.y0 = tempY1;
        }
        this.drawMandelbrot();
    }

    getMousePos(canvas, clientX, clientY): any {
        var rect = canvas.getBoundingClientRect(),
            scaleX = canvas.width / rect.width,
            scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        }
    }

    map(val: any, origRangeStart: any, origRangeEnd: any, destRangeStart: any, destRangeEnd: any): any {
        return destRangeStart + (destRangeEnd - destRangeStart) * ((val - origRangeStart) / (origRangeEnd - origRangeStart));
    }

    computeYfromX(pageY: any): void {
        if (pageY < this.new_y0) {
            this.new_y1 = this.new_y0 - this.height * (Math.abs(this.new_x1 - this.new_x0) / this.width);
        } else {
            this.new_y1 = this.new_y0 + this.height * (Math.abs(this.new_x1 - this.new_x0) / this.width);
        }
    }

    drawSelection(): void {
        this.refresh();
        this.ctx.lineWidth = "1";
        this.ctx.strokeStyle = "white";
        let x0 = this.new_x0 / this.scale;
        let y0 = this.new_y0 / this.scale;
        let x1 = this.new_x1 / this.scale;
        let y1 = this.new_y1 / this.scale;
        let xDist = Math.abs(x0 - x1);
        let yDist = Math.abs(y0 - y1);
        if (x0 < x1 && y0 < y1) {
            this.ctx.strokeRect(x0, y0, xDist, yDist);
        } else if (x0 > x1 && y0 < y1) {
            this.ctx.strokeRect(x1, y0, xDist, yDist);
        } else if (x0 < x1 && y0 > y1) {
            this.ctx.strokeRect(x0, y1, xDist, yDist);
        } else if (x0 > x1 && y0 > y1) {
            this.ctx.strokeRect(x1, y1, xDist, yDist);
        }
    }

    drawPoint(x: any, y: any, iteration: any): void {
        var index = y * (this.width * 4) + x * 4;

        if (iteration != 0) {
            let ratio = iteration % this.gradientSize;
            this.data[index] = this.gradient[ratio].red;
            this.data[index + 1] = this.gradient[ratio].green;
            this.data[index + 2] = this.gradient[ratio].blue;
        } else {
            this.data[index] = 0;
            this.data[index + 1] = 0;
            this.data[index + 2] = 0;
        }

    }

    computeMandelbrot(): void {
        var rx = (this.x1 - this.x0) / this.width;
        var ry = (this.y1 - this.y0) / this.height;
        for (var x = 0; x < this.width; x++) {
            var a0 = this.x0 + x * rx;
            for (var y = 0; y < this.height; y++) {
                var b0 = this.y0 + y * ry;
                var a = 0.0;
                var b = 0.0;
                var iteration = 0;
                while (iteration < this.maxIteration) {
                    var atemp = a * a - b * b + a0;
                    var btemp = 2 * a * b + b0;
                    if (a == atemp && b == btemp) {
                        iteration = this.maxIteration;
                        break;
                    }
                    a = atemp;
                    b = btemp;
                    iteration = iteration + 1;
                    if (Math.abs(a + b) > 16) {
                        break;
                    }
                }
                this.drawPoint(x, y, this.maxIteration - iteration);
            }
        }
    }

    refresh(): void {
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    drawMandelbrot(): void {
        this.computeMandelbrot();
        this.refresh();
    }
}

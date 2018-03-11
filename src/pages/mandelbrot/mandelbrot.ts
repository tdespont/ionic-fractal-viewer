import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Gradient } from '../gradient';
import { Bounds } from './bounds';

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
    private maxIteration: any;
    private new_x0: any;
    private new_y0: any;
    private new_x1: any;
    private new_y1: any;
    private init: boolean = true;
    private gradient: Gradient;
    private bounds: Bounds = new Bounds(null);

    constructor(public navCtrl: NavController, private navParams: NavParams,
        public loadingCtrl: LoadingController, private toastCtrl: ToastController) {
        this.gradient = navParams.get('gradient');
        this.maxIteration = navParams.get('maxIteration');
    }

    private reset() {
        this.init = true;
        let toast = this.toastCtrl.create({
            message: 'Fractal parameters reset',
            duration: 2000,
            position: 'bottom'
        });
        toast.present();
        this.initFractalParameters();
        this.drawMandelbrot();
    }

    private rewind() {
        if (this.bounds.previousBounds) {
            this.bounds = this.bounds.previousBounds;
        }
        this.drawMandelbrot();
    }

    private initFractalParameters(): void {
        this.init = false;
        this.bounds.x0 = -2.8;
        this.bounds.x1 = 1.2;
        this.bounds.y0 = (this.bounds.x0 - this.bounds.x1) * this.height / (2 * this.width), //-1.2;
        this.bounds.y1 = -this.bounds.y0; //1.2;
    }

    ionViewDidLoad(): void {
        this.canvas = this.canvasEl.nativeElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        let rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.data = this.imageData.data;

        if (this.init) {
            this.initFractalParameters();
        }

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

    private startSelection(canvas, clientX, clientY): void {
        let pos = this.getMousePos(canvas, clientX, clientY);
        this.new_x0 = pos.x;
        this.new_y0 = pos.y;
    }

    private moveSelection(canvas, clientX, clientY): void {
        let pos = this.getMousePos(canvas, clientX, clientY);
        this.new_x1 = pos.x;
        this.computeYfromX(pos.y);
        this.drawSelection();
    }

    private endSelection(): void {
        let tempX0 = this.map(this.new_x0, 0, this.width, this.bounds.x0, this.bounds.x1);
        let tempX1 = this.map(this.new_x1, 0, this.width, this.bounds.x0, this.bounds.x1);
        let tempY0 = this.map(this.new_y0, 0, this.height, this.bounds.y0, this.bounds.y1);
        let tempY1 = this.map(this.new_y1, 0, this.height, this.bounds.y0, this.bounds.y1);
        this.bounds = new Bounds(this.bounds);
        if (tempX0 < tempX1) {
            this.bounds.x0 = tempX0;
            this.bounds.x1 = tempX1;
        } else {
            this.bounds.x1 = tempX0;
            this.bounds.x0 = tempX1;
        }
        if (tempY0 < tempY1) {
            this.bounds.y0 = tempY0;
            this.bounds.y1 = tempY1;
        } else {
            this.bounds.y1 = tempY0;
            this.bounds.y0 = tempY1;
        }
        this.drawMandelbrot();
    }

    private getMousePos(canvas, clientX, clientY): any {
        let rect = canvas.getBoundingClientRect(),
            scaleX = canvas.width / rect.width,
            scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        }
    }

    private map(val: any, origRangeStart: any, origRangeEnd: any, destRangeStart: any, destRangeEnd: any): any {
        return destRangeStart + (destRangeEnd - destRangeStart) * ((val - origRangeStart) / (origRangeEnd - origRangeStart));
    }

    private computeYfromX(pageY: any): void {
        if (pageY < this.new_y0) {
            this.new_y1 = this.new_y0 - this.height * (Math.abs(this.new_x1 - this.new_x0) / this.width);
        } else {
            this.new_y1 = this.new_y0 + this.height * (Math.abs(this.new_x1 - this.new_x0) / this.width);
        }
    }

    private drawSelection(): void {
        this.refresh();
        this.ctx.lineWidth = "1";
        this.ctx.strokeStyle = "white";
        let x0 = this.new_x0;
        let y0 = this.new_y0;
        let x1 = this.new_x1;
        let y1 = this.new_y1;
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

    private drawPoint(x: any, y: any, iteration: any): void {
        var index = y * (this.width * 4) + x * 4;

        if (iteration != 0) {
            let color = this.gradient.getData(iteration);
            this.data[index] = color.red;
            this.data[index + 1] = color.green;
            this.data[index + 2] = color.blue;
        } else {
            this.data[index] = 0;
            this.data[index + 1] = 0;
            this.data[index + 2] = 0;
        }

    }

    private computeMandelbrot(): void {
        var rx = (this.bounds.x1 - this.bounds.x0) / this.width;
        var ry = (this.bounds.y1 - this.bounds.y0) / this.height;
        for (var x = 0; x < this.width; x++) {
            var a0 = this.bounds.x0 + x * rx;
            for (var y = 0; y < this.height; y++) {
                var b0 = this.bounds.y0 + y * ry;
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

    private refresh(): void {
        this.ctx.putImageData(this.imageData, 0, 0);
    }

    private drawMandelbrot(): void {
        let loading = this.loadingCtrl.create({
            spinner: 'bubbles',
            content: "Fractal generating...",
            dismissOnPageChange: true
        });

        loading.present().then(() => {
            this.computeMandelbrot();
            this.refresh();
        }).then(() => {
            loading.dismissAll();
        });
    }
}

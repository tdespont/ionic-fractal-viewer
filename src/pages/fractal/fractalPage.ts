import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Gradient } from './gradient';
import { Settings } from './settings';
import { LinkedList } from './linkedList';
import { FractalData } from './FractalData';
import { SettingsPage } from './settings/settingsPage';
import { FractalParameters } from './fractalParameters';

@Component({
    selector: 'page-fractal',
    templateUrl: 'fractal.html'
})
export class FractalPage {

    @ViewChild('canvas') canvasEl: ElementRef;

    private canvas: any;
    private ctx: any;
    private width: any;
    private height: any;
    private imageData: any;
    private settings: Settings;
    private new_x0: any;
    private new_y0: any;
    private new_x1: any;
    private new_y1: any;
    private fp: FractalParameters;

    constructor(public navCtrl: NavController, private navParams: NavParams,
        public loadingCtrl: LoadingController, private toastCtrl: ToastController) {
        this.settings = navParams.get('settings');
        if (!this.settings) {
            this.settings = new Settings();
        }
        this.fp = navParams.get('fractalParameters');
        if (!this.fp) {
            this.fp = new FractalParameters();
        }
    }

    private reset() {
        this.fp.init = true;
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
        this.fp.histo = this.fp.histo.rewind();
        this.drawMandelbrot();
    }

    private forward() {
        this.fp.histo = this.fp.histo.forward();
        this.drawMandelbrot();
    }

    private goToSettingsPage() {
        this.navCtrl.push(SettingsPage, {
            settings: this.settings,
            fractalParameters: this.fp
        });
    }

    private initFractalParameters(): void {
        this.fp.init = false;

        let fd = new FractalData();
        fd.x0 = -2.8;
        fd.x1 = 1.2;
        fd.y0 = (fd.x0 - fd.x1) * this.height / (2 * this.width); //-1.2;
        fd.y1 = -fd.y0; //1.2;

        this.fp.histo = new LinkedList(fd, null);
    }

    ionViewDidLoad(): void {
        this.canvas = this.canvasEl.nativeElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        let rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width / this.settings.scale;
        this.canvas.height = rect.height / this.settings.scale;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);

        if (this.fp.init) {
            this.initFractalParameters();
        }

        let colors = new Array();
        colors[0] = { red: 255, green: 0, blue: 0 };
        colors[1] = { red: 0, green: 255, blue: 0 };
        colors[2] = { red: 0, green: 0, blue: 255 };
        this.fp.gradient = new Gradient(this.settings.gradientSize, colors);

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
        let fd = this.fp.histo.getValue();
        let tempX0 = this.map(this.new_x0, 0, this.width, fd.x0, fd.x1);
        let tempX1 = this.map(this.new_x1, 0, this.width, fd.x0, fd.x1);
        let tempY0 = this.map(this.new_y0, 0, this.height, fd.y0, fd.y1);
        let tempY1 = this.map(this.new_y1, 0, this.height, fd.y0, fd.y1);
        fd = new FractalData();
        if (tempX0 < tempX1) {
            fd.x0 = tempX0;
            fd.x1 = tempX1;
        } else {
            fd.x1 = tempX0;
            fd.x0 = tempX1;
        }
        if (tempY0 < tempY1) {
            fd.y0 = tempY0;
            fd.y1 = tempY1;
        } else {
            fd.y1 = tempY0;
            fd.y0 = tempY1;
        }
        this.fp.histo = new LinkedList(fd, this.fp.histo);
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
            let color = this.fp.gradient.getData(iteration);
            this.imageData.data[index] = color.red;
            this.imageData.data[index + 1] = color.green;
            this.imageData.data[index + 2] = color.blue;
        } else {
            this.imageData.data[index] = 0;
            this.imageData.data[index + 1] = 0;
            this.imageData.data[index + 2] = 0;
        }

    }

    private computeMandelbrot(): void {
        let fd = this.fp.histo.getValue();
        var rx = (fd.x1 - fd.x0) / this.width;
        var ry = (fd.y1 - fd.y0) / this.height;
        for (var x = 0; x < this.width; x++) {
            var a0 = fd.x0 + x * rx;
            for (var y = 0; y < this.height; y++) {
                var b0 = fd.y0 + y * ry;
                var a = 0.0;
                var b = 0.0;
                var iteration = 0;
                while (iteration < this.settings.maxIteration) {
                    var atemp = a * a - b * b + a0;
                    var btemp = 2 * a * b + b0;
                    if (a == atemp && b == btemp) {
                        iteration = this.settings.maxIteration;
                        break;
                    }
                    a = atemp;
                    b = btemp;
                    iteration = iteration + 1;
                    if (Math.abs(a + b) > 16) {
                        break;
                    }
                }
                this.drawPoint(x, y, this.settings.maxIteration - iteration);
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

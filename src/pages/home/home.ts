import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { MandelbrotPage } from '../mandelbrot/mandelbrot';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  gradientSize: number = 20;
  maxIteration: number = 500;

  constructor(public navCtrl: NavController) {

  }

  private showMandelbrot() {
    this.navCtrl.push(MandelbrotPage, {
      gradientSize: this.gradientSize,
      maxIteration: this.maxIteration
    });
  }


}

import { Component } from '@angular/core';
import { NavController, Loading } from 'ionic-angular';
import { MandelbrotPage } from '../mandelbrot/mandelbrot';
import { Gradient } from '../gradient';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // input binding with UI
  gradientSize: number = 100;
  maxIteration: number = 1000;

  private gradient: Gradient;

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController) {
  }

  private showMandelbrot() {
    /*let colorLoading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: "Colors generating...",
      dismissOnPageChange: true
    });

    colorLoading.present().then(() => {*/
      let colors = new Array();
      colors[0] = { red: 255, green: 0, blue: 0 };
      colors[1] = { red: 0, green: 255, blue: 0 };
      colors[2] = { red: 0, green: 0, blue: 255 };
      this.gradient = new Gradient(this.gradientSize, colors);
    /*}).then(() => {*/
      this.navCtrl.push(MandelbrotPage, {
        gradient: this.gradient, maxIteration: this.maxIteration
      });
    /*});*/
  }

}

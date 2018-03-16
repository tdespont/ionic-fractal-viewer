import { Component } from '@angular/core';
import { NavController, Loading, NavParams } from 'ionic-angular';
import { Settings } from '../settings';
import { FractalPage } from '../fractalPage';
import { FractalParameters } from '../fractalParameters';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {

  // input binding with UI
  gradientSize: number;
  maxIteration: number;
  scale: number;

  private settings: Settings;
  private fp: FractalParameters;

  constructor(public navCtrl: NavController, private navParams: NavParams) {
    this.settings = navParams.get('settings');
    if (!this.settings) {
      this.settings = this.buildSettingsWithUIInput();
    }
    this.gradientSize = this.settings.gradientSize;
    this.maxIteration = this.settings.maxIteration;
    this.scale = this.settings.scale;
    this.fp = navParams.get('fractalParameters');
  }

  private buildSettingsWithUIInput() {
    return new Settings().setGradientSize(this.gradientSize).
      setMaxIteration(this.maxIteration).setScale(this.scale);
  }

  private changeSettings() {
    this.settings = this.buildSettingsWithUIInput();
    this.goToFractalPage();
  }

  private cancelSettings() {
    this.goToFractalPage();
  }

  private goToFractalPage() {
    this.navCtrl.push(FractalPage, {
      settings: this.settings,
      fractalParameters: this.fp
    });
  }

}

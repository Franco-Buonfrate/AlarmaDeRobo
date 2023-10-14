import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage  {

  constructor(public router:Router, public platform : Platform) { }


  ionViewDidEnter() {
    this.platform.ready().then(() => {
      SplashScreen.hide().then(() => {
        setTimeout(() => {
          this.router.navigateByUrl('login');
        }, 3000);

      });
    });
  }
}

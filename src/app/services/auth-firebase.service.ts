import { Injectable } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
@Injectable({
  providedIn: 'root'
})
export class AuthFirebaseService {

  constructor(
      private toastCtrl: ToastController,
      private loadingCtrl: LoadingController,
      private navCtrl: NavController
     ) {}


  async login(email: string, password: string) {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      console.log("Error signing in:", error );
      throw error;
    }
  }

  getEmailUser(){
    return firebase.auth().currentUser?.email || null;
  }

  async logout() {
    const loading = await this.loadingCtrl.create({
      message: 'Cerrando...',
      showBackdrop: true,
      spinner: "dots"
    });
    loading.present();
    firebase.auth().signOut().then(() => {
      setTimeout(() => {
        this.navCtrl.navigateRoot('/login');
        loading.dismiss();
      }, 1500);

    });
  }
  

  async showLoading(mensaje:string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      translucent:true,
      duration:2000,
      cssClass: 'custom-loading',
      showBackdrop: false,
      backdropDismiss:false,
      spinner:'lines-sharp'
    });
    loading.present();
    return new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
  }

  async getUser(){
   return firebase.auth().currentUser
  }
}

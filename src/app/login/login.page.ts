import { Component, OnInit } from '@angular/core';
import { AuthFirebaseService } from '../services/auth-firebase.service';
import { Router } from '@angular/router';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { FormBuilder, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {

  constructor(
    private auth: AuthFirebaseService, 
    private router: NavController, 
    private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController, 
    private fb: FormBuilder
    ) {}

    get email() {
      return this.formUser.get('email') as FormControl;
    }
    get password() {
      return this.formUser.get('password') as FormControl;
    }

    formUser = this.fb.group({
      'email':
        ["",
          [
            Validators.required,
            Validators.email,
            Validators.pattern('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?')
          ]
        ],
      'password':
        ["",
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(12)
          ]
        ]
    })

    async login() {

      try {
        await this.auth.showLoading('Verificando').then(() => this.auth.login(this.email.value, this.password.value));
        this.router.navigateRoot(['/home']);
      } catch (error: any) {
        switch (error.code) {
          case 'auth/user-not-found':
            this.toastNotification('El usuario no se encuentra registrado.');
            break;
          case 'auth/wrong-password':
            this.toastNotification('Combinacion de Clave y correo electronico erronea.');
            break;
          default:
            this.toastNotification('Llene ambos campos correo electronico y clave');
            break;
        }
      }
    }

    async toastNotification(mensaje: any) {
      let toast = this.toastCtrl.create({
        message: mensaje,
        duration: 3000,
        position: 'middle',
        icon: 'alert-outline',
        color: 'danger'
      });
      (await toast).present();
    }

    async llenarUsuario(usuario: any) {
      
      switch (usuario) {
        case '1':
          this.email.setValue("admin@admin.com");
          this.password.setValue("111111");
          break;
        case '2':
          this.email.setValue("usuario@usuario.com");
          this.password.setValue("333333");
          break;
        case '3':
          this.email.setValue("invitado@invitado.com");
          this.password.setValue("222222");
          break;
      }
    }
}

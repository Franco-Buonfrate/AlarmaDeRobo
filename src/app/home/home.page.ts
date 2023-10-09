import { Component, ElementRef, OnInit, Renderer2, Type } from '@angular/core';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { DeviceMotion, DeviceMotionAccelerationData } from '@awesome-cordova-plugins/device-motion/ngx';
import Swal from 'sweetalert2';
import { AuthFirebaseService } from '../services/auth-firebase.service';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage  {

  pressedButton: boolean = false;
  alarmActivated: boolean = false;

  passwordVisible = false;
  passwordUser: string = '';
  password: string = '';

  accelerationX: any;
  accelerationY: any;
  accelerationZ: any;
  subscription: any;

  audioLeft = '/assets/sonidos/audioIzquierda.mp3';
  audioRight = '/assets/sonidos/audioDerecha.mp3';
  audioVertical = '/assets/sonidos/audioVertical.mp3';
  audioHorizontal = '/assets/sonidos/audioHorizontal.mp3';
  audioPass = '/assets/sonidos/audioPass.mp3';
  audio = new Audio();

  firstAdmission: boolean = true;
  firstAdmissionFlash: boolean = true;

  currentPositionCellPhone = 'actual';
  previousPositionCellPhone = 'anterior';

  currentUser: any;

  constructor(
    private flashlight: Flashlight,
    private vibration: Vibration,
    private deviceMotion: DeviceMotion,
    public toast: ToastController,
    public navCtrl: NavController,
    private userService: AuthFirebaseService,
    private renderer:Renderer2,
    private element:ElementRef
  ) {
    
  }

  ngOnInit() {
    this.currentUser = this.userService.getEmailUser();
  }

  logoutUser() {
    this.userService.logout();

  }

  activateAlarm() {
    this.pressedButton = true;
    setTimeout(() => {
      this.alarmActivated = true;
      this.start();
      this.pressedButton = false;
    }, 2000);
  }

  start() {
    this.subscription = this.deviceMotion
      .watchAcceleration({ frequency: 300 })
      .subscribe((acceleration: DeviceMotionAccelerationData) => {
        this.accelerationX = Math.floor(acceleration.x);
        this.accelerationY = Math.floor(acceleration.y);
        this.accelerationZ = Math.floor(acceleration.z);

        if (acceleration.x > 5) {
          //Inclinacion Izquierda

          this.currentPositionCellPhone = 'izquierda';
          this.moveLeft();
        } else if (acceleration.x < -5) {
          //Inclinacion Derecha

          this.currentPositionCellPhone = 'derecha';
          this.moveRight();
        } else if (acceleration.y >= 9) {
          //encender flash por 5 segundos y sonido
          this.currentPositionCellPhone = 'arriba';

          if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
            this.audio.src = this.audioVertical;
            this.previousPositionCellPhone = 'arriba';
          }
          this.audio.play();
          this.moveVertical();
        } else if (
          acceleration.z >= 9 &&
          acceleration.y >= -1 &&
          acceleration.y <= 1 &&
          acceleration.x >= -1 &&
          acceleration.x <= 1
        ) {
          //acostado vibrar por 5 segundos y sonido
          this.currentPositionCellPhone = 'plano';
          this.moveHorizontal();
        }
      });
  }

  wrongPass() {
    this.firstAdmission = false;
    this.audio.src = this.audioPass;
    this.audio.play();
    this.firstAdmission ? null : this.vibration.vibrate(5000);
    this.firstAdmission = true;


    if (this.firstAdmissionFlash) {
      this.firstAdmissionFlash ? this.flashlight.switchOn() : false;
      setTimeout(() => {
        this.firstAdmissionFlash = true;
        this.flashlight.switchOff();
      }, 5000);
    }
  }

  moveLeft() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'izquierda';
      this.audio.src = this.audioLeft;
    }
    this.audio.play();
  }

  moveRight() {
    this.firstAdmission = false;
    this.firstAdmissionFlash = true;
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'derecha';
      this.audio.src = this.audioRight;
    }
    this.audio.play();
  }

  moveVertical() {
    if (this.firstAdmissionFlash) {
      this.firstAdmissionFlash ? this.flashlight.switchOn() : false;
      setTimeout(() => {
        this.firstAdmissionFlash = false;
        this.flashlight.switchOff();
      }, 5000);
      this.firstAdmission = false;
    }
  }

  moveHorizontal() {
    if (this.currentPositionCellPhone != this.previousPositionCellPhone) {
      this.previousPositionCellPhone = 'plano';
      this.audio.src = this.audioHorizontal;
    }

    this.firstAdmission ? null : this.audio.play();
    this.firstAdmission ? null : this.vibration.vibrate(5000);
    this.firstAdmission = true;
    this.firstAdmissionFlash = true;
  }

  Alert(message: string) {
    return this.toast.create({
      message: message,
      position: 'top',
      color: 'danger',
      duration: 2000,
    });
  }

  AlertSuccess(message: string) {
    return this.toast.create({
      message: message,
      position: 'top',
      color: 'success',
      duration: 1000,
    });
  }

  async verificarClave() {
    const confirm = await Swal.fire({
      title: 'Ingrese su contraseña',
      input: 'password',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: false,
      confirmButtonText: 'confirmar',
      heightAuto: false,
      background:'#050839',
      color:'white',
      confirmButtonColor:'#43AA8B',
      preConfirm: async (password) => {
        try {
          console.log(this.currentUser);
          await this.userService.login(this.currentUser as string, password);
        } catch (error) {
          Swal.showValidationMessage(`Clave incorrecta`);
          this.wrongPass();
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
    if (confirm.isConfirmed) {
      setTimeout(() => {
        this.alarmActivated = false;
        this.AlertSuccess('Alarma desactivada').then((alert: any) => {
          this.subscription.unsubscribe();
          alert.present();
          this.firstAdmission = true;
          this.audio.pause();
        });
        this.passwordVisible = false;
        this.pressedButton = false;
        this.password = '';
      }, 1000);
    }
  }
}

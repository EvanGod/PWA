import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  messageVisible = false;
  username: string = '';
  password: string = '';
  isValid = false;

  constructor(private alertController: AlertController, private navCtrl: NavController) {}

  showMessage() {
    this.messageVisible = true;
    setTimeout(() => {
      this.messageVisible = false;
    }, 5000);
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }
  
  validateFields() {
    this.username = this.username.toLowerCase().trim();
    this.password = this.password.trim();
    this.isValid = this.username !== '' && this.password !== '' && !this.username.includes(' ') && !this.password.includes(' ');
  }

  async showModal() {
    const alert = await this.alertController.create({
      header: 'Información ingresada',
      message: `Username: ${this.username}      Password: ${this.password}`,
      buttons: ['OK'],
    });

    await alert.present();
  }
}

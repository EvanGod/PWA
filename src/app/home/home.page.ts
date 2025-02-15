import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  messageVisible = false;
  username: string = '';
  password: string = '';
  isValid = false;
  isLoading = true; 

  constructor(
    private alertController: AlertController,
    private navCtrl: NavController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.showLoadingInit();
  }

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

  async showLoadingInit() {
    this.isLoading = true;  
    setTimeout(() => {
      this.isLoading = false;  
    }, 3000);
  }

  async login() {

    const storedUsers = JSON.parse(localStorage.getItem('userRecords') || '[]');
    const user = storedUsers.find(
      (storedUser: any) => storedUser.username === this.username && storedUser.password === this.password
    );

    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));

      await this.showLoadingLoginSuccess();  

      this.navCtrl.navigateForward('/inicio');
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Nombre de usuario o contraseña incorrectos.',
        buttons: ['OK'],
      });
      await alert.present();
    }

    this.isLoading = false; 
  }

  async showLoadingLoginSuccess() {

    const loading = await this.loadingController.create({
      spinner: 'crescent',  
      message: 'Verificando credenciales...',
      duration: 3000,  
      cssClass: 'login-success-loading', 
    });

    await loading.present();
    setTimeout(() => {
      this.isLoading = false; 
      loading.dismiss();
    }, 3000);
  }
}

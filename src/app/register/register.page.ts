import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage {
  email: string = '';
  fullName: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  birthDate: string = '';

  formValid: boolean = false;
  emailValid: boolean = true;
  passwordsMatch: boolean = true;
  passwordValid: boolean = true;
  usernameValid: boolean = true;
  birthDateValid: boolean = true;
  userRecords: any[] = [];

  constructor(public navCtrl: NavController, private alertController: AlertController) {}

  validateForm() {
    
    this.emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);

    
    this.usernameValid = !this.username.includes(' ');

    
    this.passwordsMatch = this.password === this.confirmPassword;

    
    this.birthDateValid = this.isValidAge(this.birthDate);

    
    this.formValid =
      this.emailValid &&
      this.email.trim() !== '' &&
      this.fullName.trim() !== '' &&
      this.usernameValid &&
      this.username.trim() !== '' &&
      this.password.trim() !== '' &&
      this.passwordValid &&
      this.passwordsMatch &&
      this.birthDate.trim() !== '' &&
      this.birthDateValid;
  }

  validatePassword() {
    this.passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.password);
    this.validateForm();
  }

  formatFullName() {
    this.fullName = this.fullName.toUpperCase();
    this.validateForm();
  }

  removeSpaces() {
    this.username = this.username.replace(/\s/g, '');
    this.validateForm();
  }
  

  isValidAge(birthDate: string): boolean {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    return age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
  }

  async registerUser() {
    if (!this.formValid) return;

    const userExists = this.userRecords.some(user => user.username === this.username || user.email === this.email);
    if (userExists) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'El usuario o el correo ya están registrados.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const newUser = {
      email: this.email,
      fullName: this.fullName,
      username: this.username,
      password: this.password,
      birthDate: this.birthDate,
    };

    this.userRecords.push(newUser);
    console.log('Usuarios Registrados:', this.userRecords);

    const alert = await this.alertController.create({
      header: 'Registro Exitoso',
      message: `Bienvenido ${this.fullName}`,
      buttons: ['OK'],
    });

    await alert.present();
    this.navCtrl.navigateBack('/home'); 
  }
}

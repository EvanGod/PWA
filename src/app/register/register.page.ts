import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
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

  constructor(
    public navCtrl: NavController,
    private alertController: AlertController,
    private firestore: Firestore 
  ) {}

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

  async checkIfUserExists() {
    const usersCollection = collection(this.firestore, 'users');
    const qEmail = query(usersCollection, where('email', '==', this.email));
    const qUsername = query(usersCollection, where('username', '==', this.username));

    const emailSnapshot = await getDocs(qEmail);
    const usernameSnapshot = await getDocs(qUsername);

    if (!emailSnapshot.empty) {
      return 'El email ya está registrado';
    }
    if (!usernameSnapshot.empty) {
      return 'El nombre de usuario ya está registrado';
    }
    return null;
  }

  async registerUser() {
    if (!this.formValid) return;

    const userExistsMessage = await this.checkIfUserExists();
    if (userExistsMessage) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: userExistsMessage,
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    try {
      const hashedPassword = CryptoJS.AES.encrypt(this.password, 'secreto').toString();

      const hashedRole = CryptoJS.AES.encrypt('common_user', 'secreto').toString(); 

      const newUser = {
        email: this.email,
        fullName: this.fullName,
        username: this.username,
        password: hashedPassword, 
        birthDate: this.birthDate,
        role: hashedRole, 
        createdAt: new Date(), 
      };

      const usersCollection = collection(this.firestore, 'users');
      await addDoc(usersCollection, newUser);

      const alert = await this.alertController.create({
        header: 'Registro Exitoso',
        message: `Bienvenido ${this.fullName}`,
        buttons: ['OK'],
      });
      await alert.present();

      this.navCtrl.navigateBack('/home');
    } catch (error) {
      console.error('Error al registrar usuario en Firestore:', error);

      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al registrar el usuario. Inténtalo de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}

//Autor: Evan Salvador Gálvez Barajas

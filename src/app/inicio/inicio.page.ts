import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  fullName: string = '';
  role: string = '';
  permissions: string[] = [];
  token: string = '';
  isTokenValid: boolean = false;
  isAdmin: boolean = false;

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const token = localStorage.getItem('authToken');

    if (!loggedInUser || !token) {
      this.navCtrl.navigateBack('/home');
      return;
    }

    this.fullName = loggedInUser.fullName;
    this.token = token;

    const decryptedToken = this.decryptToken(token);

    if (decryptedToken) {
      this.role = this.decryptRole(decryptedToken.role);
      this.permissions = decryptedToken.permissions || [];

      this.isTokenValid = true;

      this.isAdmin = this.role === 'admin';
    } else {
      this.navCtrl.navigateBack('/home');
      return;
    }
  }

  decryptToken(encryptedToken: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, 'secreto');
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Desencriptación fallida');
      }

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error al desencriptar el token:', error);
      return null;
    }
  }

  decryptRole(encryptedRole: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedRole, 'secreto');
      const decryptedRole = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedRole) {
        throw new Error('Desencriptación del rol fallida');
      }

      return decryptedRole;
    } catch (error) {
      console.error('Error al desencriptar el rol:', error);
      return '';
    }
  }

  logout() {
    localStorage.clear();
    this.navCtrl.navigateBack('/home');
  }

  goToProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  goToAdminUsers() {
    this.navCtrl.navigateForward('/admin-users');
  }
}


//Autor: Evan Salvador Gálvez Barajas

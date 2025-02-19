import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import * as CryptoJS from 'crypto-js';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  fullName: string = '';
  role: string = '';
  email: string = '';
  username: string = '';
  birthDate: string = '';
  createdAt: string = '';
  lastLogin: string = '';
  isTokenValid: boolean = false;

  constructor(private navCtrl: NavController, private firestore: Firestore) {}

  ngOnInit() {
    console.log('ngOnInit: Verificando usuario y token');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const token = localStorage.getItem('authToken');
    console.log('loggedInUser desde localStorage:', loggedInUser);
    console.log('Token desde localStorage:', token);

    if (!loggedInUser || !token) {
      console.log('No hay usuario o token, redirigiendo al home');
      this.navCtrl.navigateBack('/home');
      return;
    }

    const decryptedToken = this.decryptToken(token);
    console.log('Token descifrado:', decryptedToken);

    if (decryptedToken && decryptedToken.username) {
      this.username = decryptedToken.username; 
      console.log('Username del usuario logueado:', this.username);

      const decryptedRole = this.decryptRole(decryptedToken.role);
      console.log('Rol desencriptado:', decryptedRole);
      this.role = decryptedRole;

      this.isTokenValid = true;
      console.log('Token válido, obteniendo datos de Firestore');
      this.getUserDataFromFirestore();
    } else {
      console.log('Token no válido o username no encontrado, redirigiendo al home');
      this.navCtrl.navigateBack('/home');
    }
  }

  decryptToken(encryptedToken: string): any {
    console.log('Desencriptando token...');
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedToken, 'secreto');
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Desencriptación fallida');
      }

      console.log('Token desencriptado con éxito:', decryptedData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error al desencriptar el token:', error);
      return null;
    }
  }

  decryptRole(encryptedRole: string): string {
    console.log('Desencriptando rol...');
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedRole, 'secreto');
      const decryptedRole = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedRole) {
        throw new Error('Desencriptación fallida del rol');
      }

      console.log('Rol desencriptado con éxito:', decryptedRole);
      return decryptedRole;
    } catch (error) {
      console.error('Error al desencriptar el rol:', error);
      return '';  
    }
  }

  async getUserDataFromFirestore() {
    console.log('Realizando consulta en Firestore para el usuario:', this.username);
    try {
      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('username', '==', this.username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('Usuario encontrado en Firestore');
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log('Datos del usuario desde Firestore:', userData);

          this.fullName = userData['fullName'] || '';
          this.email = userData['email'] || '';
          this.birthDate = userData['birthDate'] || '';
          this.createdAt = userData['createdAt']?.toDate() || '';
          this.lastLogin = userData['lastLogin']?.toDate() || '';
        });
      } else {
        console.log('Usuario no encontrado en Firestore');
        this.navCtrl.navigateBack('/home');
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario desde Firestore:', error);
      this.navCtrl.navigateBack('/home');
    }
  }

  goToHome() {
    console.log('Redirigiendo al home');
    this.navCtrl.navigateBack('/inicio');
  }
}

///*Autor: Evan Salvador Gálvez Barajas 2022171006*/
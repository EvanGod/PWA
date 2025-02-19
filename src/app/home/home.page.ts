import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { Firestore, collection, query, where, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';

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
    private loadingController: LoadingController,
    private firestore: Firestore 
  ) {}

  ngOnInit() {
    this.checkTokenAndRedirect();
    this.showLoadingInit();
  }
  checkTokenAndRedirect() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.navCtrl.navigateForward('/inicio');
    }
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
    this.validateFields();

    if (!this.isValid) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Por favor ingrese un nombre de usuario y contraseña válidos.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('username', '==', this.username));
    const userSnapshot = await getDocs(q);

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0].data();
      const encryptedPassword = userDoc['password'];  
      const decryptedPassword = this.decryptPassword(encryptedPassword); 

      if (decryptedPassword === this.password) {

        const decryptedRole = this.getDecryptedRole(userDoc['role']);
        
        const permissions = await this.getRolePermissions(decryptedRole); 

        const token = this.generateToken(userDoc, permissions);

        const userData = {
          fullName: userDoc['fullName'], 
          role: decryptedRole,
          token: token
        };
        localStorage.setItem('loggedInUser', JSON.stringify(userData));  
        localStorage.setItem('authToken', token);  

        await this.updateLastLogin(userDoc['username']);

        await this.showLoadingLoginSuccess();
        this.navCtrl.navigateForward('/inicio');
      } else {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Contraseña incorrecta.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Nombre de usuario no encontrado.',
        buttons: ['OK'],
      });
      await alert.present();
    }

    this.isLoading = false;
  }

  decryptPassword(encryptedPassword: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'secreto');
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedPassword) {
        throw new Error("Desencriptación fallida");
      }
  
      return decryptedPassword;
    } catch (error) {
      console.error("Error al desencriptar la contraseña:", error);
      return ''; 
    }
  }

  getDecryptedRole(encryptedRole: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedRole, 'secreto');
      const decryptedRole = bytes.toString(CryptoJS.enc.Utf8);
  
      if (!decryptedRole) {
        throw new Error("Desencriptación fallida");
      }
  
      return decryptedRole;
    } catch (error) {
      console.error("Error al desencriptar el rol:", error);
      return ''; 
    }
  }

  async getRolePermissions(role: string): Promise<string[]> {
    const rolesCollection = collection(this.firestore, 'rol');
    const q = query(rolesCollection, where('role', '==', role));
    const roleSnapshot = await getDocs(q);
    
    if (!roleSnapshot.empty) {
      const roleDoc = roleSnapshot.docs[0].data();
      return roleDoc['permissions'] || []; 
    }

    return []; 
  }

  generateToken(user: any, permissions: string[]): string {
    const tokenData = {
      username: user.username,
      role: user.role,
      permissions: permissions,
      expiration: new Date().getTime() + (60 * 60 * 1000), 
    };

    return CryptoJS.AES.encrypt(JSON.stringify(tokenData), 'secreto').toString(); 
  }

  async updateLastLogin(username: string) {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const userSnapshot = await getDocs(q);
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userRef = doc(this.firestore, 'users', userDoc.id);
      
      await updateDoc(userRef, {
        lastLogin: new Date(), 
      });
    }
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


//Autor: Evan Salvador Gálvez Barajas
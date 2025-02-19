import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Firestore, collection, addDoc, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
  standalone: false
})
export class AdminUsersPage implements OnInit {
  users: any[] = [];
  newUser: any = { fullName: '', username: '', password: '', email: '', birthDate: '', role: 'common_user' };
  confirmPassword: string = '';
  emailValid: boolean = true;
  passwordValid: boolean = true;
  birthDateValid: boolean = true;
  formValid: boolean = false;
  selectedUser: any = null;

  constructor(private navCtrl: NavController, private firestore: Firestore) {}

  ngOnInit() {
    this.checkAdminPermissions();
    this.loadUsers();
  }

  checkAdminPermissions() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const token = localStorage.getItem('authToken');
    console.log('Token en localStorage:', loggedInUser);
  
    if (!loggedInUser || !token) {
      this.navCtrl.navigateBack('/home');
      return;
    }

    
    if (loggedInUser.role !== 'admin') {
      this.navCtrl.navigateBack('/inicio');
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
  

  async loadUsers() {
    const querySnapshot = await getDocs(collection(this.firestore, 'users'));
    this.users = querySnapshot.docs.map((doc) => doc.data());
  }

  validateForm() {
    this.emailValid = this.isEmailValid(this.newUser.email);
    this.passwordValid = this.isPasswordValid(this.newUser.password);
    this.birthDateValid = this.isBirthDateValid(this.newUser.birthDate);
    this.formValid = this.emailValid && this.passwordValid && this.birthDateValid && this.newUser.password === this.confirmPassword;
  }

  isEmailValid(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
  }

  isPasswordValid(password: string): boolean {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  }

  isBirthDateValid(birthDate: string): boolean {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    const age = today.getFullYear() - birthDateObj.getFullYear();
    return age >= 18;
  }

  removeSpaces() {
    this.newUser.username = this.newUser.username.replace(/\s+/g, '');
  }
  formatFullName() {
    this.newUser.fullName = this.newUser.fullName.toUpperCase();
  }

  validatePassword() {
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    this.passwordValid = passwordPattern.test(this.newUser.password);
    this.validateForm(); 
  }

 

  async addUser() {
    const encryptedPassword = CryptoJS.AES.encrypt(this.newUser.password, 'secreto').toString();
    const encryptedRole = CryptoJS.AES.encrypt(this.newUser.role, 'secreto').toString();

    await addDoc(collection(this.firestore, 'users'), {
      fullName: this.newUser.fullName,
      username: this.newUser.username,
      email: this.newUser.email,
      password: encryptedPassword,
      role: encryptedRole,
      birthDate: this.newUser.birthDate,
      createdAt: new Date(),
    });

    this.newUser = { fullName: '', username: '', password: '', email: '', birthDate: '', role: 'common_user' };
    this.confirmPassword = '';
    this.loadUsers(); 
  }

  goBackToUsers() {
    this.navCtrl.navigateBack('/admin-users');
  }

  editUser(user: any) {
    this.selectedUser = { ...user }; 
    console.log(this.selectedUser.email);
  }

  async updateUser() {
    if (!this.selectedUser || !this.selectedUser.username) return;
  
    const usersCollection = collection(this.firestore, 'users');
    const querySnapshot = await getDocs(usersCollection);
    
    let userDocRef = null;
  
    querySnapshot.forEach((doc) => {
      if (doc.data()['username'] === this.selectedUser.username) {  
        userDocRef = doc.ref; 
      }
    });
  
    if (!userDocRef) {
      console.error('Usuario no encontrado en Firestore');
      return;
    }
  
    await updateDoc(userDocRef, {
      fullName: this.selectedUser.fullName,
      email: this.selectedUser.email
    });
  
    this.selectedUser = null; 
    await this.loadUsers(); 
  }

  cancelEdit() {
    this.selectedUser = null;  
  }
  
  goToHome() {
    console.log('Redirigiendo al home');
    this.navCtrl.navigateBack('/inicio');
  }
  
}
///*Autor: Evan Salvador Gálvez Barajas 2022171006*/

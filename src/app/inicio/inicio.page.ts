import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false
})
export class InicioPage implements OnInit {
  fullName: string = '';

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || 'null');

    if (!loggedInUser) {
      this.navCtrl.navigateBack('/home');
      return;
    }

    this.fullName = loggedInUser.fullName;
  }

  logout() {
    localStorage.removeItem('loggedInUser');

    this.navCtrl.navigateBack('/home');
  }
}


//author: Evan Salvador Gálvez Barajas
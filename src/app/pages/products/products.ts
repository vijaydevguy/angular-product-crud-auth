import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  constructor(private auth: AuthService, private router: Router) {}
  
  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}

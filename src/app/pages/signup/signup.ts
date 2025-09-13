import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html'
})

export class Signup {
  username = '';
  email = '';
  password = '';
  confirm = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit() {
    this.error = '';
    if (this.password !== this.confirm) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signup(this.username, this.email, this.password);
      // created + profile updated — redirect to products
      this.router.navigate(['/products']);
    } catch (err: any) {
      this.error = err.message || 'Signup failed';
    } finally {
      this.loading = false;
    }
  }
}

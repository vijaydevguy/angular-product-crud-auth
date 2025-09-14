import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})

export class Products implements OnInit {
  products: Product[] = [];
  showForm = false;

  name = '';
  description = '';
  file: File | null = null;
  loading = false;
  error = '';
  isActive = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    // Test Firebase connection
    // this.testFirebaseConnection();
    
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        // console.log('Products loaded:', data);
      },
      error: (error) => {
        // console.error('Error loading products:', error);
        this.error = 'Failed to load products. Please check your connection.';
      }
    });
  }

  testFirebaseConnection() {
    // console.log('Testing Firebase connection...');
    // Test if Firebase is initialized
    // if (this.productService) {
    //   console.log('✅ ProductService initialized');
    //   console.log('✅ Firebase connection test passed');
    // } else {
    //   console.error('❌ ProductService not initialized');
    // }
  }

  onFileChange(event: any) {
    this.file = event.target.files[0];
  }

  async addProduct() {
    if (!this.name || !this.description || !this.file) {
      this.error = 'Please fill all fields';
      return;
    }
    this.loading = true;
    try {
      await this.productService.addProduct(this.name, this.description, this.file,this.isActive);
      this.name = '';
      this.description = '';
      this.file = null;
      this.isActive = false
      this.showForm = false;
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }
}


// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../../auth/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-products',
//   imports: [],
//   templateUrl: './products.html',
//   styleUrl: './products.css',
// })
// export class Products {
//   constructor(private auth: AuthService, private router: Router) {}
  
//   async logout() {
//     await this.auth.logout();
//     this.router.navigate(['/login']);
//   }
// }

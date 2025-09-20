import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CloudinaryService } from '../../services/cloudinary.service';
import { ProductViewModalComponent } from './product-view-modal';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductViewModalComponent],
  templateUrl: './products.html',
  styleUrl: './products.css',
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

  constructor(
    private productService: ProductService,
    private cloudinaryService: CloudinaryService
  ) {}

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
      },
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
    this.error = ''; // Clear previous errors

    try {
      console.log('Adding product:', {
        name: this.name,
        description: this.description,
        isActive: this.isActive,
      });

      // Test Firebase Storage connection first
      // await this.testStorageConnection();

      // Upload image to Cloudinary
      console.log('Starting Cloudinary upload...');
      const uploadResult = await this.cloudinaryService.uploadImage(this.file).toPromise();
      console.log('Cloudinary upload result:', uploadResult);
      
      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      
      const imageUrl = uploadResult.secure_url;
      console.log('Image URL from Cloudinary:', imageUrl);
      
      const result = await this.productService.addProduct(
        this.name,
        this.description,
        imageUrl,
        this.isActive
      );

      console.log('Product added successfully:', result);

      // Reset form
      this.name = '';
      this.description = '';
      this.file = null;
      this.isActive = false;

      // Close modal
      this.closeModal();

      // Show success message
      this.error = ''; // Clear any errors
      alert('Product added successfully!');
    } catch (err: any) {
      console.error('Error adding product:', err);
      this.error = err.message || 'Failed to add product. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async testStorageConnection() {
    try {
      console.log('Testing Firebase Storage connection...');
      // Try to create a simple test file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const testRef = this.productService.getStorageRef('test/test.txt');
      console.log('Storage reference created:', testRef);
      console.log('✅ Firebase Storage connection test passed');
    } catch (error) {
      console.error('❌ Firebase Storage connection failed:', error);
      throw new Error(
        'Firebase Storage is not properly configured. Please check your Firebase Console settings.'
      );
    }
  }

  closeModal() {
    // Close the modal using Bootstrap's modal method
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    this.resetForm();
  }

  //delete functionality

  // state
  selectedProduct: Product | null = null;
  viewModalProduct: Product | null = null;

  openDeleteModal(product: Product) {
    this.selectedProduct = product;

    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  async deleteProduct() {
    if (!this.selectedProduct?.id) return;

    try {
      await this.productService.deleteProduct(this.selectedProduct.id);
      this.products = this.products.filter((p) => p.id !== this.selectedProduct?.id);

      this.selectedProduct = null;
      this.closeDeleteModal();
      alert('Product deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product.');
    }
  }

  closeDeleteModal() {
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  // View modal functionality
  openViewModal(product: Product) {
    this.viewModalProduct = product;
    
    const modalElement = document.getElementById('productViewModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeViewModal() {
    this.viewModalProduct = null;
    
    const modalElement = document.getElementById('productViewModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }

  resetForm() {
    this.name = '';
    this.description = '';
    this.isActive = false;
    this.file = null;
    this.editingProduct = null;
    this.error = '';
  }

  // edit functionality
  // state for edit
  editingProduct: Product | null = null;

  openEditModal(product: Product) {
    this.editingProduct = product;
    this.name = product.name;
    this.description = product.description;
    this.isActive = product.isActive;
    this.file = null; // don't force re-upload
    this.error = ''; // clear any previous errors

    // Open the modal
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  async updateProduct() {
    if (!this.name || !this.description || !this.editingProduct) {
      this.error = 'Please fill all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      let imageUrl = this.editingProduct.imageUrl;

      if (this.file) {
        // Upload new image if user selected one
        // const imgRef = this.productService.getStorageRef(
        //   `products/${Date.now()}_${this.file.name}`
        // );
        // await uploadBytes(imgRef, this.file);
        // imageUrl = await getDownloadURL(imgRef);

        const uploadResult = await this.cloudinaryService.uploadImage(this.file).toPromise();
        imageUrl = uploadResult.secure_url;
      }

      await this.productService.updateProduct(this.editingProduct.id!, {
        name: this.name,
        description: this.description,
        isActive: this.isActive,
        imageUrl,
      });

      // Update the product in the local array
      const index = this.products.findIndex((p) => p.id === this.editingProduct?.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          name: this.name,
          description: this.description,
          isActive: this.isActive,
          imageUrl: imageUrl,
        };
      }

      alert('Product updated successfully!');
      this.resetForm();
      this.closeModal();
    } catch (err: any) {
      console.error('Error updating product:', err);
      this.error = err.message || 'Failed to update product. Please try again.';
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

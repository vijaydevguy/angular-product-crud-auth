import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  collection,
  collectionData,
  addDoc,
  getDoc,
  deleteDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface Product {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: number;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsCollection;

  constructor(private firestore: Firestore, private storage: Storage) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  // Helper method to get storage reference
  getStorageRef(path: string) {
    return ref(this.storage, path);
  }

  // get all products as observable
  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  // add new product
  async addProduct(name: string, description: string, imageUrl: string, isActive: boolean) {
    try {
      console.log('Starting product addition process...');

      // save doc
      console.log('Saving product to Firestore...');
      const docRef = await addDoc(this.productsCollection, {
        name,
        description,
        imageUrl: imageUrl,
        createdAt: Date.now(),
        isActive,
      });
      console.log('data',docRef)
      console.log('Product saved successfully with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error in addProduct service:', error);
      throw error;
    }
  }

  // Delete product: also remove stored image if imagePath exists
  async deleteProduct(id: string) {
    const docRef = doc(this.firestore, `products/${id}`);
    const snap = await getDoc(docRef);
    const data: any = snap.data?.() ?? snap.data(); // handle different return shapes
    try {
      if (data && data.imagePath) {
        const imageRef = ref(this.storage, data.imagePath);
        await deleteObject(imageRef).catch(() => {
          /* swallow if file already removed */
        });
      }
    } catch (err) {
      // non-fatal: continue to delete document even if storage deletion failed
      console.warn('Failed deleting storage file:', err);
    }

    return deleteDoc(docRef);
  }

  // update functionality

  async updateProduct(id: string, data: Partial<Product>) {
    const docRef = doc(this.firestore, `products/${id}`);
    return updateDoc(docRef, data);
  }
}

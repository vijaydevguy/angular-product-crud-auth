import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

export interface Product {
  id?: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: number;
  isActive:boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private productsCollection;

  constructor(private firestore: Firestore, private storage: Storage) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  // get all products as observable
  getProducts(): Observable<Product[]> {
    return collectionData(this.productsCollection, { idField: 'id' }) as Observable<Product[]>;
  }

  // add new product
  async addProduct(name: string, description: string, file: File, isActive: boolean) {
    // upload image
    const imgRef = ref(this.storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(imgRef, file);
    const url = await getDownloadURL(imgRef);

    // save doc
    return await addDoc(this.productsCollection, {
      name,
      description,
      imageUrl: url,
      createdAt: Date.now(),
      isActive,
    });
  }
}

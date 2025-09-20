import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName; 
  private uploadPreset = environment.cloudinary.uploadPreset; 

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<any> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    console.log('Uploading to Cloudinary:', { cloudName: this.cloudName, uploadPreset: this.uploadPreset });
    
    return this.http.post(url, formData);
  }
}

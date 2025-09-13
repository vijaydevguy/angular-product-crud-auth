import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth) {}

  // signup + set displayName (username)
  async signup(username: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    if (cred.user) {
      await updateProfile(cred.user as User, { displayName: username });
    }
    return cred;
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  // quick sync getter (may be null on cold load)
  getCurrentUser() {
    return this.auth.currentUser;
  }
}

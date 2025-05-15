import { Injectable } from '@angular/core';
import { UserResponse } from '../models/UserResponse';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  set token(token :string){
    localStorage.setItem('token', token)
  }

  get token(){
    return localStorage.getItem('token') as string
  }
  set user(user :any){
    localStorage.setItem("user",JSON.stringify(user))
  }

  get user(){
    return JSON.parse(localStorage.getItem("user")??"null")
  }
  loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // Simulez une extraction des données utilisateur à partir du token
      // Dans un vrai scénario, décodez le JWT ou faites une requête API
      this.user = { UserType: localStorage.getItem('userType') || 'CANDIDATE' }; // Exemple
    } else {
      this.user = null;
    }}
  clear(): void {
    this.user = null;
  }
}
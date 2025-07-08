import { Component, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from './core/services/auth';
import { CommonModule } from '@angular/common';
import { environment } from './../environments/environment';

fetch(environment.apiUrl);
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(Auth);
  private router = inject(Router);

  isAuthenticated = this.auth.isAuthenticated;

  constructor() {
    // Use effect to react to auth state changes
    effect(() => {
      const isAuth = this.auth.isAuthenticated();
      if (!isAuth && !this.router.url.includes('login')) {
        this.router.navigate(['/login']);
      }
    });
  }
}

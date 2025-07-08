import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule
  ],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  private auth = inject(Auth);
  router = inject(Router);

  // Responsive sidenav state
  isMobile = signal(false);
  sidenavOpened = signal(true);

  // Navigation items
  navItems = [
    { path: '/topics', icon: 'forum', label: 'Sujets' },
    { path: '/topics/new', icon: 'add_circle', label: 'Nouveau sujet' }
  ];

  // Current user
  currentUser = this.auth.isAuthenticated;

  constructor() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  /**
   * Check screen size and update responsive states
   */
  private checkScreenSize(): void {
    this.isMobile.set(window.innerWidth < 960);
    this.sidenavOpened.set(!this.isMobile());
  }

  /**
   * Toggle the sidenav (mobile only)
   */
  toggleSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpened.update(state => !state);
    }
  }

  /**
   * Navigate to a route and close the sidenav on mobile
   */
  navigate(route: string): void {
    this.router.navigate([route]);
    if (this.isMobile()) {
      this.sidenavOpened.set(false);
    }
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

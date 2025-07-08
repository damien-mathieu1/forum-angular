import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  username = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  async onSubmit() {
    // Basic validation
    if (!this.email || !this.password || !this.confirmPassword || !this.username) {
      this.error.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.register({
        email: this.email,
        password: this.password,
        passwordConfirm: this.confirmPassword,
        username: this.username
      });
      
      // Redirect to home or login page after successful registration
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Registration error:', error);
      this.error.set(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      this.loading.set(false);
    }
  }
}

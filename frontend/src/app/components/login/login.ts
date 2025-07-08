import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],

})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private auth: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async onSubmit() {
    console.log('Form submission started');

    // Basic validation
    if (!this.email || !this.password) {
      this.error.set('Veuillez saisir un email et un mot de passe');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      console.log('Attempting login with email:', this.email);

      const credentials = {
        email: this.email.trim(),
        password: this.password
      };

      console.log('Calling auth.login with credentials');
      await this.auth.login(credentials);

      console.log('Login successful, handling redirect');
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/topics';
      console.log('Redirecting to:', returnUrl);
      this.router.navigateByUrl(returnUrl);
    } catch (err: any) {
      console.error('Login error:', err);

      if (err.status === 0) {
        this.error.set('Impossible de se connecter au serveur. Vérifiez votre connexion.');
      } else if (err.status === 400) {
        this.error.set('Échec de la connexion. Veuillez réessayer.');
      } else if (err.message) {
        this.error.set(err.message);
      } else {
        this.error.set('Une erreur inattendue est survenue. Veuillez réessayer plus tard.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}

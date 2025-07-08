import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { pb, isLoggedIn } from './pocketbase.service';
import {
  LoginCredentials,
  RegisterCredentials,
  User,
  PbUser,
  AuthState
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  // Expose state as a read-only signal
  isAuthenticated = this.authState.asReadonly();

  private router = inject(Router);

  constructor() {
    console.log('Auth service initialized');
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const isAuth = isLoggedIn();
    const user = isAuth && pb.authStore.model ?
      this.mapPbUserToUser(pb.authStore.model as unknown as PbUser) :
      null;

    this.authState.update(state => ({
      ...state,
      isAuthenticated: isAuth,
      user
    }));
  }

  private mapPbUserToUser(pbUser: PbUser): User {
    return {
      id: pbUser.id,
      email: pbUser.email,
      name: pbUser.name || pbUser.email.split('@')[0],
      created: pbUser.created,
      updated: pbUser.updated
    };
  }

  async login(credentials: LoginCredentials): Promise<boolean> {
    console.log('AuthService: Starting login process');
    this.setLoading(true);
    this.clearError();

    try {
      console.log('AuthService: Attempting authentication with PocketBase');

      // Try to authenticate
      const authData = await pb.collection('users').authWithPassword<PbUser>(
        credentials.email,
        credentials.password
      );

      console.log('AuthService: Authentication response:', authData);

      if (pb.authStore.isValid && authData.record) {
        console.log('AuthService: Authentication successful');
        const user = this.mapPbUserToUser(authData.record);

        this.authState.update(state => ({
          ...state,
          isAuthenticated: true,
          user,
          loading: false
        }));

        console.log('AuthService: Auth state updated');
        return true;
      }

      console.warn('AuthService: Authentication failed - Invalid credentials');
      this.setError('Identifiants incorrects');
      return false;

    } catch (error: any) {
      console.error('AuthService: Error during login:', error);

      if (error.status === 400) {
        console.log('AuthService: User may not exist, attempting to create user');
        // User doesn't exist, create and authenticate
        return this.createUserAndLogin(credentials);
      }

      this.handleAuthError(error);
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  private async createUserAndLogin(credentials: LoginCredentials): Promise<boolean> {
    console.log('AuthService: Attempting to create new user');
    this.setLoading(true);

    try {
      // Create a new user
      const data = {
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.password,
        name: credentials.email.split('@')[0],
        emailVisibility: true,
      };

      console.log('AuthService: Creating user with data:', data);

      const record = await pb.collection('users').create<PbUser>(data);
      console.log('AuthService: User created:', record);

      // Authenticate the new user
      return this.login(credentials);

    } catch (error: any) {
      console.error('AuthService: Error creating user:', error);
      this.handleAuthError(error);
      return false;
    }
  }

  /**
   * Register a new user with the provided credentials
   * @param credentials User registration data
   * @returns Promise that resolves when registration is complete
   */
  async register(credentials: RegisterCredentials): Promise<void> {
    console.log('AuthService: Starting registration process');
    this.setLoading(true);
    this.clearError();

    try {
      console.log('AuthService: Attempting to register user');

      // Create a new user
      const data = {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        passwordConfirm: credentials.passwordConfirm,
        emailVisibility: true,
        name: credentials.username,
      };

      console.log('AuthService: Registering user with data:', data);

      // Create the user
      await pb.collection('users').create<PbUser>(data);
      console.log('AuthService: User registered successfully');

      // Log the user in after successful registration
      await this.login({
        email: credentials.email,
        password: credentials.password
      });

    } catch (error: any) {
      console.error('AuthService: Error during registration:', error);
      this.handleAuthError(error);
      throw error; // Re-throw to allow component to handle the error
    } finally {
      this.setLoading(false);
    }
  }

  logout(): void {
    pb.authStore.clear();
    this.authState.update(state => ({
      ...state,
      isAuthenticated: false,
      user: null
    }));
  }

  getCurrentUser(): User | null {
    return this.authState().user;
  }

  private setLoading(loading: boolean): void {
    this.authState.update(state => ({ ...state, loading }));
  }

  private setError(message: string): void {
    this.authState.update(state => ({ ...state, error: message }));
  }

  private clearError(): void {
    this.authState.update(state => ({ ...state, error: null }));
  }

  private handleAuthError(error: any): void {
    console.error('AuthService: Error occurred:', error);

    let errorMessage = 'Une erreur est survenue';

    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion Internet.';
    } else if (error.status === 400) {
      errorMessage = 'Email ou mot de passe incorrect';
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé. Vérifiez vos identifiants.';
    } else if (error.status === 404) {
      errorMessage = 'Service non trouvé. Veuillez réessayer plus tard.';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('AuthService: Setting error message:', errorMessage);
    this.setError(errorMessage);
  }
}

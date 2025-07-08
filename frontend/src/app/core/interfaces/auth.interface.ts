/**
 * Interface pour les informations de connexion
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface pour les informations d'inscription
 */
export interface RegisterCredentials extends LoginCredentials {
  username: string;
  passwordConfirm: string;
}

/**
 * Interface pour les données utilisateur de base
 */
export interface User {
  id: string;
  email: string;
  name: string;
  created: string;
  updated: string;
  // Ajoutez d'autres champs utilisateur au besoin
}

/**
 * Interface pour la réponse d'authentification de PocketBase
 */
export interface AuthResponse<T = any> {
  token: string;
  record: T;
  meta?: any;
}

/**
 * Interface pour les données utilisateur de PocketBase
 */
export interface PbUser {
  id: string;
  email: string;
  name?: string;
  created: string;
  updated: string;
  // Ajoutez d'autres champs utilisateur au besoin
}

/**
 * Interface pour les erreurs d'authentification
 */
export interface AuthError {
  message: string;
  status: number;
  data?: any;
}

/**
 * Interface pour le contexte d'authentification
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

import { Routes, Router, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { Layout } from './components/layout/layout';
import { TopicsList } from './components/topics-list/topics-list';
import { CreateTopic } from './components/create-topic/create-topic';
import { PostList } from './components/post-list/post-list';
import { Auth } from './core/services/auth';

// Auth guard function
const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  // Get the current auth state
  const authState = auth.isAuthenticated();
  
  if (!authState?.isAuthenticated) {
    // Store the attempted URL for redirecting after login
    const redirectUrl = state.url === '/login' ? '/' : state.url;
    return router.createUrlTree(['/login'], { 
      queryParams: { returnUrl: redirectUrl } 
    });
  }
  return true;
};

// Redirect to topics if already logged in
const redirectIfAuthenticated: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  
  const authState = auth.isAuthenticated();
  if (authState?.isAuthenticated) {
    // If user is already logged in, redirect to returnUrl or topics
    const returnUrl = route.queryParams?.['returnUrl'] || '/topics';
    return router.createUrlTree([returnUrl]);
  }
  return true;
};

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [redirectIfAuthenticated]
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'topics',
        children: [
          {
            path: '',
            component: TopicsList,
            title: 'Sujets - Forum Polytech'
          },
          {
            path: 'new',
            component: CreateTopic,
            title: 'Nouveau sujet - Forum Polytech'
          },
          {
            path: ':topicId',
            component: PostList,
            title: 'Messages - Forum Polytech'
          }
        ]
      },
      {
        path: '',
        redirectTo: 'topics',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/topics'
  }
];

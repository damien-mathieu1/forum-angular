import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/interfaces/post.interface';
import { TopicService } from '../../core/services/topic.service';
import { Topic } from '../../core/interfaces/topic.interface';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './post-list.html',
  styleUrls: ['./post-list.scss']
})
export class PostList implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private topicService = inject(TopicService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private auth = inject(Auth);

  topicId: string = '';
  topic = signal<Topic | null>(null);
  posts = signal<Post[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Form control for new post
  newPostContent = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(2000)
  ]);

  // Form control for editing post
  editPostContent = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(2000)
  ]);

  // Currently edited post ID
  editingPostId: string | null = null;

  // Current user ID for permission checks
  currentUserId = computed(() => this.auth.isAuthenticated()?.user?.id || null);

  // Check if current user is the author of a post
  isCurrentUserPostAuthor = (post: Post): boolean => {
    return this.currentUserId() === post.created_by;
  };

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async params => {
      this.topicId = params['topicId'];
      if (this.topicId) {
        await this.loadTopic();
        await this.loadPosts();
      }
    });
  }

  private async loadTopic(): Promise<void> {
    try {
      this.loading.set(true);
      const topic = await this.topicService.getTopicById(this.topicId);
      this.topic.set(topic);
    } catch (error) {
      console.error('Error loading topic:', error);
      this.snackBar.open('Erreur lors du chargement du sujet', 'Fermer', { duration: 3000 });
      this.router.navigate(['/topics']);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPosts(): Promise<void> {
    try {
      this.loading.set(true);
      const posts = await this.postService.fetchPostsByTopic(this.topicId);
      this.posts.set(posts);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      const errorMessage = 'Erreur lors du chargement des messages';
      this.error.set(errorMessage);
      this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onBack(): void {
    this.router.navigate(['/topics']);
  }

  // Create a new post
  async onSubmitPost(): Promise<void> {
    if (this.newPostContent.invalid || !this.topicId) return;

    try {
      this.loading.set(true);
      const content = this.newPostContent.value || '';
      await this.postService.createPost(this.topicId, content);
      await this.loadPosts();
      this.newPostContent.reset();
      this.snackBar.open('Message publié avec succès', 'Fermer', { duration: 3000 });
    } catch (error) {
      console.error('Error creating post:', error);
      this.snackBar.open('Erreur lors de la publication du message', 'Fermer', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  // Start editing a post
  startEditing(post: Post): void {
    this.editingPostId = post.id;
    this.editPostContent.setValue(post.content);
  }

  // Cancel editing
  cancelEditing(): void {
    this.editingPostId = null;
    this.editPostContent.reset();
  }

  // Save edited post
  async saveEdit(postId: string): Promise<void> {
    if (this.editPostContent.invalid) return;

    try {
      this.loading.set(true);
      const content = this.editPostContent.value || '';
      await this.postService.updatePost(postId, content);
      await this.loadPosts();
      this.editingPostId = null;
      this.editPostContent.reset();
      this.snackBar.open('Message modifié avec succès', 'Fermer', { duration: 3000 });
    } catch (error) {
      console.error('Error updating post:', error);
      this.snackBar.open('Erreur lors de la modification du message', 'Fermer', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  // Delete a post with confirmation
  confirmDelete(postId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le message',
        message: 'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.'
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        try {
          this.loading.set(true);
          await this.postService.deletePost(postId);
          await this.loadPosts();
          this.snackBar.open('Message supprimé avec succès', 'Fermer', { duration: 3000 });
        } catch (error) {
          console.error('Error deleting post:', error);
          this.snackBar.open('Erreur lors de la suppression du message', 'Fermer', { duration: 3000 });
        } finally {
          this.loading.set(false);
        }
      }
    });
  }

  showPostForm = false;
}

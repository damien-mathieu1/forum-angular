import { Component, OnInit, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { EditTopicDialogComponent } from '../edit-topic-dialog/edit-topic-dialog';
import { TopicService } from '../../core/services/topic.service';
import { Auth } from '../../core/services/auth';
import { Topic } from '../../core/interfaces/topic.interface';
import { AuthState } from '../../core/interfaces/auth.interface';

@Component({
  selector: 'app-topics-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatDialogModule
  ],
  templateUrl: './topics-list.html',
  styleUrls: ['./topics-list.scss']
})
export class TopicsList implements OnInit {
  private topicService = inject(TopicService);
  private auth = inject(Auth);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  // Directly use the signals from the service
  topics = this.topicService.topicsList;
  isLoading = this.topicService.isLoading;
  error = this.topicService.errorMessage;
  currentUser: Signal<AuthState | null> = this.auth.isAuthenticated;

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.topicService.fetchTopics().catch(err => {
      console.error('Failed to load topics:', err);
    });
  }

  getAuthorName(topic: Topic): string {
    // Check if we have expanded user data
    if (topic.expand?.created_by) {
      const user = topic.expand.created_by;
      if (user.name) return user.name;
      if (user.email) return user.email;
    }

    // If we don't have expanded data, try to get the current user's name if it's their topic
    const currentUser = this.currentUser();
    if (currentUser?.isAuthenticated && currentUser.user?.id === topic.created_by) {
      return currentUser.user.name || currentUser.user.email || 'Moi';
    }

    // Fallback to unknown user
    return 'Utilisateur inconnu';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  trackByTopicId(index: number, topic: Topic): string {
    return topic.id;
  }

  // Check if current user is the owner of a topic
  isCurrentUserOwner(topic: Topic): boolean {
    const currentUser = this.currentUser();
    return !!(
      currentUser?.isAuthenticated &&
      currentUser.user?.id &&
      topic.created_by === currentUser.user.id
    );
  }

  // Open edit dialog for a topic
  editTopic(topic: Topic): void {
    const dialogRef = this.dialog.open(EditTopicDialogComponent, {
      width: '500px',
      data: { title: topic.title }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result && result !== topic.title) {
        this.topicService.updateTopic(topic.id, result)
          .then(() => this.loadTopics())
          .catch(err => {
            console.error('Failed to update topic:', err);
            // Show error to user
          });
      }
    });
  }

  // Confirm and handle topic deletion
  confirmDelete(topic: Topic): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Supprimer le sujet',
        message: `Êtes-vous sûr de vouloir supprimer le sujet "${topic.title}" ? Cette action est irréversible.`
      },
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.topicService.deleteTopic(topic.id)
          .then(() => this.loadTopics())
          .catch(err => {
            console.error('Failed to delete topic:', err);
            // Show error to user
          });
      }
    });
  }

  // Delete a topic after confirmation
  deleteTopic(topicId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer ce sujet ? Cette action est irréversible.'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.topicService.deleteTopic(topicId).catch(err => {
          console.error('Failed to delete topic:', err);
        });
      }
    });
  }
}

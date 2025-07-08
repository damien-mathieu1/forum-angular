import { Injectable, signal } from '@angular/core';
import { pb } from './pocketbase.service';
import { Topic } from '../interfaces/topic.interface';

@Injectable({
  providedIn: 'root'
})
export class TopicService {
  private topics = signal<Topic[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as read-only
  public readonly topicsList = this.topics.asReadonly();
  public readonly isLoading = this.loading.asReadonly();
  public readonly errorMessage = this.error.asReadonly();

  /**
   * Fetch all topics from PocketBase
   */
  async fetchTopics(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      console.log('Fetching topics with expanded user data...');
      // Fetch topics with expanded user data
      const result = await pb.collection('topics').getList<Topic>(1, 50, {
        expand: 'created_by',
        sort: '+created',
        fields: 'id,title,created,updated,created_by,expand.created_by.id,expand.created_by.email,expand.created_by.name,expand.created_by.avatar'
      });

      console.log('Topics with expanded data:', result);
      this.topics.set(result.items);
    } catch (err: any) {
      console.error('Error fetching topics:', err);
      this.error.set('Erreur lors du chargement des sujets');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get a single topic by ID
   */
  async getTopicById(topicId: string): Promise<Topic> {
    try {
      return await pb.collection('topics').getOne<Topic>(topicId, {
        expand: 'created_by',
        fields: 'id,title,created,updated,created_by,expand.created_by.id,expand.created_by.email,expand.created_by.name,expand.created_by.avatar'
      });
    } catch (err: any) {
      console.error('Error fetching topic:', err);
      this.error.set('Erreur lors du chargement du sujet');
      throw err;
    }
  }

  /**
   * Create a new topic
   */
  async createTopic(title: string): Promise<Topic> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (!title?.trim()) {
        throw new Error('Le titre est requis');
      }

      console.log('Creating topic with title:', title);
      const data = {
        title: title.trim(),
        created_by: pb.authStore.model?.id
      };

      const topic = await pb.collection('topics').create<Topic>(data, {
        expand: 'created_by'
      });

      console.log('Topic created successfully:', topic);

      // Add the new topic to our local state
      this.topics.update(topics => [topic, ...topics]);

      return topic;
    } catch (err: any) {
      console.error('Error creating topic:', err);
      this.error.set(err.message || 'Erreur lors de la création du sujet');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Clear the current topics list
   */
  clearTopics(): void {
    this.topics.set([]);
  }

  /**
   * Update an existing topic
   */
  async updateTopic(id: string, title: string): Promise<Topic> {
    this.loading.set(true);
    this.error.set(null);

    try {
      if (!title?.trim()) {
        throw new Error('Le titre est requis');
      }

      console.log('Updating topic:', id);
      const data = { title: title.trim() };
      const updatedTopic = await pb.collection('topics').update<Topic>(id, data, {
        expand: 'created_by'
      });

      console.log('Topic updated successfully:', updatedTopic);

      // Update the topic in our local state
      this.topics.update(topics =>
        topics.map(topic => topic.id === id ? updatedTopic : topic)
      );

      return updatedTopic;
    } catch (err: any) {
      console.error('Error updating topic:', err);
      this.error.set(err.message || 'Erreur lors de la mise à jour du sujet');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Delete a topic
   */
  async deleteTopic(id: string): Promise<void> {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sujet ?')) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      console.log('Deleting topic:', id);
      await pb.collection('topics').delete(id);

      console.log('Topic deleted successfully');

      // Remove the topic from our local state
      this.topics.update(topics => topics.filter(topic => topic.id !== id));
    } catch (err: any) {
      console.error('Error deleting topic:', err);
      this.error.set(err.message || 'Erreur lors de la suppression du sujet');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Clear any error messages
   */
  clearError(): void {
    this.error.set(null);
  }
}

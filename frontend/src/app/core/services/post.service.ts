import { Injectable, signal } from '@angular/core';
import { pb } from './pocketbase.service';
import { Post } from '../interfaces/post.interface';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private posts = signal<Post[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Expose signals as read-only
  public readonly postsList = this.posts.asReadonly();
  public readonly isLoading = this.loading.asReadonly();
  public readonly errorMessage = this.error.asReadonly();

  // Expose the signal value for direct access in templates
  public get currentPosts(): Post[] {
    return this.posts();
  }

  async fetchPostsByTopic(topicId: string): Promise<Post[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const result = await pb.collection('posts').getList<Post>(1, 50, {
        filter: `topic_id = "${topicId}"`,
        sort: 'created',
        expand: 'created_by,topic',
      });
      this.posts.set(result.items);
      return result.items;
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      this.error.set('Erreur lors du chargement des messages');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async getPostById(postId: string): Promise<Post> {
    this.loading.set(true);
    try {
      return await pb.collection('posts').getOne<Post>(postId, {
        expand: 'created_by,topic',
      });
    } catch (err: any) {
      console.error('Error fetching post:', err);
      this.error.set('Erreur lors du chargement du message');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async createPost(topicId: string, content: string): Promise<Post> {
    this.loading.set(true);
    try {
      const data = {
        topic_id: topicId,
        content,
        created_by: pb.authStore.model?.id
      };
      const post = await pb.collection('posts').create<Post>(data, {
        expand: 'created_by,topic'
      });
      this.posts.update(posts => [...posts, post]);
      return post;
    } catch (err: any) {
      console.error('Error creating post:', err);
      this.error.set('Erreur lors de la création du message');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async updatePost(postId: string, content: string): Promise<Post> {
    this.loading.set(true);
    try {
      const updatedPost = await pb.collection('posts').update<Post>(postId, {
        content
      }, {
        expand: 'created_by,topic'
      });

      this.posts.update(posts =>
        posts.map(p => p.id === postId ? updatedPost : p)
      );

      return updatedPost;
    } catch (err: any) {
      console.error('Error updating post:', err);
      this.error.set('Erreur lors de la mise à jour du message');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    this.loading.set(true);
    try {
      await pb.collection('posts').delete(postId);
      this.posts.update(posts => posts.filter(p => p.id !== postId));
      return true;
    } catch (err: any) {
      console.error('Error deleting post:', err);
      this.error.set('Erreur lors de la suppression du message');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  clearPosts(): void {
    this.posts.set([]);
  }
}

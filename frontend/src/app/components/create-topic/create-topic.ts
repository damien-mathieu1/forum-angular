import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TopicService } from '../../core/services/topic.service';
import { Auth } from '../../core/services/auth';

type TopicForm = {
  title: FormControl<string>;
};

@Component({
  selector: 'app-create-topic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './create-topic.html',
  styleUrls: ['./create-topic.scss']
})
export class CreateTopic {
  private topicService = inject(TopicService);
  private auth = inject(Auth);
  private router = inject(Router);

  form = new FormGroup<TopicForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]
    })
  });

  loading = signal(false);
  error = signal<string | null>(null);

  get title() {
    return this.form.get('title');
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.topicService.createTopic(this.form.value.title!.trim());
      this.router.navigate(['/topics']);
    } catch (error: any) {
      console.error('Error creating topic:', error);
      this.error.set(error.message || 'Une erreur est survenue lors de la création du sujet');
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.router.navigate(['/topics']);
  }
}

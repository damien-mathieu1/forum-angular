import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-edit-topic-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './edit-topic-dialog.html',
  styleUrls: ['./edit-topic-dialog.scss']
})
export class EditTopicDialogComponent {
  title: string;

  constructor(
    public dialogRef: MatDialogRef<EditTopicDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {
    this.title = data.title;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

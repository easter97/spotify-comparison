import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-playlist-modal',
  templateUrl: './create-playlist-modal.component.html',
  styleUrl: './create-playlist-modal.component.css'
})
export class CreatePlaylistModalComponent {
  form: FormGroup;
  description:string;
  name;

  constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<CreatePlaylistModalComponent>,
      @Inject(MAT_DIALOG_DATA) data) {
        console.log(data)
      this.description = data.description;
      this.name = data.name;
  }

  ngOnInit() {
      this.form = this.fb.group({
          description: [this.description, []],
          name: [this.name, []],
      });
  }

  save() {
      this.dialogRef.close(this.form.value);
  }

  close() {
      this.dialogRef.close();
  }

}

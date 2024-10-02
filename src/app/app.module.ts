import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './components/results/results.component';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { SpotifyComparisonComponent } from './components/spotify-comparison/spotify-comparison.component';
import { SportifyComponent } from './components/sportify/sportify.component';
import { SpotifyService } from './services/spotify.service';
import { provideHttpClient } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSliderModule} from '@angular/material/slider';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDialogModule} from '@angular/material/dialog';
import { CreatePlaylistModalComponent } from './components/sportify/create-playlist-modal/create-playlist-modal/create-playlist-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ResultsComponent,
    SpotifyComparisonComponent,
    SportifyComponent,
    CreatePlaylistModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatSliderModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatCheckboxModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent} from './components/home/home.component'
import {LoginComponent} from './components/login/login.component'
import { ResultsComponent } from './components/results/results.component';
import { SportifyComponent } from './components/sportify/sportify.component';
import { SpotifyComparisonComponent } from './components/spotify-comparison/spotify-comparison.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent},
  { path: 'sportify', component: SportifyComponent},
  { path: 'spotify-comparsion', component: SpotifyComparisonComponent},
  { path: 'results', component: ResultsComponent},
  { path :'',redirectTo:'login',pathMatch:'full'} // defualt route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
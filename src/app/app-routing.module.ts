import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent} from './components/home/home.component'
import {LoginComponent} from './components/login/login.component'
import { ResultsComponent } from './components/results/results.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent},
  { path: 'results', component: ResultsComponent},
  { path :'',redirectTo:'login',pathMatch:'full'} // defualt route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
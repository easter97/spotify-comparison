import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Spotify Comparison';
  client_id:string = '06b0d17ee4194381b16f89b55b623ed2'; // Your client id
  client_secret = '660b85280c684f588a905ea63f4044f8'; // Your secret
  redirect_uri = 'http://localhost:4200/home'; // Your redirect uri
  scopes = 'user-read-private user-read-email'
  ngOnInit(){
    
  }
  
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title = 'Spotify Comparison';
  client_id:string = '06b0d17ee4194381b16f89b55b623ed2'; // Your client id
  client_secret = '660b85280c684f588a905ea63f4044f8'; // Your secret
  redirect_uri = 'http://localhost:4200/home'; // Your redirect uri
  scopes = 'user-read-private user-read-email playlist-read-collaborative playlist-read-private user-library-read user-follow-read user-read-recently-played user-top-read'
  code:any;
  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }
  getAuthUrl(){
    return 'https://accounts.spotify.com/authorize' +
    '?client_id=' + this.client_id +
    '&response_type=token' +
    '&redirect_uri=' + encodeURIComponent(this.redirect_uri)+
    (this.scopes ? '&scope=' + encodeURIComponent(this.scopes) : '');
  }
}

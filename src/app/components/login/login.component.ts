import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'Comparify';
  client_id = environment.client_id;
  client_secret = environment.client_secret
  redirect_uri = environment.redirect_uri; // Your redirect uri
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

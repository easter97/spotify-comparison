import { Injectable } from '@angular/core';
import {Http, Response, Request, RequestOptions, RequestOptionsArgs, Headers} from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService{
  title = 'Spotify Comparison';
  client_id:string = '06b0d17ee4194381b16f89b55b623ed2'; // Your client id
  client_secret = '660b85280c684f588a905ea63f4044f8'; // Your secret
  redirect_uri = 'http://localhost:4200/home'; // Your redirect uri
  scopes = 'user-read-private user-read-email playlist-read-collaborative playlist-read-private user-library-read user-follow-read user-read-recently-played user-top-read'
  token:string;

  constructor(private http: HttpClient, private _http: Http){

  }
  setToken(code:string){
    this.token=code;
    
  }

  getPlaylists(){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.get('https://api.spotify.com/v1/me/playlists', options)
            .pipe(map(res=>res.json()));
  }
  getUser(){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.get('https://api.spotify.com/v1/me', options)
      
          //.pipe(map(res=>res.json()));
  }

}
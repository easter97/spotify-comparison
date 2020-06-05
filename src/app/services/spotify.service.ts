import { Injectable } from '@angular/core';
import {Http, Response, Request, RequestOptions, RequestOptionsArgs, Headers} from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SpotifyService{
  title = 'Spotify Comparison';
  client_id:string = '06b0d17ee4194381b16f89b55b623ed2'; // Your client id
  client_secret = '660b85280c684f588a905ea63f4044f8'; // Your secret
  redirect_uri = environment.redirect_uri; // Your redirect uri
  scopes = 'user-read-private user-read-email playlist-read-private user-library-read user-follow-read user-read-recently-played user-top-read'
  token:string;

  constructor(private http: HttpClient, private _http: Http){

  }
  setToken(code:string){
    this.token=code;
    
  }

  getPlaylists(limit:string='50'){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers}, );
    return this._http.get('https://api.spotify.com/v1/me/playlists'+'?limit=' + encodeURIComponent(limit), options)
  }
  getUserPlaylists(id:string,limit:string='50'){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers}, );
    return this._http.get('https://api.spotify.com/v1/users/'+id+'/playlists'+'?limit=' + encodeURIComponent(limit), options)
  }
  getUser(){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.get('https://api.spotify.com/v1/me', options)
  }
  getPlaylistTracks(id:string, offset=0){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.get('https://api.spotify.com/v1/playlists/'+id+'/tracks'+'?offset=' + encodeURIComponent(offset.toString()), options)
  }
  getComparedUser(id:string){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    return this._http.get('https://api.spotify.com/v1/users/'+id, options)
  }
  getArtists(ids){
    //50 at a time
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    console.log('https://api.spotify.com/v1/artists'+'?ids=' + encodeURIComponent(ids.join()));
    return this._http.get('https://api.spotify.com/v1/artists'+'?ids=' + encodeURIComponent(ids.join()), options)
  }
}
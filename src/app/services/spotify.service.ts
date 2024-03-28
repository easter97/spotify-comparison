import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
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
  scopes = 'user-read-private user-read-email playlist-read-private user-library-read user-follow-read user-read-recently-played user-top-read playlist-modify-public playlist-modify-private'
  token:string;

  constructor(private http: HttpClient){

  }
  setToken(code:string){
    this.token=code;
  }

  getPlaylists(limit:string='50'){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/me/playlists'+'?limit=' + encodeURIComponent(limit), { headers })
  }
  getUserPlaylists(id:string,limit:string='50'){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/users/'+id+'/playlists'+'?limit=' + encodeURIComponent(limit), { headers })
  }
  getUser(){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/me', { headers })
  }
  getPlaylistTracks(id:string, offset=0){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/playlists/'+id+'/tracks'+'?offset=' + encodeURIComponent(offset.toString()), { headers })
  }
  getComparedUser(id:string){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/users/'+id, { headers })
  }
  getArtists(ids){
    //50 at a time
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    console.log('https://api.spotify.com/v1/artists'+'?ids=' + encodeURIComponent(ids.join()));
    return this.http.get('https://api.spotify.com/v1/artists'+'?ids=' + encodeURIComponent(ids.join()), { headers })
  }
  getAnalysis(id:string){
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token });
    let options = new RequestOptions({ headers: headers });
    // console.log('https://api.spotify.com/v1/audio-analysis/'+'id=' + encodeURIComponent(id));
    return this._http.get('https://api.spotify.com/v1/audio-analysis/'+ encodeURIComponent(id), options)
  }
  createPlaylist(user1, user2, name){
    let body={"name": name, "description": "A playlist inspired by "+user1.display_name+" and "+user2.display_name}
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.token , "Content-Type": "application/json"});
    let options = new RequestOptions({ headers: headers });
    return this._http.post('https://api.spotify.com/v1/users/'+user1.id+'/playlists', body, options)
  }
}
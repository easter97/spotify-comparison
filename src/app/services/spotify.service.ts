import { Injectable } from '@angular/core';
import { map, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService{
  title = 'Spotify Comparison';
  client_id:string = '06b0d17ee4194381b16f89b55b623ed2'; // Your client id
  client_secret = '660b85280c684f588a905ea63f4044f8'; // Your secret
  redirect_uri = environment.redirect_uri; // Your redirect uri
  scopes = 'user-read-private user-read-email playlist-read-private user-library-read user-follow-read user-read-recently-played user-top-read playlist-modify-public playlist-modify-private'
  _token:string;

  constructor(private http: HttpClient, private router:Router,){

  }
  setToken(code:string){
    this._token=code;
    sessionStorage.setItem('authToken', code);
  }
  get token(){
    if(this._token){
      return this._token;
    }
    else if (sessionStorage.getItem('authToken')){
      this._token=sessionStorage.getItem('authToken');
      return this._token;
    }
    else{
      alert("Your session has timed out");
      this.router.navigate(['/login']);
    }
  }

  getPlaylists(limit: number = 50, offset: number = 0, playlists: any[] = []){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    // return this.http.get('https://api.spotify.com/v1/me/playlists'+'?limit=' + encodeURIComponent(limit), { headers })
      // First API call to get the user's playlists
  return this.http.get<any>(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`, { headers }).pipe(
    switchMap((response : any) => {
      // Add the current batch of playlists to the accumulator array
      playlists = playlists.concat(response.items);

      // If there is a `next` URL, make the next request recursively
      if (response.next) {
        const nextOffset = offset + limit; // Increment the offset for the next request
        return this.getPlaylists(limit, nextOffset, playlists); // Recursive call
      } else {
        // No more playlists, return the accumulated playlists
        console.log(playlists)
        return of(playlists);
      }
    }),
    catchError(error => {
      console.error('Error fetching playlists:', error);
      return of([]); // Return an empty array on error
    })
  );
  }
  getUserPlaylists(id:string,limit:string='50'){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/users/'+id+'/playlists'+'?limit=' + encodeURIComponent(limit), { headers })
  }
  getUser() {
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/me', { headers })
      .pipe(
        catchError(error => {
          console.error('Error occurred in getUser:', error);
          return throwError(error); // Rethrow the error to be caught by the caller
        })
      );
  }
  getPlaylistTracks(playlist){
    let id = playlist.id;
    let limit=50;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    
    // Helper function to send requests in batches
    const fetchBatch = (batchOffset) => {
      return this.http.get(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=${limit}&offset=${batchOffset}`, { headers });
    };

    if (playlist.tracks.total > 50) {
      // Split the requests into batches of 50
      const requests = [];
      for (let i = 0; i < playlist.tracks.total; i += 50) {
        let offset = i;
        requests.push(fetchBatch(offset));
      }

      // Combine all requests into a single observable
      return forkJoin(requests).pipe(
        map((responses: any[]) => {
          // Combine the audio_features arrays from each response into one array
          return responses.reduce((acc, response) => acc.concat(response.items), []);
        })
      );
    } else {
      return fetchBatch(0).pipe(
        map((response: any) => response.items) // Return just the audio_features array
      );
    }
  }
  getComparedUser(id:string){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/users/'+id, { headers })
  }
  getArtists(ids){
    //50 at a time
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    return this.http.get('https://api.spotify.com/v1/artists'+'?ids=' + encodeURIComponent(ids.join()), { headers })
  }
  getTracks(ids:Array<string>){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    let options = { headers: headers };
    // Helper function to send requests in batches
    const fetchBatch = (idsBatch: string[]) => {
      let idsList = idsBatch.join(",");
      return this.http.get('https://api.spotify.com/v1/tracks?ids=' + encodeURIComponent(idsList), options);
    };

    if (ids.length > 50) {
      // Split the ids array into batches of 100
      const requests = [];
      for (let i = 0; i < ids.length; i += 100) {
        let idsBatch = ids.slice(i, i + 100);
        requests.push(fetchBatch(idsBatch));
      }

      // Combine all requests into a single observable
      return forkJoin(requests).pipe(
        map((responses: any[]) => {
          // Combine the audio_features arrays from each response into one array
          return responses.reduce((acc, response) => acc.concat(response.tracks), []);
        })
      );
    } else {
      return fetchBatch(ids).pipe(
        map((response: any) => response.tracks) // Return just the audio_features array
      );
    }
  }
  getAnalysis(ids:Array<string>){
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
    let options = { headers: headers };
    // Helper function to send requests in batches
    const fetchBatch = (idsBatch: string[]) => {
      let idsList = idsBatch.join(",");
      return this.http.get('https://api.spotify.com/v1/audio-features?ids=' + encodeURIComponent(idsList), options);
    };

    if (ids.length > 100) {
      // Split the ids array into batches of 100
      const requests = [];
      for (let i = 0; i < ids.length; i += 100) {
        let idsBatch = ids.slice(i, i + 100);
        requests.push(fetchBatch(idsBatch));
      }

      // Combine all requests into a single observable and merge the results
      return forkJoin(requests).pipe(
        map((responses: any[]) => {
          // Combine the audio_features arrays from each response into one array
          return responses.reduce((acc, response) => acc.concat(response.audio_features), []);
        })
      );
    } else {
      return fetchBatch(ids).pipe(
        map((response: any) => response.audio_features) // Return just the audio_features array
      );
    } 
  }
  createPlaylist(user1, user2, name){
    let body={"name": name, "description": "A playlist inspired by "+user1.display_name+" and "+user2.display_name}
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token , "Content-Type": "application/json"});
    let options = { headers: headers };
    return this.http.post('https://api.spotify.com/v1/users/'+user1.id+'/playlists', body, options)
  }
}
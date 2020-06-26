import { Component, OnInit, HostListener } from '@angular/core';
import { UserObject } from '../home/home.component';
import { UserDataService } from 'src/app/services/user-data.service';
import { SpotifyService } from 'src/app/services/spotify.service';
import { forkJoin } from 'rxjs';  // RxJS 6 syntax
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  currentUser:UserObject;
  comparedUser:UserObject;
  commonSongs=[];
  commonArtists=[];
  subArray=[];
  topArtists=[];
  topGenres=[];
  uncommonArtists=[];
  artistCommonality;
  songCommonality;
  loading=true;

  constructor(private dataService:UserDataService,
              private spotify_service:SpotifyService,
              private router:Router) { 
                if(this.dataService.currentUser!=undefined){
                  this.currentUser = this.dataService.currentUser;
                  this.comparedUser = this.dataService.comparedUser;
                  console.log("initialized"+this.comparedUser.display_name);

                  sessionStorage.setItem("currentUser", JSON.stringify(this.currentUser));
                  sessionStorage.setItem("comparedUser", JSON.stringify(this.comparedUser));
                }
                else{
                  this.currentUser=JSON.parse(sessionStorage.getItem("currentUser"));
                  this.comparedUser=JSON.parse(sessionStorage.getItem("comparedUser"));
                  console.log(this.currentUser)
                  console.log(this.comparedUser)
                }
              }
  findElement(arr, propName, propValue) {
    for (var i=0; i < arr.length; i++)
      if (arr[i][propName] == propValue)
        return i;
        //index of element
  
    // will return undefined if not found; you could return a default instead
  }
  compareUsers(){
    //find similar songs, artists, and genres
    
    // console.log(this.currentUser.songList);
    for(let song of this.currentUser.songList){
      let sameSong = this.comparedUser.songList.some(item => {
        return item.track.id == song.track.id && !this.commonSongs.some(song => song.track.id === item.track.id);
       });
      let sameArtist = this.comparedUser.songList.some(item => {
        return item.track.artists[0].id == song.track.artists[0].id;
      });
      if(sameSong){
        this.commonSongs.push(song);
      }
      if(sameArtist){
        //add how common the artist is (#1, #2)
        if(this.commonArtists.some(artist => artist.id === song.track.artists[0].id)){
          //increase popularity
          let index=this.findElement(this.commonArtists, 'id', song.track.artists[0].id);
          this.commonArtists[index].popularity=this.commonArtists[index].popularity+1;
        }
        else{
          let artist = {id:song.track.artists[0].id, name: song.track.artists[0].name, popularity: 1, genre: "genre"}
          this.commonArtists.push(artist);
        }
      }
      else if(!this.uncommonArtists.some(artist => artist.id === song.track.artists[0].id)){
        let artist = {id:song.track.artists[0].id, name: song.track.artists[0].name, popularity: 1, genre: "genre"}
        this.uncommonArtists.push(artist);
      }
      
    }
    this.commonArtists = this.sort_by_key(this.commonArtists, 'popularity');
    console.log(this.commonSongs);
    console.log(this.commonArtists)
  }
  getArtistGenres(){
    let ids=[];
    for(let artist of this.commonArtists.slice(0,12)){
      ids.push(artist.id);
    }
    let artistSub=this.spotify_service.getArtists(ids);
    artistSub.subscribe( tracks => {
      console.log(JSON.parse(tracks['_body']))
      this.topArtists=JSON.parse(tracks['_body']).artists;
      console.log(this.topArtists)
      for(let artist of this.topArtists){
        for(let genre of artist.genres){
          if(this.topGenres.some(incGenre => incGenre.name === genre)){
            //increase popularity
            let index=this.findElement(this.topGenres, 'name', genre);
            this.topGenres[index].popularity=this.topGenres[index].popularity+1;
          }
          else{
            let newGenre={name: genre, popularity:1};
            this.topGenres.push(newGenre);
          }
        }
      }
      this.topGenres = this.sort_by_key(this.topGenres, 'popularity');
      console.log(this.topGenres)
    },
    error => {
      // alert("Your request could not be completed, for best results try and limit playlist length to under 200 songs");
      this.router.navigate(['/home']);
    });  
  }
  getTracks(playlists:any){
    let playlist_ids=[];
    let songList=[];
    for(let i=0; i<playlists.length; i++){
      let loops=1;
      let offset=0;
      if(playlists[i].tracks.total>100){
        //we have to submit multiple requests to get them all
        loops=Math.ceil(playlists[i].tracks.total/50);
        //this is how many offsets of 50 we will have to do to get all tracks
        console.log(playlists[i].name, loops);
      }
      for(let l=0; l<loops; l++){
        let trackSub=this.spotify_service.getPlaylistTracks(playlists[i].id);
        this.subArray.push(trackSub);
        trackSub.subscribe( tracks => {
          let songs=JSON.parse(tracks['_body']).items;
          for(let i = 0; i<songs.length; i++){
            songList.push(songs[i]);
          }
        },
        error => {
          // alert("Your request could not be completed, for best results try and limit playlist length to under 200 songs");
          this.router.navigate(['/home']);
        });  
        offset=offset+50
      }
      
    }
    return songList;   
  }
  sort_by_key(array, key){
    return array.sort(function(a, b)
    {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
  }

  ngOnInit() {
    window.scroll(0,0);
    
      this.comparedUser.songList=this.getTracks(this.comparedUser.modifiedPlaylists);
      this.currentUser.songList=this.getTracks(this.currentUser.modifiedPlaylists);

      
      


      let finished = forkJoin(this.subArray);
      finished.subscribe( result => {
        this.compareUsers();
        
        this.getArtistGenres();
        this.artistCommonality=((this.commonArtists.length/(this.uncommonArtists.length+this.commonArtists.length)*100)).toFixed(2);
        this.songCommonality=((this.commonSongs.length/(this.currentUser.songList.length+this.comparedUser.songList.length-this.commonSongs.length))*100).toFixed(2);
        console.log("Common Artist Percentage: "+this.artistCommonality);
        console.log(this.commonSongs.length, this.currentUser.songList.length, this.comparedUser.songList.length);
        
        console.log("Common Song Percentage: "+this.songCommonality);
        this.loading=false;

      });
    
  }
  // @HostListener('window:beforeunload', ['$event'])
  //     unloadNotification($event: any) {
  //       sessionStorage.setItem("currentUser", JSON.stringify(this.currentUser));
  //       sessionStorage.setItem("comparedUser", JSON.stringify(this.comparedUser));
  //     }

}

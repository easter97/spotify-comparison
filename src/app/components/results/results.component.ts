import { Component, OnInit } from '@angular/core';
import { UserObject } from '../home/home.component';
import { UserDataService } from 'src/app/services/user-data.service';
import { SpotifyService } from 'src/app/services/spotify.service';
import { forkJoin } from 'rxjs';  // RxJS 6 syntax

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {
  currentUser:UserObject;
  comparedUser:UserObject;
  commonSongs=[];
  commonArtists=[];
  subArray=[];
  constructor(private dataService:UserDataService,
              private spotify_service:SpotifyService) { }
  compareUsers(){
    //find similar songs, artists, and genres
    // console.log(this.currentUser.songList);
    for(let song of this.currentUser.songList){
      let sameSong = this.comparedUser.songList.some(item => {
        return item.track.id == song.track.id && !this.commonSongs.some(song => song.track.id === item.track.id);
       });
      let sameArtist = this.comparedUser.songList.some(item => {
        return item.track.artists[0].id == song.track.artists[0].id && !this.commonArtists.includes(song.track.artists[0].name);
      });
      if(sameSong){
        this.commonSongs.push(song);
      }
      if(sameArtist){
        //add how common the artist is (#1, #2)
        this.commonArtists.push(song.track.artists[0].name);
      }
    }
    console.log(this.commonSongs);
    console.log(this.commonArtists)
  }
  getTracks(playlists:any){
    let playlist_ids=[];
    let songList=[];
    for(let i=0; i<playlists.length; i++){
      let trackSub=this.spotify_service.getPlaylistTracks(playlists[i].id);
      this.subArray.push(trackSub);
      trackSub.subscribe( tracks => {
        let songs=JSON.parse(tracks['_body']).items;
        for(let i = 0; i<songs.length; i++){
          songList.push(songs[i]);
        }
      });  
    }
    return songList;   
  }

  ngOnInit() {
    this.currentUser = this.dataService.currentUser;
    this.comparedUser = this.dataService.comparedUser;
    
    this.comparedUser.songList=this.getTracks(this.comparedUser.modifiedPlaylists);
    this.currentUser.songList=this.getTracks(this.currentUser.modifiedPlaylists);

    let finished = forkJoin(this.subArray);
    finished.subscribe( result => {
      this.compareUsers();
    });
  }

}

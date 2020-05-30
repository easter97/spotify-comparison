import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SpotifyService} from '../spotify.service';
import { Subscription } from 'rxjs';
import {NgForm} from '@angular/forms';
export interface UserObject {
  display_name: string;
  img: string;
  id: string;
  songList:Array<any>;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  code:any;
  data:any;
  token:any;
  expires:any;
  orderObj:any;
  url:string;
  user:UserObject= {} as any;
  img_url:string;
  display_name:string;
  id:string;
  playlists:any;
  comparedPlaylists:any;
  playlist_ids:any=[];
  comparedUser:UserObject= {} as any;
  userSub:any;
  collaborative:boolean=false;

  constructor(private route: ActivatedRoute, private spotify_service:SpotifyService) { }

  getUser(id:string){
    this.userSub=this.spotify_service.getComparedUser(id);
    this.comparedUser=this.userSub.subscribe( data => {
      console.log(data);
      if(data!=null && data!=undefined){
        let body=JSON.parse(data['_body']);
        this.comparedUser.display_name=body.display_name;
        this.comparedUser.img=body.images[0].url;
        this.comparedUser.id=body.id;
        this.spotify_service.getUserPlaylists(id).subscribe(data => {
          //console.log(data);
          if(data!=null && data!=undefined){
            console.log(JSON.parse(data['_body']).items);
            this.comparedUser.songList=this.getTracks(JSON.parse(data['_body']).items, this.comparedUser.id)
          }
        });
      }
    });
  }
  onSubmit(f: NgForm) {
    console.log(f.value);  // { first: '', last: '' }
    console.log(f.valid);  // false
    this.getUser(f.value.id);
  }
  getTracks(playlists:any, id=null){
    let playlist_ids=[];
    let songList=[]
    for(let i=0; i<playlists.length; i++){
      //this means we want to make sure the user is the author of the playlist
      if(id!=null){
        if((!this.collaborative && 
            playlists[i].collaborative==this.collaborative && 
            playlists[i].owner.id==id) || this.collaborative){
          playlist_ids.push(playlists[i].id);
        }
      }
      else{
        if((!this.collaborative && playlists[i].collaborative==this.collaborative) || this.collaborative){
          playlist_ids.push(playlists[i].id);
        }
      }
      
      
    }
    for(let i=0; i<playlist_ids.length; i++){
      let trackSub=this.spotify_service.getPlaylistTracks(playlist_ids[i]);
      trackSub.subscribe( tracks => {
        let songs=JSON.parse(tracks['_body']).items;
        for(let i = 0; i<songs.length; i++){
          //console.log(songs[i].track.name);
          songList.push(songs[i].track.name);
        }
      });
    }
    return songList;
  }
  ngOnInit() {
    //console.log(this.route.url)
    this.url= window.location.href;
    let record = false;
    this.token="";
    for(let i = 0; i<this.url.length; i++){
      if(record && this.url[i]!='&')
      {
        this.token+=this.url[i];
      }
      if(this.url[i]=='#'){
        record=true;
      }
      if(this.url[i]=='&')
      {
        break;
      }
    }
    this.spotify_service.setToken(this.token.substring(13));
    this.spotify_service.getUser().subscribe( data => {
      //console.log(data);
      if(data!=null && data!=undefined){
        let body=JSON.parse(data['_body']);
        this.user.display_name=body.display_name;
        this.user.img=body.images[0].url;
        this.user.id=body.id;
      }
    });
    let playlistSub=this.spotify_service.getPlaylists()
    playlistSub.subscribe( data => {
      this.playlists=JSON.parse(data['_body']).items;
      //console.log(this.playlists)
      this.user.songList=this.getTracks(this.playlists, this.user.id);
    });
    
  }

}

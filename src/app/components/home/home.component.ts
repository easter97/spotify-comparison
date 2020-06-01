import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { SpotifyService} from '../../services/spotify.service';
import { Subscription } from 'rxjs';
import {NgForm} from '@angular/forms';
import { UserDataService } from 'src/app/services/user-data.service';
export interface UserObject {
  display_name: string;
  img: string;
  id: string;
  playlists:Array<any>;
  modifiedPlaylists:Array<any>;
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
  onlyUserCreated:boolean=true;

  constructor(private route: ActivatedRoute, 
              private spotify_service:SpotifyService, 
              private router:Router,
              private dataService:UserDataService) { }

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
            this.comparedUser.playlists=JSON.parse(data['_body']).items;
            this.comparedUser.modifiedPlaylists=JSON.parse(data['_body']).items;
            if(this.onlyUserCreated){
              this.onlyUserPlaylists();
            }
            // this.comparedUser.songList=this.getTracks(JSON.parse(data['_body']).items, this.comparedUser.id)
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
  removePlaylist(id:string, user:string){
    function findAndRemove(array, property, value) {
      array.forEach(function(result, index) {
        if(result[property] === value) {
          //Remove from array
          array.splice(index, 1);
        }    
      });
    }
    if(user=="current"){
      findAndRemove(this.user.modifiedPlaylists, 'id', id);
    }
    else{
      findAndRemove(this.comparedUser.modifiedPlaylists, 'id', id);
    }
    
  }
  onlyUserPlaylists(){
    //remove playlists not created by the user
    let removedIDs=[];
    for(let playlist of this.user.modifiedPlaylists){
      if((playlist.owner.id !== this.user.id) || !this.collaborative && playlist.collaborative){
        removedIDs.push(playlist.id);
        
      }
    }
    for(let id of removedIDs){
      this.removePlaylist(id, 'current')
    }
    removedIDs=[]
    if(this.comparedUser.id!=null){
      for(let playlist of this.comparedUser.modifiedPlaylists){
        if((playlist.owner.id !== this.comparedUser.id) || !this.collaborative && playlist.collaborative){
          removedIDs.push(playlist.id)
        }
      }
      for(let id of removedIDs){
        this.removePlaylist(id, 'compared')
      }
    }
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
    },
    error => {
      alert("Your session has timed out");
      this.router.navigate(['/login']);
    },);
    let playlistSub=this.spotify_service.getPlaylists()
    playlistSub.subscribe( data => {
      console.log(data)
      this.user.playlists=JSON.parse(data['_body']).items;
      this.user.modifiedPlaylists=JSON.parse(data['_body']).items;
      
      // this.user.songList=this.getTracks(this.user.playlists, this.user.id);
      if(this.onlyUserCreated){
        this.onlyUserPlaylists();
      }
    });

  }
  compareUsers(){
    //go to compare component
    if(this.comparedUser.id==null){
      alert("You must select a user to compare with")
    }
    else{
      this.router.navigate(['/results']);
    }
  }

  ngOnDestroy() {
    this.dataService.currentUser = this.user;
    this.dataService.comparedUser = this.comparedUser; 
 }

}

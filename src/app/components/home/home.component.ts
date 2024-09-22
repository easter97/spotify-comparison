import { Component, OnInit, HostListener } from '@angular/core';
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
  typing:boolean=false;
  formID:string="";

  constructor(private route: ActivatedRoute, 
              private spotify_service:SpotifyService, 
              private router:Router,
              private dataService:UserDataService) { }

  getUser(id:string){
    console.log('getting user')
    this.userSub=this.spotify_service.getComparedUser(id);
    this.comparedUser=this.userSub.subscribe( (data : any) => {
      console.log("data", data);
      if(data!=null && data!=undefined){
        let body=data
        this.comparedUser.display_name=body.display_name;
        this.comparedUser.img=body.images[1].url;
        this.comparedUser.id=body.id;
        this.spotify_service.getUserPlaylists(id).subscribe((data : any) => {
          //console.log(data);
          if(data!=null && data!=undefined){
            console.log(data.items);
            this.comparedUser.playlists=data.items;
            this.comparedUser.modifiedPlaylists=data.items;
            if(this.onlyUserCreated){
              this.onlyUserPlaylists();
            }
            // this.comparedUser.songList=this.getTracks(data.items, this.comparedUser.id)
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
  onFocus(){
    this.typing=true;
  }
  onBlur(f: NgForm){
    this.typing=false;
    let regExp:RegExp=new RegExp('\/user\/([a-zA-Z0-9]*)\?');
    let url=f.value.id;
    let match = regExp.exec(url);
    if(match!=null){
      console.log(match)
      this.formID=match[1];
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
    // if (JSON.parse(sessionStorage.getItem("currentUser")).id != null) {
    //   this.user=JSON.parse(sessionStorage.getItem("currentUser"));
    //   this.comparedUser=JSON.parse(sessionStorage.getItem("comparedUser"));
    // }
    // else{
      this.spotify_service.getUser().subscribe( (data : any) => {
        console.log("user", data);
        if(data!=null && data!=undefined){
          let body=data
          this.user.display_name=body.display_name;
          this.user.img=body.images[1].url;
          this.user.id=body.id;
        }
      },
      error => {
        alert("Your session has timed out");
        this.router.navigate(['/login']);
      },);
      let playlistSub=this.spotify_service.getPlaylists()
      playlistSub.subscribe( (data : any) => {
        console.log(data)
        if(data!=null && data!=undefined){
          this.user.playlists=data.items;
        this.user.modifiedPlaylists=data.items;
        }
        
        
        // this.user.songList=this.getTracks(this.user.playlists, this.user.id);
        if(this.onlyUserCreated){
          this.onlyUserPlaylists();
        }
      });
    // }
    
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
//  @HostListener('window:beforeunload', ['$event'])
//       unloadNotification($event: any) {
//         sessionStorage.setItem("currentUser", JSON.stringify(this.user));
//         sessionStorage.setItem("comparedUser", JSON.stringify(this.comparedUser));
//       }

}

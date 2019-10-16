import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { SpotifyService} from '../spotify.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  code:any;
  data:any;
  token:any;
  expires:any;
  orderObj:any;
  url:string;
  user:any;
  img_url:string;
  display_name:string;
  id:string;
  playlists:any;
  constructor(private route: ActivatedRoute, private spotify_service:SpotifyService) { }

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
    this.user=this.spotify_service.getUser();
    this.user.subscribe( data => {
      console.log(data);
      if(data!=null && data!=undefined){
        this.user=JSON.parse(data['_body']);
        this.display_name=this.user.display_name;
        this.img_url=this.user.images[0].url;
        this.id=this.user.id;
      }
    });
    let playlistSub=this.spotify_service.getPlaylists()
    playlistSub.subscribe( data => {
      this.playlists=JSON.parse(data['_body']).items;
      console.log(this.playlists)
    });
  }

}

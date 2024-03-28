import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { UserObject } from '../spotify-comparison/spotify-comparison.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-sportify',
  templateUrl: './sportify.component.html',
  styleUrls: ['./sportify.component.scss']
})
export class SportifyComponent implements OnInit {
  collaborative:boolean=false;
  exercises=[
    {name: "Warm Up", bpm: "100 to 140 BPM", minBPM: 100, maxBPM: 140},
    {name: "Cool Down", bpm: "60 to 90 BPM", minBPM: 60, maxBPM: 90},
    {name: "Weightlifting", bpm: "130 to 150 BPM", minBPM: 130, maxBPM: 150},
    {name: "Yoga & Pilates", bpm: "60 to 90 BPM", minBPM: 60, maxBPM: 90},
    {name: "Power Yoga", bpm: "100 to 140 BPM", minBPM: 100, maxBPM: 140},
    {name: "HIIT & Cycling", bpm: "140 to 190 BPM", minBPM: 140, maxBPM: 190},
    {name: "Power Walk", bpm: "125 to 135 BPM", minBPM: 125, maxBPM: 135},
    {name: "Elliptical", bpm: "135 to 145 BPM", minBPM: 135, maxBPM: 145},
    {name: "Jog & Long Distance", bpm: "120 to 145 BPM", minBPM: 120, maxBPM: 145},
    {name: "Running", bpm: "147 to 160 BPM", minBPM: 147, maxBPM: 160},
    {name: "Custom", bpm: "Set your own BPM range", minBPM: null, maxBPM: null},
  ];
  activeExercise;
  user:UserObject= {} as any;
  subArray=[];
  trackArray=[];

  constructor(private route: ActivatedRoute, 
    private spotify_service:SpotifyService, 
    private router:Router,
    private dataService:UserDataService) {
      if(this.dataService.currentUser!=undefined){
        this.user = this.dataService.currentUser;
        sessionStorage.setItem("currentUser", JSON.stringify(this.user));
      }
      else{
        this.user=JSON.parse(sessionStorage.getItem("currentUser"));
        console.log(this.user)
      }
     }

  ngOnInit() {
    this.exercises.sort((a, b) => (a.minBPM < b.minBPM) ? 1 : -1);

    this.spotify_service.getUser().subscribe( data => {
      //console.log(data);
      if(data!=null && data!=undefined){
        let body=JSON.parse(data['_body']);
        console.log(body)
        this.user.display_name=body.display_name;
        this.user.img=body.images[0].url;
        this.user.id=body.id;
      }
    },
    error => {
      if(this.user==null){
        alert("Your session has timed out");
        this.router.navigate(['/login']);
      }
      
    },);
    let playlistSub=this.spotify_service.getPlaylists()
    playlistSub.subscribe( data => {
      console.log(data)
      this.user.playlists=JSON.parse(data['_body']).items;
      this.user.modifiedPlaylists=JSON.parse(data['_body']).items;
      
      // this.user.songList=this.getTracks(this.user.playlists, this.user.id);
      this.onlyUserPlaylists()
    });
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

      for(let id of removedIDs){
        this.removePlaylist(id, 'compared')
      }
    
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
      findAndRemove(this.user.modifiedPlaylists, 'id', id);
    
  }
  selectExercise(activeExercise){
    this.activeExercise=activeExercise;
  }
  createPlaylist(){
    this.user.songList=this.getTracks(this.user.modifiedPlaylists);
    let finished = forkJoin(this.subArray);
      finished.subscribe( result => {
        console.log(this.user.songList);
        let analysis = this.getAnalysis(this.user.songList);
        let tFin = forkJoin(this.trackArray);
        tFin.subscribe( result => {
          console.log(analysis);
        });
      });
    
    console.log("created")
    // this.spotify_service.getAnalysis(this.user.songList[0]);
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
  getAnalysis(songs:any){
    let playlist_ids=[];
    let songList=[];
    let loops=0;
    let offset=0;
    let reqLimit=50
    if(songs.length>reqLimit){
      //we have to submit multiple requests to get them all
      loops=Math.ceil(songs.length/reqLimit);
      //this is how many offsets of 50 we will have to do to get all tracks
      console.log(loops);
    }
    for(let l=0; l<loops; l++){
      let loopCounter=0;
      for(let i=offset; i<songs.length; i++){
        if(loopCounter>=50){
          break;
        }
        let trackSub=this.spotify_service.getAnalysis(songs[i].track.id);
        this.trackArray.push(trackSub);
        trackSub.subscribe( tracks => {
          let result=JSON.parse(tracks['_body']).items;
          console.log(result);
          // for(let i = 0; i<songs.length; i++){
            // songList.push(result.track.tempo);
          // }
        },
        error => {
          // alert("Your request could not be completed, for best results try and limit playlist length to under 200 songs");
          this.router.navigate(['/home']);
        });  
        loopCounter++;
      }
      offset=offset+reqLimit
    }

    // for(let i=0; i<songs.length; i++){

    //   for(let l=0; l<loops; l++){
    //     let trackSub=this.spotify_service.getAnalysis(songs[i].track.id);
    //     this.trackArray.push(trackSub);
    //     trackSub.subscribe( tracks => {
    //       let songs=JSON.parse(tracks['_body']).items;
    //       for(let i = 0; i<songs.length; i++){
    //         songList.push(songs[i]);
    //       }
    //     },
    //     error => {
    //       // alert("Your request could not be completed, for best results try and limit playlist length to under 200 songs");
    //       this.router.navigate(['/home']);
    //     });  
    //     offset=offset+50
    //   }
      
    // }
    console.log(songList)
    return songList;   
  }

}

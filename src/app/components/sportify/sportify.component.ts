import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from 'src/app/services/spotify.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { UserObject } from '../spotify-comparison/spotify-comparison.component';
import { forkJoin, map, catchError, of, Observable } from 'rxjs';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreatePlaylistModalComponent } from './create-playlist-modal/create-playlist-modal/create-playlist-modal.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-sportify',
  templateUrl: './sportify.component.html',
  styleUrls: ['./sportify.component.scss']
})
export class SportifyComponent implements OnInit {
  collaborative:boolean=false;
  unselectedPlaylists:any = [];
  selectedPlaylists:any = [];
  currentStep = 0;
  maxStep = 4; // Total number of steps
  commonSongs=[];
  commonSongDivider=0;
  progress=0;
  loading=false;
  playlistLimit;
  playlistRuntime;
  playlistSongs;
  sortKey = "tempo"
  avgBPM=0;
  playlistURL: any="3Fi7wMYXoD3fb8kpNzjNoM";
  runtime=0;
  exercises=[
    {name: "Warm Up", bpm: "100 to 140 BPM", minBPM: 100, maxBPM: 140},
    {name: "Cool Down", bpm: "60 to 90 BPM", minBPM: 60, maxBPM: 90},
    {name: "Weight Lifting", bpm: "130 to 150 BPM", minBPM: 130, maxBPM: 150},
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
    private dataService:UserDataService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer) {
      if(this.dataService.currentUser!=undefined){
        this.user = this.dataService.currentUser;
        sessionStorage.setItem("currentUser", JSON.stringify(this.user));
      }
      else{
        this.user=JSON.parse(sessionStorage.getItem("currentUser"));
        console.log(this.user)
      }
      this.playlistURL=this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://open.spotify.com/embed/playlist/${this.playlistURL}`
      );
     }

  ngOnInit() {
    this.exercises.sort((a, b) => (a.minBPM < b.minBPM) ? 1 : -1);
    console.log('getting user')
    this.spotify_service.getUser().subscribe( 
      (data : any) => {
        console.log(data);
        if(data!=null && data!=undefined){
          let body=data;
          console.log(body)
          this.user.display_name=body.display_name;
          this.user.img=body.images[0].url;
          this.user.id=body.id;
        }
      },
      error => {
          alert("Your session has timed out, please log in again");
          this.router.navigate(['/login']);
      },
    );
    let playlistSub=this.spotify_service.getPlaylists()
    playlistSub.subscribe( (data : any) => {
      console.log(data)
      this.user.playlists=data;
      this.user.modifiedPlaylists=data;
      
      // this.user.songList=this.getTracks(this.user.playlists, this.user.id);
      this.onlyUserPlaylists()
      //set list selection
      this.unselectedPlaylists=this.user.modifiedPlaylists;
    });
  }
  nextStep() {
    if (this.currentStep < this.maxStep) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  onlyUserPlaylists(){
    //remove playlists not created by the user
    let removedIDs=[];
    console.log('modified',this.user.modifiedPlaylists)
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
  removeItemsWithNullOrEmptyKey<T>(array, key){
    return array.filter(item => item[key] !== null && item[key] !== "");
  }
  removeSong(songId){
    this.playlistSongs = this.playlistSongs.filter(item => item.id !== songId);
    this.getStats();
  }

  shuffleAndSelect() {
    let x;

    if(this.playlistLimit && this.playlistLimit < this.commonSongs.length){
      x = this.playlistLimit;
    }
    else if(this.playlistRuntime){
      x = this.commonSongs.length;
    }
    else{
      return this.sortByKey(this.commonSongs, this.sortKey);
    }

    // Create a copy of the array to avoid modifying the original array
    let shuffledArray = [...this.commonSongs];
  
    // Fisher-Yates shuffle algorithm
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
  
    let slice=[];
    if(this.playlistLimit){
          // Return the first 'x' items from the shuffled array
          slice = shuffledArray.slice(0, x);
    }
    if(this.playlistRuntime){
      //we'll add songs until we hit our limit
      let time=0;
      for(let song of shuffledArray){
        if(time>this.playlistRuntime){
          break; 
        }
        slice.push(song);
        time+=song.duration_ms/60000;
      }
    }

    return this.sortByKey(slice, this.sortKey);
  }

  reshuffle(){
    this.playlistSongs = this.shuffleAndSelect();
    this.getStats();
  }
  
  
  createPlaylist(){
    this.loading=true;
    this.user.songList=this.getTracks(this.selectedPlaylists);
    let finished = forkJoin(this.subArray);
      finished.subscribe( result => {
        console.log(this.user.songList);
        this.getAnalysis(this.user.songList).subscribe((songList : any)=>{
          //reduce songlist array
          const mergedArray = this.user.songList
          .filter(a => songList.some(b => b.id === a.track.id))  // Keep only entries that have a match in arrayB
          .map(a => {
            const matchB = songList.find(b => b.id === a.track.id); // Find the matching object in arrayB
            return { ...a.track, ...matchB, ...{'artist': a.track.artists[0].name} }; // Merge the matching objects
          });
          console.log('results', mergedArray)
            this.commonSongs=this.removeItemsWithNullOrEmptyKey(mergedArray, 'name')
            this.playlistSongs = this.shuffleAndSelect();
            this.getStats();
            this.nextStep();
            this.loading=false;
          // this.spotify_service.getTracks(songList.map(song => song.id)).subscribe((results : any)=>{
          //   console.log('results',results)
          //   this.commonSongs=results;
          //   this.commonSongDivider=Math.floor(this.commonSongs.length/3);
          //   this.nextStep();
          //   this.loading=false;
          // })
        });
      });
  }
  sortByKey(array, key, order: 'asc' | 'desc' = 'asc') {
    console.log(key)
    return array.sort((a, b) => {
      if (a[key] < b[key]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0; // If they are equal
    });
  }
  selectChange($event){
    let target = $event.target.value
    this.sortKey = target;
    if(this.commonSongs){
      this.sortByKey(this.commonSongs, target);
    }
  }

  getStats(){
    this.getRuntime();
    this.getAvg();
  }

  getAvg(){
    this.avgBPM=0;
    for(let song of this.playlistSongs){
      this.avgBPM+=song.tempo;
    }
    //turn into minutes
    this.avgBPM=this.avgBPM/this.playlistSongs.length;
  }

  getRuntime(){
    this.runtime=0;
    for(let song of this.playlistSongs){
      this.runtime+=song.duration_ms;
    }
    //turn into minutes
    this.runtime=this.runtime/60000;
  }

  
  getTracks(playlists:any){
    let playlist_ids=[];
    let songList=[];
    for(let i=0; i<playlists.length; i++){
      let loops=1;
      let progressStep;
      if(playlists[i].tracks.total>50){
        //we have to submit multiple requests to get them al
        console.log(playlists[i])
        loops=Math.ceil(playlists[i].tracks.total/50);
        //our progress step with each loop, all loops completed is 50% done
        progressStep=50/loops;
        //this is how many offsets of 50 we will have to do to get all tracks
        console.log(playlists[i].name, loops);
      }
      // for(let l=0; l<loops; l++){
        let trackSub=this.spotify_service.getPlaylistTracks(playlists[i]);
        this.subArray.push(trackSub);
        trackSub.subscribe(
          (songs : any)=>{
            for(let i = 0; i<songs.length; i++){
              songList.push(songs[i]);
            }
            this.progress++;
          },
          error => {
            console.error(error);
          }
        );  
      // }
      
    }
    return songList;   
  }
  getAnalysis(songs: any): Observable<any[]> {
    let song_ids: string[] = [];
    let songList: any[] = [];
    let loops = 0;
    let offset = 0;
    let reqLimit = 50;
    let progressStep;
  
    // Calculate how many loops we need if we have more than reqLimit
    if (songs.length > reqLimit) {
      loops = Math.ceil(songs.length / reqLimit);
    } else {
      loops = 1; // At least 1 loop if songs length is less than reqLimit
    }
    progressStep=50/loops;
  
    // Collect song IDs in batches
    for (let l = 0; l < loops; l++) {
      let loopCounter = 0;
      for (let i = offset; i < songs.length; i++) {
        if (loopCounter >= reqLimit) {
          break;
        }
        song_ids.push(songs[i].track.id); // Assumes songs[i].track.id is a valid id
        loopCounter++;
        this.progress+=progressStep;
      }
      offset += reqLimit;
    }
  
    // Return the observable from getAnalysis instead of subscribing here
    return this.spotify_service.getAnalysis(song_ids).pipe(
      map((tracks: any[]) => {
        // Process the tracks and build the songList
        for (let track of tracks) {
          if (track.tempo >= this.activeExercise.minBPM && track.tempo <= this.activeExercise.maxBPM) {
            songList.push({ id: track.id, tempo: track.tempo });
          }
        }
        return songList; // Return the songList array
      }),
      catchError(error => {
        console.error('Error fetching analysis:', error);
        // Return an empty array in case of error
        return of([]);
      })
    );
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = '60vw';

    let username=this.user.display_name.split(" ")[0];

    dialogConfig.data = {
      name: `${username}'s ${this.activeExercise.name} Playlist`,
      isPublic: true,
      description: `Your perfect ${this.playlistRuntime ? this.playlistRuntime+" minute " : ''}${this.playlistLimit ? this.playlistLimit+" song " : ''}playlist for ${this.activeExercise.name}, targeting a BPM between ${this.activeExercise.minBPM} and ${this.activeExercise.maxBPM}.`
  };

  const dialogRef = this.dialog.open(CreatePlaylistModalComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      data => {
        console.log("Dialog output:", data)
        this.spotify_service.createPlaylist(this.user, data.name, data.description, data.isPublic)
        .subscribe( (playlist : any) => {
          console.log(playlist)
          this.playlistURL=this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://open.spotify.com/embed/playlist/${playlist.id}`
          );
          this.spotify_service.addTracksToPlaylist(playlist.id, this.playlistSongs).subscribe(() => {
            console.log('Tracks added successfully!');
            this.nextStep();
          });
        });
      }
  );
}
  
  

}

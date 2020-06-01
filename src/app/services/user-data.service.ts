import { Injectable } from '@angular/core';
import {UserObject} from '../components/home/home.component'
@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  public currentUser : UserObject;
  public comparedUser : UserObject;
  constructor() { }
}

import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DesignUtilityService {

  geolocation = new Subject<boolean>();
  constructor() { }
}

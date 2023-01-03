import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DesignUtilityService {

  geolocation = new Subject<boolean>();
  publishGeolocationData(data: any) {
    this.myCalendar.next(data);
  }

  getGeolocationDataObs(): Subject<any> {
    return this.myCalendar;
  }

  public myCalendar = new Subject<any>();
  publishCalendarData(data: any) {
    this.myCalendar.next(data);
  }

  getCalendarDataObs(): Subject<any> {
    return this.myCalendar;
  }
  constructor() { }
}

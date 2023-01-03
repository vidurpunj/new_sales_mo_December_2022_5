import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DesignUtilityService {

  geolocation = new Subject<boolean>();
  public myCalendar = new Subject<any>();
  publishCalendarData(data: any) {
    this.myCalendar.next(data);
  }

  getCalendarDataObs(): Subject<any> {
    return this.myCalendar;
  }
  constructor() { }
}

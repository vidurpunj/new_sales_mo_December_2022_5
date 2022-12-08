import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  private userId: number | any;
  private appId: number = 111;

  constructor(public http: HttpClient) {
    console.log('Hello SharedDataProvider Provider');
  }

  public getAppId(): number{
    return this.appId;
  }

  public setUserId(userId: number){
    this.userId = userId;
  }

  public getUserId(): number{
    return this.userId;
  }

}

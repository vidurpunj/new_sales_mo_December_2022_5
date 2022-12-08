import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

//urlService:any="http://216.48.185.161"; // SALESMO
  urlService: any = "https://salesmo.spadeinfotech.net"; // SALESMO
  //urlService:any='http://app3.spadeinfotech.net:81/EazysalesMultitenantBackend'; // SIPLC02
  //simsAuthServiceUrl: string = 'https://salesmo.spadeinfotech.net:8078/SIMS/auth-service/v1';
  //simsOTPServiceUrl: string = 'https://salesmo.spadeinfotech.net:8078/SIMS/otp-service/v1/custom';
  //simsDataServiceUrl: string = "https://salesmo.spadeinfotech.net:8078/SIMS/data-service/v1/endpointhandler";

  simsAuthServiceUrl: string = 'http://172.107.32.186:8079/SIMS/auth-service/v1';
  simsOTPServiceUrl: string = 'http://172.107.32.186:8079/SIMS/otp-service/v1/custom';
  simsDataServiceUrl: string = "http://172.107.32.186:8079/SIMS/data-service/v1/endpointhandler";

  appVersion: any = "3.1.2"; //upcoming version config:1.9.1

  InitialConfigFile: any = 'assets/app_Config.json';

  constructor(public http: HttpClient) {
    //this.getLoadInitialConfig();
    console.log('Hello ApiProvider Provider');
    //   this.getLoadInitialConfig().subscribe(data =>{
    //   this.urlService=data.urlService,
    //   this.simsAuthServiceUrl=data.simsAuthServiceUrl,
    //   this.simsOTPServiceUrl=data.simsOTPServiceUrl,
    //   this.simsDataServiceUrl=data.simsDataServiceUrl,
    //   this.appVersion=data.appVersion
    //   }
    //   , error => console.log(error));

    // }
  }
  /**
   * calling the services with POST
   * @param endpoint
   * @param body
   * @param reqOpts
   */
  postauthService(endpoint: string, body: any, reqOpts?: any) {
    console.log("Request URL: " + this.urlService + "/" + endpoint);
    // return this.http.post(this.urlService + '/' + endpoint, body, reqOpts);
    return this.http.post(this.urlService + '/' + endpoint, body, { "responseType": "json" });
  }

  getAuthService(endpoint: string, reqOpts?) {
    console.log("Request URL: " + this.urlService + "/" + endpoint);
    // return this.http.get(this.urlService + '/' + endpoint,reqOpts);
    return this.http.get(this.urlService + '/' + endpoint, { "responseType": "json" });
  }

  putAuthService(endpoint: string, body: any, reqOpts?: any) {
    console.log("Request URL: " + this.urlService + "/" + endpoint);
    // return this.http.put(this.urlService + '/' + endpoint, body, reqOpts);
    return this.http.put(this.urlService + '/' + endpoint, body, { "responseType": "json" });
  }

  postSimsAuthService(endpoint: string, body: any, reqOpts?: any) {
    console.log("Request Auth URL: " + this.simsAuthServiceUrl + "/" + endpoint);
    return this.http.post(this.simsAuthServiceUrl + '/' + endpoint, body, { "responseType": "json" });
  }

  postSimsDataService(endpoint: string, body: any, reqOpts?: any) {
    console.log("Request Data URL: " + this.simsDataServiceUrl + "/" + endpoint);
    return this.http.post(this.simsDataServiceUrl + '/' + endpoint, body, { "responseType": "json" });
  }

  postSimsOTPService(endpoint: string, body: any, reqOpts?: any) {
    console.log("Request OTP URL: " + this.simsOTPServiceUrl + "/" + endpoint);
    return this.http.post(this.simsOTPServiceUrl + '/' + endpoint, body, { "responseType": "json" });
  }


  public getLoadInitialConfig() {
    this.http.get("./assets/app_Config.json").subscribe(dataValue => {
        let data: any = {};
        data = dataValue
        this.urlService = data.urlService,
          this.simsAuthServiceUrl = data.simsAuthServiceUrl,
          this.simsOTPServiceUrl = data.simsOTPServiceUrl,
          this.simsDataServiceUrl = data.simsDataServiceUrl,
          this.appVersion = data.appVersion
      }
      , error => console.log(error));

  }

}

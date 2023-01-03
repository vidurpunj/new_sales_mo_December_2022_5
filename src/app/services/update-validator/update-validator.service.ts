import {Injectable} from '@angular/core';
import {AlertController, ToastController, LoadingController} from '@ionic/angular';
import {Observable, Subject} from "rxjs";
import {PermissionRequest} from "../../pages/permission/PermissionRequest";
import {ApiService} from "../api/api.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";

@Injectable({
  providedIn: 'root'
})
export class UpdateValidatorService {

  constructor(
    public alertCtrl: AlertController,
    private apiProvider: ApiService,
    private sharedData: SharedDataService,
    private toast: ToastController,
    // private locationAccuracy: LocationAccuracy
  ) {
  }

  async showAlert(title, message) {
    let alert = await this.alertCtrl.create({
      header: 'title',
      // subTitle: message,
      message: message,
      buttons: [{text: 'ok'}],
      backdropDismiss: false
    })
    alert.present();
  }
  async showToast(connectionState) {
    let toastIcon = await this.toast.create({
      message: `${connectionState}`,
      duration: 1500
    })
    toastIcon.present();
  }
  validatePermissions(permissionList: string[]): Observable<Map<string, boolean>> {
    let result: Subject<Map<string, boolean>> = new Subject<Map<string, boolean>>();
    let resultMap: Map<string, boolean> = new Map<string, boolean>();

    // let permissionRequest: PermissionRequest = new PermissionRequest(3340, 111, permissionList);
    // @ts-ignore
    let permissionRequest: PermissionRequest = new PermissionRequest(+window.localStorage.getItem('userid'), this.sharedData.getAppId(), permissionList);
    let permissionService: Observable<any> = this.apiProvider.postSimsAuthService('validatePermissions', permissionRequest);
    permissionService.subscribe(response => {
      if (response.status == 1) {
        console.log("Permission call success response -> ", JSON.stringify(response));
        permissionList.forEach(value => {
          resultMap.set(value, response.data[value]);
        })
      } else
        console.log("Permission call failure");

      result.next(resultMap);
    });
    return result;
  }

  getDateFormat(dateVal) {
    var d = new Date(dateVal),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
  }
  getAltDateFormat(dateVal) {
    var d = new Date(dateVal),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
  getTimeFormat(time) {
    var timeString = time;
    var H = +timeString.substr(0, 2);
    var h = H % 12 || 12;
    var ampm = (H < 12 || H === 24) ? " AM" : " PM";
    timeString = h + timeString.substr(2, 6) + ampm;
    return timeString;
  }
  getMonthDateFormat(dateVal) {
    var current_datetime = new Date(dateVal)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let formatted_date = current_datetime.getDate() + " " + months[current_datetime.getMonth()] + " " + current_datetime.getFullYear()
    return formatted_date;
  }
  getFullMonthDateFormat(dateVal) {
    var current_datetime = new Date(dateVal)
    const months = ["January ", "February", "March ", "April ", "May", "June", "July", "August", "September", "October", "November", "December"];
    let formatted_date = months[current_datetime.getMonth()] + " " + current_datetime.getDate() + ", " + current_datetime.getFullYear()
    return formatted_date;
  }

  getCurrent_Time() {
    let displaytime: any = new Date().toLocaleTimeString();

    return displaytime
  }

  getCurrentDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('-');
  }
  date_diff_indays(date1, date2) {
    let dt1 = new Date(date1);
    let dt2 = new Date(date2);
    return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
  }
  getOpenLocationservice() {
    // this.locationAccuracy.canRequest().then((canRequest: boolean) => {
    //   if (canRequest) {
    //     // the accuracy option will be ignored by iOS
    //     this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
    //       () =>
    //         this.getGeolocation(),
    //       error =>
    //         this.getOpenLocationservice()
    //     );
    //   } else {
    //     this.getGeolocation();
    //   }
    // });
  }
}

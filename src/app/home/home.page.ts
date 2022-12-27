import {Component, NgZone, OnInit} from '@angular/core';
import {LoadingController, NavController} from "@ionic/angular";
import {Observable} from "rxjs";
import {Network} from "@capacitor/network";
import {PluginListenerHandle} from "@capacitor/core";
import {Storage} from "@ionic/storage";
import {UpdateValidatorService} from "../services/update-validator/update-validator.service";
import {ApiService} from "../services/api/api.service";
import {Device} from "@capacitor/device";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  attendancePermission: boolean = false;
  attendanceCurrentStatusServiceSuccess: Observable<any> | any;
  isAttendance: boolean = false;
  currentStatusValue: any;
  currentStatus: any;
  connected: boolean | undefined;
  connectionType: string = 'none';
  networkListner: PluginListenerHandle | undefined;
  visitStarted: boolean = false;
  isVisitAvailable: any;
  isVisit: boolean = false;
  isVisitSummaryAdded: boolean = false;
  startTime: string | any;
  endTime: string | any;
  startDate: string | any;
  endDate: string | any;
  startGeoLocationData: any;
  stopGeolocationData: any;

  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private loadingCtrl: LoadingController,
    private updatevalidator: UpdateValidatorService,
    private storage: Storage,
    private apiProvider: ApiService,
    // private appVersionCode: AppVersion

  ) {
    this.networkListner = Network.addListener('networkStatusChange', status => {
      console.log("Inside network check")
      console.log('Network status changed', status);
      this.ngZone.run(() => {
        this.changeStatus(status);
      })
    });

    const status = Network.getStatus();
    this.changeStatus(status);
    this.getCurrentInitialStatus();
  }

  async getCurrentInitialStatus() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      if (this.connected) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
        loader.dismiss();
      } else {
        this.attendanceCurrentStatusServiceSuccess = this.apiProvider.getAuthService('initialApi/' + window.localStorage.getItem('userid') + '/' + window.localStorage.getItem('org_id'), 'GET')
        this.attendanceCurrentStatusServiceSuccess.subscribe(result => {
          console.log("initalAPiResult:" + JSON.stringify(result));
          if (result.status == 1) {

            this.checkingUpdateAppInfo(result.data.app_version_details)


            window.localStorage.setItem('currentAttendanceStatus', result.data.current_status);
            //   this.updatevalidator.showToast(result.message.message);
            if (window.localStorage.getItem('currentAttendanceStatus') == "P") {
              this.isVisit = false;
              this.currentStatusValue = "P";
              this.currentStatus = "present";
              if (result.data.currentVisit != null) {
                this.visitStarted = true;
                window.localStorage.setItem("visit_Id", result.data.currentVisit.id);
                // window.localStorage.setItem("VisitSummaryId", result.data.currentVisit.visit_type)
                if (window.localStorage.getItem('visitSummaryId') == window.localStorage.getItem("visit_Id")) {
                  this.isVisitSummaryAdded = true;

                } else {
                  this.isVisitSummaryAdded = false;
                }
                this.startTime = result.data.currentVisit.start_time;
                this.startTime = this.updatevalidator.getTimeFormat(this.startTime);
                this.startDate = this.updatevalidator.getDateFormat(result.data.currentVisit.start_date);
                this.startGeoLocationData = result.data.currentVisit.start_location;
              } else {
                this.getAllVisitsService();
              }

            } else if (window.localStorage.getItem('currentAttendanceStatus') == "A") {
              this.isVisit = true;
              this.currentStatusValue = "A";
              this.currentStatus = "absent";
              this.getAllVisitsService();
            } else if (window.localStorage.getItem('currentAttendanceStatus') == "L") {
              this.isVisit = true;
              this.currentStatusValue = "L";
              this.currentStatus = "absent";
              this.getAllVisitsService();
            } else if (window.localStorage.getItem('currentAttendanceStatus') == "H") {
              this.currentStatusValue = "H";
              this.currentStatus = "present";
              this.navCtrl.navigateRoot('AttendancePage');
            } else if (window.localStorage.getItem('currentAttendanceStatus') == "W") {
              this.currentStatusValue = "W";
              this.currentStatus = "present";
              window.localStorage.setItem('weekOffDay1', result.data.Weeklyoff_day.first_weekend);
              window.localStorage.setItem('weekOffDay2', result.data.Weeklyoff_day.second_weekend);
              this.navCtrl.navigateRoot('AttendancePage');
            } else if (window.localStorage.getItem('currentAttendanceStatus') == "X") {
              this.isAttendance = true;
              this.currentStatusValue = "Attendance";
              this.isVisit = false;
              this.getAllVisitsService();
            }
            loader.dismiss();
          } else {
            this.updatevalidator.showToast(result.message.message)
            loader.dismiss();
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
          loader.dismiss();
        })
      }
    });
    // loader.dismiss();
  }

  async getAllVisitsService() {
    console.log("Calling recent visits api");
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    // loader.present().then(() => {
    //   this.allVistsServiceSuccess = this.apiProvider.getAuthService('visitApi/recentVisits/' + window.localStorage.getItem('userid') + '/' + window.localStorage.getItem('org_id'), 'GET')
    //   this.allVistsServiceSuccess.subscribe(results => {
    //     console.log("recentVisitsResult:" + JSON.stringify(results));
    //     if (results.status == 1) {
    //       this.isVisitAvailable = " ";
    //       this.isRecentVistFound = true;
    //       this.allVistsDataList = results.data;
    //       this.allVistsDataList.forEach(obj => {
    //         obj.start_time = this.updatevalidator.getTimeFormat(obj.start_time);
    //       });
    //       //  this.updatevalidator.showToast(results.message.message)
    //     } else if (results.status == 0) {
    //       this.isRecentVistFound = false;
    //       this.isVisitAvailable = "No recent visits found! "
    //       this.updatevalidator.showAlert("Message", results.message.message);
    //     }
    //     loader.dismiss();
    //   }, (err) => {
    //     this.updatevalidator.showAlert("Server Error", "Please try again!!");
    //     loader.dismiss();
    //   })
    // })
  }

  async checkingUpdateAppInfo(appinfo) {
    const deviceInfo = await Device.getInfo();
    if (deviceInfo.platform === 'ios') {
      alert("iosss")
      // this.appVersionCode.getVersionNumber().then(value => {
      //   if (appinfo.app_version_code != value) {
      //     this.updatevalidator.showAlert(appinfo.app_alert_message, appinfo.app_alert_description)
      //   }
      // }).catch(err => {
      //   alert(err);
      // });
    }
  }

  goToHome() {
    this.navCtrl.navigateRoot('HomePage');
  }

  goToAttendance() {
    this.navCtrl.navigateForward('AttendancePage');
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  async ngOnInit() {
    // create empty storage
    // await this.storage.create()
  }
}

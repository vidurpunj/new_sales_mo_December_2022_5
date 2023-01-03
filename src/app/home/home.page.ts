import {Component, NgZone, OnInit} from '@angular/core';
import {LoadingController, NavController} from "@ionic/angular";
import {Observable} from "rxjs";
import {Network} from "@capacitor/network";
import {PluginListenerHandle} from "@capacitor/core";
import {Storage} from "@ionic/storage";
import {UpdateValidatorService} from "../services/update-validator/update-validator.service";
import {ApiService} from "../services/api/api.service";
import {Device} from "@capacitor/device";
import {DesignUtilityService} from "../services/design-utility.service";
import {NavigationExtras} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  attendancePermission: boolean = false;
  attendanceCurrentStatusServiceSuccess: Observable<any> | any;
  allVistsServiceSuccess: Observable<any> | undefined;
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
  deviceInfo: any;
  stopLatitude: any;
  stopLongitude: any;
  stopVistParamters: any;
  startLatitude: any;
  startLongitude: any;
  startVistParamters: any;
  stopVisitServiceSuccess: Observable<any> | undefined;
  startVisitServiceSuccess: Observable<any> | undefined;
  isVisitStop: boolean = false;
  visitStopped: boolean = false;
  isRecentVistFound: boolean = false;
  allVistsDataList: any[] = [];

  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private loadingCtrl: LoadingController,
    private updatevalidator: UpdateValidatorService,
    private storage: Storage,
    private apiProvider: ApiService,
    private _geolocation: DesignUtilityService
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
    this.getDeviceInfo();
  }

  async getDeviceInfo() {
    console.log("Getting device info ....................................");
    this.deviceInfo = await Device.getInfo();
    console.log("Device info:................." + this.deviceInfo);
    console.log("Device info:................. platform: " + this.deviceInfo.platform);
    console.log("Device info:................. operatingSystem: " + this.deviceInfo.operatingSystem);
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
    loader.present().then(() => {
      this.allVistsServiceSuccess = this.apiProvider.getAuthService('visitApi/recentVisits/' + window.localStorage.getItem('userid') + '/' + window.localStorage.getItem('org_id'), 'GET')
      this.allVistsServiceSuccess.subscribe(results => {
        console.log("recentVisitsResult:" + JSON.stringify(results));
        if (results.status == 1) {
          this.isVisitAvailable = " ";
          this.isRecentVistFound = true;
          this.allVistsDataList = results.data;
          this.allVistsDataList.forEach(obj => {
            obj.start_time = this.updatevalidator.getTimeFormat(obj.start_time);
          });
          //  this.updatevalidator.showToast(results.message.message)
        } else if (results.status == 0) {
          this.isRecentVistFound = false;
          this.isVisitAvailable = "No recent visits found! "
          this.updatevalidator.showAlert("Message", results.message.message);
        }
        loader.dismiss();
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again!!");
        loader.dismiss();
      })
    })
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
    this.navCtrl.navigateForward('attendance');
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  async ngOnInit() {
  }

  doRefresh(refresher) {
    this.getAllVisitsService();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  startvisit() {
    this.isVisit = true; // for test
    this.callStart_StopService('start');
  }

  callStart_StopService(visitStatus) {
    if (this.isDesktopMode()) {
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        if (visitStatus == 'stop') {
          // this.stopGeolocationData = GeoData.subLocality + "," + GeoData.locality;
          // this.stopGeolocationData = GeoData.subThoroughfare + "," + GeoData.thoroughfare + "," +
          //   GeoData.subLocality + "," + GeoData.locality + "," +
          //   GeoData.subAdministrativeArea + "," + GeoData.administrativeArea + "-" + GeoData.postalCode;
          this.stopGeolocationData = "";
          this.stopLatitude = "";
          this.stopLongitude = "";
          this.endTime = this.updatevalidator.getCurrent_Time();
          this.endDate = this.updatevalidator.getCurrentDate();
          this.stopVisitServiceCall();

        } else if (visitStatus == 'start') {
          this.startTime = this.updatevalidator.getCurrent_Time();
          this.startDate = this.updatevalidator.getCurrentDate();
          // this.startGeoLocationData = GeoData.subLocality + "," + GeoData.locality;
          // this.startGeoLocationData = GeoData.subThoroughfare + "," + GeoData.thoroughfare + "," +
          //   GeoData.subLocality + "," + GeoData.locality + "," +
          //   GeoData.subAdministrativeArea + "," + GeoData.administrativeArea + "-" + GeoData.postalCode;
          this.startGeoLocationData = "";

          this.startLatitude = "",
            this.startLongitude = ""
          this.startVisitServiceCall();
        }
      }
    } else {
      this._geolocation.geolocation.unsubscribe();
      this.updatevalidator.getOpenLocationservice();
      this._geolocation.geolocation.subscribe((GeoData) => {

        if (GeoData != null || GeoData != undefined || GeoData != " ") {
          if (this.connected === false) {
            this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
          } else {
            if (visitStatus == 'stop') {
              // this.stopGeolocationData = GeoData.subLocality + "," + GeoData.locality;
              // this.stopGeolocationData = GeoData.subThoroughfare + "," + GeoData.thoroughfare + "," +
              //   GeoData.subLocality + "," + GeoData.locality + "," +
              //   GeoData.subAdministrativeArea + "," + GeoData.administrativeArea + "-" + GeoData.postalCode;
              console.log('Commented .... 1')
              // this.stopGeolocationData = this.getGeolocationAddress(GeoData);
              console.log("Commented Geolocation below ......")
              // this.stopLatitude = GeoData.latitude
              // this.stopLongitude = GeoData.longitude
              this.endTime = this.updatevalidator.getCurrent_Time();
              this.endDate = this.updatevalidator.getCurrentDate();
              this.stopVisitServiceCall();

            } else if (visitStatus == 'start') {
              this.startTime = this.updatevalidator.getCurrent_Time();
              this.startDate = this.updatevalidator.getCurrentDate();
              // this.startGeoLocationData = GeoData.subLocality + "," + GeoData.locality;
              // this.startGeoLocationData = GeoData.subThoroughfare + "," + GeoData.thoroughfare + "," +
              //   GeoData.subLocality + "," + GeoData.locality + "," +
              //   GeoData.subAdministrativeArea + "," + GeoData.administrativeArea + "-" + GeoData.postalCode;
              console.log('Commented ....2');
              // this.startGeoLocationData = this.getGeolocationAddress(GeoData);
              console.log("Commented below geolocation .........")
              // this.startLatitude = GeoData.latitude
              // this.startLongitude = GeoData.longitude
              this.startVisitServiceCall();
            }
          }
        } else {
          this.updatevalidator.getOpenLocationservice();
        }

      });
    }
  }


  isDesktopMode(): boolean {
    let isDesktop: boolean = false;
    console.log("Access through Web: " + this.deviceInfo.platform);
    // return true if its now android or ios
    if (this.deviceInfo.platform === 'android' || this.deviceInfo.platform === 'ios') {
      isDesktop = false
    }
    if (this.deviceInfo.platform === 'web') {
      isDesktop = true;
    }
    return isDesktop;
  }

  async stopVisitServiceCall() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.stopVistParamters = {
        org_id: window.localStorage.getItem('org_id'),
        visit_id: window.localStorage.getItem("visit_Id"),
        end_location: this.stopGeolocationData,
        end_lat: this.stopLatitude,
        end_long: this.stopLongitude
      }
      console.log(this.stopVistParamters);
      this.stopVisitServiceSuccess = this.apiProvider.postauthService('visitApi/stopVisit', this.stopVistParamters, 'POST')
      this.stopVisitServiceSuccess.subscribe(stopVisitResult => {
        console.log("stopVisitResult:" + JSON.stringify(stopVisitResult));
        if (stopVisitResult.status == 1) {
          if (window.localStorage.getItem('visitSummaryId') == window.localStorage.getItem("visit_Id")) {
            this.isVisitSummaryAdded = true;
          } else {
            this.isVisitSummaryAdded = false;
          }
          this.visitStopped = true;
          // this.updatevalidator.showToast(stopVisitResult.message.message)
          if (!this.isDesktopMode()) {
            this._geolocation.geolocation.unsubscribe();
          }
          loader.dismiss();
        } else if (stopVisitResult.status == 0) {
          this.isVisitStop = false; //for test
          this.updatevalidator.showToast(stopVisitResult.message.message);
          loader.dismiss();
        }
      }, (err) => {
        this.isVisitStop = false; //for test
        this.updatevalidator.showAlert("Server Error", "Please try again!!");
        loader.dismiss();
      })
      // loader.dismiss();
    });
  }

  async startVisitServiceCall() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.startVistParamters = {
        org_id: window.localStorage.getItem('org_id'),
        user_id: window.localStorage.getItem('userid'),
        emp_name: window.localStorage.getItem('user_name'),
        start_location: this.startGeoLocationData,
        start_lat: this.startLatitude,
        start_long: this.startLongitude
      }
      console.log(this.startVistParamters);
      this.startVisitServiceSuccess = this.apiProvider.postauthService('visitApi/startVisitNew', this.startVistParamters, 'POST')
      this.startVisitServiceSuccess.subscribe(startVisitResult => {
        console.log("startVisitResult:" + JSON.stringify(startVisitResult));
        if (startVisitResult.status == 1) {
          if (!Array.isArray(startVisitResult.data.attendance)) {
            window.localStorage.setItem('currentAttendanceStatus', startVisitResult.data.attendance.attendance_status);
            this.currentStatusValue = "P";
            this.currentStatus = "present";
          }
          this.visitStarted = true;
          window.localStorage.setItem("visit_Id", startVisitResult.data.visit_id);
          if (window.localStorage.getItem('visitSummaryId') == window.localStorage.getItem("visit_Id")) {

            this.isVisitSummaryAdded = true;
          } else {
            this.isVisitSummaryAdded = false;
          }
          // this.updatevalidator.showToast(startVisitResult.message.message);
          if (!this.isDesktopMode()) {
            this._geolocation.geolocation.unsubscribe();
          }
          loader.dismiss();
        } else if (startVisitResult.status == 0) {
          this.isVisit = false; // for test
          this.updatevalidator.showToast(startVisitResult.message.message);
          loader.dismiss();
        }
      }, (err) => {
        this.isVisit = false; // for test
        this.updatevalidator.showAlert("Server Error", "Please try again!!");
        loader.dismiss();
      });
      // loader.dismiss();
    })
  }

  GoToVisitInfo(visitInfo) {
    if (visitInfo.visit_status == 'Completed') {
      let navigationExtras: NavigationExtras = {
        state: {
          "visitData": visitInfo
        }
      };
      this.navCtrl.navigateForward('VisitDetailsPage', navigationExtras);
      console.log("visit selected: " + JSON.stringify(visitInfo));
    } else if (visitInfo.visit_status == 'Incomplete') {
      let navigationExtras: NavigationExtras = {
        state: {
          "visitData": visitInfo
        }
      };
      this.navCtrl.navigateForward('VisitSummaryPage', navigationExtras);
      console.log("visit selected: " + JSON.stringify(visitInfo));
    }
  }

  completevisit() {
    this.navCtrl.navigateForward('CompleteVisitPage');
  }

  stopVisit() {
    this.isVisitStop = true;  // for test
    this.callStart_StopService('stop');
  }

  addVisitSummary() {
    this.navCtrl.navigateForward('VisitSummaryPage');
  }





















}

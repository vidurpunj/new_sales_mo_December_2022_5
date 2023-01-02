import {Component, NgZone, OnInit} from '@angular/core';
import {LoadingController, NavController} from "@ionic/angular";
import {Device} from "@capacitor/device";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {Network} from "@capacitor/network";
import {PluginListenerHandle} from "@capacitor/core";
import {ApiService} from "../../services/api/api.service";
import {Observable} from "rxjs";
import {DesignUtilityService} from "../../services/design-utility.service";

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  currentStatus: any;
  isAttendance: boolean = false;
  currentStatusValue: any;
  activeStatusCSS: any;
  IsInactive: boolean = false;
  btnclass: any;
  btnImg: any = "distributor.png";
  message: any = 'You have not marked attendance yet';
  dateTime: any;
  timeOutTime: any;
  geoLocationData: any;
  timeOutGeoLocation: any;
  btnclassdeactive: any;
  isPresent: boolean = false;
  isAbsent: boolean = false;
  isPresentEnable: boolean = false;
  isAbsentEnable: boolean = false;
  Time: any;
  date: any;
  connected: boolean | undefined;
  connectionType: string = 'none';
  networkListner: PluginListenerHandle | undefined;
  attendenceId: any;
  latitude: any;
  longitude: any;
  attendanceServiceSuccess: Observable<any> | any;
  attendanceCurrentStatusServiceSuccess: Observable<any> | any;
  holidayStatus: boolean = false;
  Hstatus: any;
  IsOnLeave: boolean = false;
  Isholiday: boolean = false;
  startLeaveDate: any;
  endLeaveDate: any;
  leaveStatus: any;
  titleWeekly_Holiday: any;
  isShowAddress: boolean = false;
  status: any = 'x';
  deviceInfo: any;
  firstWeekOffDay: any;
  secondWeekOffDay: any;
  applyLeavePermission: boolean = false;
  geolocation: any;
  constructor(
    public navCtrl: NavController,
    private updatevalidator: UpdateValidatorService,
    private loadingCtrl: LoadingController,
    private apiProvider: ApiService,
    private ngZone: NgZone,
    private _geolocation: DesignUtilityService
  ) {
    // check network status
    this.checkNetworkStatus();
    // get device info
    this.getDeviceInfo();
  }

  getcurrentAttendanceStatus() {
    if (window.localStorage.getItem('currentAttendanceStatus') == "P") {
      this.currentStatusValue = "P";
      this.currentStatus = "present";
      this.activeStatusCSS = "active"
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "A") {
      this.currentStatusValue = "A";
      this.currentStatus = "absent";
      this.activeStatusCSS = "active"
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "L") {
      this.currentStatusValue = "L";
      this.currentStatus = "absent";
      this.activeStatusCSS = "active"
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "H") {
      this.currentStatusValue = "H";
      this.currentStatus = "present";
      this.activeStatusCSS = "active";
      this.titleWeekly_Holiday = "Today Is Holiday";
      this.holidayStatus = true;
      this.IsInactive = false;
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "W") {
      this.currentStatusValue = "W";
      this.currentStatus = "present";
      this.activeStatusCSS = "active"
      this.titleWeekly_Holiday = "Today Is Weekly Off";
      if (window.localStorage.getItem('weekOffDay1') != "undefined") {
        console.log("1", window.localStorage.getItem('weekOffDay1'));
        // this.firstWeekOffDay = window.localStorage.getItem('weekOffDay1');
      }
      if (window.localStorage.getItem('weekOffDay2') != "undefined") {
        console.log("2", window.localStorage.getItem('weekOffDay2'));
        // this.secondWeekOffDay = window.localStorage.getItem('weekOffDay2');
      }
      this.holidayStatus = true;
      this.IsInactive = false;
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "X") {
      this.isAttendance = true;
      this.currentStatusValue = "Attendance";
    }
  }

  goToHome() {
    this.navCtrl.navigateRoot('HomePage');
  }

  async getCurrentInitialStatus() {
    console.log("Inside getCurrentInitialStatus ....")
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    console.log('this.connected', this.connected);
    loader.present().then(async () => {
      if (!this.connected) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        console.log("Now inside the ......")
        // this.attendanceCurrentStatusServiceSuccess = this.apiProvider.getAuthService('initialApi/'+window.localStorage.getItem('userid'), 'GET')
        this.attendanceCurrentStatusServiceSuccess = this.apiProvider.getAuthService('initialApi/' + window.localStorage.getItem('userid') + '/' + window.localStorage.getItem('org_id'), 'GET')
        this.attendanceCurrentStatusServiceSuccess.subscribe(result => {
          console.log("initalAPiResult:" + JSON.stringify(result));
          if (result.status == 1) {
            this.getcurrentattStatus(result.data);
            if (result.data.attendance_data) {
              this.attendenceId = result.data.attendance_data.id;
            }
            window.localStorage.setItem('currentAttendanceStatus', result.data.current_status);
            //  this.updatevalidator.showToast(result.message.message);
            loader.dismiss()
          } else {
            this.updatevalidator.showToast(result.message.message)
            loader.dismiss()
          }
        }, (err) => {
          console.log("Server Error", "Please try again after sometime ....");
          this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
          loader.dismiss();
        })
      }
      loader.dismiss();
    })
  }

  getcurrentattStatus(data) {
    console.log("getcurrentattStatus .....")
    if (data.current_status == "H") {
      this.holidayStatus = true;
      this.IsInactive = false;
      this.currentStatusValue = "H";
      this.currentStatus = "present";
      this.activeStatusCSS = "active"
    } else if (data.current_status == "L") {
      this.IsInactive = false;
      this.holidayStatus = false
      this.IsOnLeave = true;
      this.startLeaveDate = this.updatevalidator.getDateFormat(data.leaveData.start_date);
      this.endLeaveDate = this.updatevalidator.getDateFormat(data.leaveData.end_date);
      this.leaveStatus = data.leaveData.leave_status;
    } else if (data.current_status == "A") {
      this.IsInactive = true;
      this.dateTime = this.updatevalidator.getDateFormat(data.attendance_data.atten_date) + " " + data.attendance_data.signin_time
      console.log("getAbsentStatus ....")
      // this.getAbsentStatus(data.current_status);
    } else if (data.current_status == "P") {
      this.IsInactive = true;
      this.geoLocationData = data.attendance_data.place;
      this.dateTime = this.updatevalidator.getDateFormat(data.attendance_data.atten_date) + " " + data.attendance_data.signin_time
      if (data.attendance_data.signout_date) {
        this.timeOutTime = this.updatevalidator.getDateFormat(data.attendance_data.signout_date) + " " + data.attendance_data.signout_time;
        this.timeOutGeoLocation = data.attendance_data.signout_loc;
      }
      console.log("getAbsentStatus commented ....")
      this.getPunchedInstatus(data.current_status);
    } else if (data.current_status == "X") {
      this.IsInactive = true;
    }
  }

  isDesktopMode(): boolean {
    let isDesktop: boolean = false;
    console.log("Access through Web: "+ this.deviceInfo.platform);
    // return true if its now android or ios
    if(this.deviceInfo.platform === 'android' || this.deviceInfo.platform === 'ios'){
      isDesktop = false
    }
    if(this.deviceInfo.platform === 'web'){
      isDesktop = true;
    }
    return isDesktop;
  }

  async getDeviceInfo() {
    console.log("Getting device info ....................................");
    this.deviceInfo = await Device.getInfo();
    console.log("Device info:................." + this.deviceInfo);
    console.log("Device info:................. platform: " + this.deviceInfo.platform);
    console.log("Device info:................. operatingSystem: " + this.deviceInfo.operatingSystem);
  }

  timeOut() {
    this.Time = this.updatevalidator.getCurrent_Time();
    this.date = this.updatevalidator.getCurrentDate();
    if (this.isDesktopMode()) {
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        let attendanceParamters: any = {
          id: this.attendenceId,
          org_id: window.localStorage.getItem('org_id'),
          userId: window.localStorage.getItem('userid'),
          location: {latitude: "", longitude: "", address: ""}
        }
        this.timeOutServiceCall(attendanceParamters);
      }
    } else {
      this.updatevalidator.getOpenLocationservice();
      console.log("Get the geolocation ....")
      // this.events.subscribe('GeolocationData', (GeoData) => {
      //   if (GeoData != null || GeoData != undefined) {
      //
      //     let startGeolocation = this.getGeolocationAddress(GeoData);
      //     this.latitude = GeoData.latitude,
      //       this.longitude = GeoData.longitude
      //     if (this.connected) {
      //       this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      //     } else {
      //       let attendanceParamters: any = {
      //         id: this.attendenceId,
      //         org_id: window.localStorage.getItem('org_id'),
      //         userId: window.localStorage.getItem('userid'),
      //         location: {latitude: this.latitude, longitude: this.longitude, address: startGeolocation}
      //       }
      //       this.timeOutServiceCall(attendanceParamters);
      //     }
      //   } else {
      //     this.updatevalidator.getOpenLocationservice();
      //   }
      // });
    }
    // this.timeOutServiceCall("sector 15, part 1 gurgaon");
  }

  getGeolocationAddress(GeoData) {
    let geoAddress: any = "";
    if (GeoData.subThoroughfare != "") {
      geoAddress = GeoData.subThoroughfare;
    }

    if (GeoData.thoroughfare != "" && geoAddress != "") {
      geoAddress = geoAddress + ", " + GeoData.thoroughfare;
    } else if (GeoData.thoroughfare != "") {
      geoAddress = geoAddress + GeoData.thoroughfare;
    }

    if (GeoData.subLocality != "" && geoAddress != "") {
      geoAddress = geoAddress + ", " + GeoData.subLocality;
    } else if (GeoData.subLocality != "") {
      geoAddress = geoAddress + GeoData.subLocality;

    }


    if (GeoData.locality != "" && geoAddress != "") {
      geoAddress = geoAddress + ", " + GeoData.locality;
    } else if (GeoData.locality != "") {
      geoAddress = geoAddress + GeoData.locality;
    }


    if (GeoData.subAdministrativeArea != "" && geoAddress != "") {
      geoAddress = geoAddress + ", " + GeoData.subAdministrativeArea
    } else if (GeoData.subAdministrativeArea != "") {
      geoAddress = geoAddress + GeoData.subAdministrativeArea;
    }


    if (GeoData.administrativeArea != "" && geoAddress != "") {
      geoAddress = geoAddress + ", " + GeoData.administrativeArea
    } else if (GeoData.administrativeArea != "") {
      geoAddress = geoAddress + GeoData.administrativeArea;
    }


    if (GeoData.postalCode != "" && geoAddress != "") {
      geoAddress = geoAddress + "-" + GeoData.postalCode;
    } else if (GeoData.postalCode != "") {
      geoAddress = geoAddress + GeoData.postalCode;
    }

    return geoAddress;
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
    //
    // });
  }

  async timeOutServiceCall(attendanceParamters) {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      console.log(attendanceParamters);
      this.attendanceServiceSuccess = this.apiProvider.postauthService('attendanceApi/timeout', attendanceParamters, 'POST')
      this.attendanceServiceSuccess.subscribe(timeOutResult => {
          console.log("TimeOutResult:" + JSON.stringify(timeOutResult));
          if (timeOutResult.status == 1) {
            // this.geoLocationData = startGeolocation
            // this.dateTime = this.updatevalidator.getDateFormat(timeOutResult.data.atten_date) + " " + timeOutResult.data.signin_time;
            // this.getPunchedInstatus(timeOutResult.data.attendance_status);
            this.updatevalidator.showToast(timeOutResult.message.message);
            loader.dismiss();
            this.getCurrentInitialStatus();
          } else if (timeOutResult.status == 0) {
            this.isPresentEnable = false; // fortest;
            this.updatevalidator.showToast(timeOutResult.message.message)
            loader.dismiss();
          }
        }, (err) => {
          this.isPresentEnable = false; // fortest;
          this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        }
      )
      //loader.dismiss();
    });
  }

  PunchedAttendance(status) {
    console.log("mark the present ....")
    this.isPresentEnable = true; // fortest;
    console.log("status", status);
    if (status == 'O') {
      this.Hstatus = 'checked'
      this.punchedIn('O');
    } else if (status == 'P') {
      this.punchedIn('P');
    }
  }

  applyAbsent() {
    this.Time = this.updatevalidator.getCurrent_Time();
    this.date = this.updatevalidator.getCurrentDate();
    this.isAbsentEnable = true; // fortest;
    this.absentServiceCall();
  }

  async ngOnInit() {
    // API calls
    console.log("attendance Api calls on ngOnIt....")
    this.getCurrentInitialStatus();
    this.getcurrentAttendanceStatus();
  }

  async checkNetworkStatus() {
    this.networkListner = await Network.addListener('networkStatusChange', status => {
      console.log("Inside network check")
      console.log('Network status changed', status);
      this.ngZone.run(() => {
        this.changeStatus(status);
      })
    });
    const status = await Network.getStatus();
    this.changeStatus(status);
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  punchedIn(punchStatus) {
    console.log("Start ....")
    this.Time = this.updatevalidator.getCurrent_Time();
    this.date = this.updatevalidator.getCurrentDate();
    if (this.isDesktopMode()) {
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      }
      else {
        if (punchStatus == 'P') {
          console.log("Present .......................");
          let attendanceParamters = {
            org_id: window.localStorage.getItem('org_id'),
            userId: window.localStorage.getItem('userid'),
            emp_name: window.localStorage.getItem('user_name'),
            status: 'P',
            Amode: 'M',
            location: { latitude: "", longitude: "", address: "" },
            date: this.date,
            time: this.Time
          }
          this.punchedInserviceCall(attendanceParamters, "startGeolocation");
        } else if (punchStatus == 'O') {
          let attendanceParamters: any = {
            org_id: window.localStorage.getItem('org_id'),
            userId: window.localStorage.getItem('userid'),
            emp_name: window.localStorage.getItem('user_name'),
            status: 'O',
            Amode: 'M',
            location: { latitude: "", longitude: "", address: "" },
            date: this.date,
            time: this.Time
          }
          console.log("holiday");
          this.punchedInHolidayserviceCall(attendanceParamters, "startGeolocation");
        }
      }
    } else {
      // if the device is not a Desktop
      // It is a mobile device
      this.updatevalidator.getOpenLocationservice();
      // this.events.subscribe('GeolocationData', (GeoData) => {
      this._geolocation.geolocation.subscribe((GeoData) => {
        if (GeoData != null || GeoData != undefined) {
          // let startGeolocation = GeoData.subLocality + "," + GeoData.locality;
          // let startGeolocation = GeoData.subThoroughfare + "," + GeoData.thoroughfare + "," + GeoData.subLocality + "," +
          //                       GeoData.locality + "," + GeoData.subAdministrativeArea + "," + GeoData.administrativeArea + "-" + GeoData.postalCode;

          let startGeolocation = this.getGeolocationAddress(GeoData);
          console.log("Geo Data ...................", GeoData)
          debugger;
          // Need to add the code here for geolocation
          // this.latitude = GeoData.latitude,
          //   this.longitude = GeoData.longitude
          // The
          if (this.connected === false) {
            this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
          }
          else {
            if (punchStatus == 'P') {
              console.log("Present");
              let attendanceParamters = {
                org_id: window.localStorage.getItem('org_id'),
                userId: window.localStorage.getItem('userid'),
                emp_name: window.localStorage.getItem('user_name'),
                status: 'P',
                Amode: 'M',
                location: { latitude: this.latitude, longitude: this.longitude, address: startGeolocation },
                date: this.date,
                time: this.Time
              }
              this.punchedInserviceCall(attendanceParamters, startGeolocation);
            } else if (punchStatus == 'O') {
              let attendanceParamters: any = {
                org_id: window.localStorage.getItem('org_id'),
                userId: window.localStorage.getItem('userid'),
                emp_name: window.localStorage.getItem('user_name'),
                status: 'O',
                Amode: 'M',
                location: { latitude: this.latitude, longitude: this.longitude, address: startGeolocation },
                date: this.date,
                time: this.Time
              }
              console.log("holiday");
              this.punchedInHolidayserviceCall(attendanceParamters, startGeolocation);
            }
          }
        }
        else {
          this.updatevalidator.getOpenLocationservice();
        }
      });
    }
  }

  async punchedInHolidayserviceCall(attendanceParamters, startGeolocation) {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {

      console.log(attendanceParamters);
      this.attendanceServiceSuccess = this.apiProvider.postauthService('attendanceApi/attendance', attendanceParamters, 'POST')
      this.attendanceServiceSuccess.subscribe(attendanceResult => {
          console.log("AttendanceResult:" + JSON.stringify(attendanceResult));
          if (attendanceResult.status == 1) {
            this.dateTime = this.updatevalidator.getDateFormat(attendanceResult.data.atten_date) + " " + attendanceResult.data.signin_time;
            if (!this.isDesktopMode) {
              this.geoLocationData = startGeolocation
            }
            this.holidayStatus = false;
            this.getPunchedInstatus(attendanceResult.data.attendance_status);
            //  this.updatevalidator.showToast(attendanceResult.message.message)
            loader.dismiss();
          } else if (attendanceResult.status == 0) {
            this.isPresentEnable = false; // fortest;
            this.updatevalidator.showToast(attendanceResult.message.message);
            loader.dismiss();
          }
        },
        (err) => {
          this.isPresentEnable = false; // fortest;
          this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        })
      // loader.dismiss();
    })
  }
  async punchedInserviceCall(attendanceParamters, startGeolocation) {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {

      console.log(attendanceParamters);
      this.attendanceServiceSuccess = this.apiProvider.postauthService('attendanceApi/attendance', attendanceParamters, 'POST')
      this.attendanceServiceSuccess.subscribe(attendanceResult => {
          console.log("AttendanceResult:" + JSON.stringify(attendanceResult));
          if (attendanceResult.status == 1) {
            if (!this.isDesktopMode) {
              this.geoLocationData = startGeolocation
            }

            this.dateTime = this.updatevalidator.getDateFormat(attendanceResult.data.atten_date) + " " + attendanceResult.data.signin_time;
            this.getPunchedInstatus(attendanceResult.data.attendance_status);
            this.getCurrentInitialStatus();
            // this.updatevalidator.showToast(attendanceResult.message.message)
            loader.dismiss();
          } else if (attendanceResult.status == 0) {
            this.isPresentEnable = false; // fortest;
            this.updatevalidator.showToast(attendanceResult.message.message)
            loader.dismiss();
          }
        }, (err) => {
          this.isPresentEnable = false; // fortest;
          this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        }
      )
      //loader.dismiss();
    });
  }
  async absentServiceCall() {
    console.log("Attendance service call ....")
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      let attendanceParamters: any = {
        org_id: window.localStorage.getItem('org_id'),
        userId: window.localStorage.getItem('userid'),
        emp_name: window.localStorage.getItem('user_name'),
        status: 'A',
        Amode: 'M',
        location: null,
        date: this.date,
        time: this.Time
      }
      console.log("attendanceParamters : " + attendanceParamters);
      this.attendanceServiceSuccess = this.apiProvider.postauthService('attendanceApi/attendance', attendanceParamters, 'POST')
      this.attendanceServiceSuccess.subscribe(attendanceResult => {
        console.log("AttendanceResult:" + JSON.stringify(attendanceResult));
        if (attendanceResult.status == 1) {
          this.dateTime = this.updatevalidator.getDateFormat(attendanceResult.data.atten_date) + " " + attendanceResult.data.signin_time;
          console.log("getAbsentStatus commented ...");
          this.getAbsentStatus(attendanceResult.data.attendance_status);
          loader.dismiss();
        } else if (attendanceResult.status == 0) {
          this.isAbsentEnable = false; // fortest;
          this.updatevalidator.showToast(attendanceResult.message.message)
          loader.dismiss();
        }

      }, (err) => {
        this.isAbsentEnable = false; // fortest;
        this.updatevalidator.showAlert("Server Error", "Please try again!!");
        loader.dismiss();
      })
      //loader.dismiss();
    })
  }

  getAbsentStatus(status) {
    this.isShowAddress = false;
    this.status = status;
    this.btnImg = "visit2.png";
    this.btnclass = "absent";
    this.btnclassdeactive = "deactive";
    this.message = "Your attendance is marked absent.";
    this.isPresent = true;
    this.isAbsent = true;
    this.currentStatusValue = "A";
    this.currentStatus = "absent";
    this.activeStatusCSS = "active";
    this.IsInactive = true;
    this.holidayStatus = false
    this.IsOnLeave = false
  }

  getPunchedInstatus(status) {
    this.status = status;
    this.btnclass = "present";
    this.btnImg = "visit1.png";
    this.btnclassdeactive = "deactive";
    this.isShowAddress = true;
    this.isPresent = true;
    this.isAbsent = true;
    this.message = "You have marked your attendance."
    this.currentStatusValue = "P";
    this.currentStatus = "present";
    this.activeStatusCSS = "active";
    this.IsInactive = true;
    this.holidayStatus = false
    this.IsOnLeave = false;
  }
  applyLeave() {
    this.navCtrl.navigateForward('ApplyLeavePage');
  }
}

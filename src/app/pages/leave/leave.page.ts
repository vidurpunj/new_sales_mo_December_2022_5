import {Component, NgZone, OnInit} from '@angular/core';
import {LoadingController, ModalController, NavController} from "@ionic/angular";
import {Network} from "@capacitor/network";
import {PluginListenerHandle} from "@capacitor/core";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {CalendarPage} from "../calendar/calendar.page";
import {DesignUtilityService} from "../../services/design-utility.service";
import {ApiService} from "../../services/api/api.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-leave',
  templateUrl: './leave.page.html',
  styleUrls: ['./leave.page.scss'],
})
export class LeavePage implements OnInit {
  connected: boolean | undefined;
  isAdmin: boolean = false;
  networkListner: PluginListenerHandle | undefined;
  connectionType: string = 'none';
  currentStatus: any;
  isAttendance: boolean = false;
  currentStatusValue: any;
  toDate: any = "";
  fromDate: any = "";
  getLeaveParameters: any;
  calendarInfo: any;
  leaveStatusServiceSuccess: Observable<any> | undefined;
  IsDataFound: any;
  isDataAvailable: boolean = false;
  getLeaveStatusDataList: any[] | undefined;
  selectedFromDate: string = '';
  selectedToDate: string = '';
  showSelectedDates: boolean = false;

  constructor(
    public navCtrl: NavController,
    private ngZone: NgZone,
    private updatevalidator: UpdateValidatorService,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private _designUtils: DesignUtilityService,
    private apiProvider: ApiService
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

    if (window.localStorage.getItem('user_Role') == "ADMIN") {
      this.isAdmin = true;
      this.getLeaveStatusServiceCall();
    } else if (window.localStorage.getItem('user_Role') == "EMPLOYEE") {
      this.getcurrentAttendanceStatus();
      this.getLeaveStatusServiceCall();
    }
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  ngOnInit() {
  }

  getcurrentAttendanceStatus() {
    if (window.localStorage.getItem('currentAttendanceStatus') == "P") {
      this.currentStatusValue = "P";
      this.currentStatus = "present";
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "A") {
      this.currentStatusValue = "A";
      this.currentStatus = "absent";
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "L") {
      this.currentStatusValue = "L";
      this.currentStatus = "absent";
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "H") {
      this.currentStatusValue = "H";
      this.currentStatus = "present";
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "W") {
      this.currentStatusValue = "W";
      this.currentStatus = "present";
    } else if (window.localStorage.getItem('currentAttendanceStatus') == "X") {
      this.isAttendance = true;
      this.currentStatusValue = "Attendance";
    }
  }

  async openCalendar() {
    let myCalendar = await this.modalCtrl.create({
      component: CalendarPage,
      breakpoints: [0, 0.3, 0.5, 0.8],
      initialBreakpoint: 0.5,
      componentProps: {
        minDate: new Date().setMonth(new Date().getMonth() - 120),
        toDate: new Date().setMonth(new Date().getMonth() + 12),
        dateMode: 'range'
      },
    });
    myCalendar.present();
    this._designUtils.myCalendar.subscribe((response) => {
      console.log("subscribe calendar .....");
      console.log(response);
      this.calendarInfo = response;
      myCalendar.dismiss();
      myCalendar.onDidDismiss().then((date) => {
        console.log(".... onDidDismiss selectedDate", date);
        date = this.calendarInfo;
        console.log("inside Calender date from and to ....")
        // if ((this.updatevalidator.date_diff_indays(this.updatevalidator.getAltDateFormat(date.from), this.updatevalidator.getAltDateFormat(date.to)) < 61)) {
        //   this.toDate = this.updatevalidator.getAltDateFormat(date.to);
        //   this.fromDate = this.updatevalidator.getAltDateFormat(date.from);
        // } else {
        //   this.updatevalidator.showAlert("Exceeded", "Range of 60 days can be selected")
        // }
      })
    });
  }

  async getLeaveStatusServiceCall() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      if (this.isAdmin) {
        this.getLeaveParameters = {
          org_id: window.localStorage.getItem('org_id'),
          userId: "",
          fromdate: this.fromDate,
          todate: this.toDate
        }
      } else {
        this.getLeaveParameters = {
          org_id: window.localStorage.getItem('org_id'),
          userId: window.localStorage.getItem('userid'),
          fromdate: this.fromDate,
          todate: this.toDate
        }
      }
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
        loader.dismiss();
      } else {
        console.log(this.getLeaveParameters);
        //this.leaveStatusServiceSuccess=this.apiProvider.getAuthService('attendanceApi/allLeaves/'+window.localStorage.getItem('userid'),'GET')
        //this.leaveStatusServiceSuccess = this.apiProvider.postauthService('attendanceApi/allLeavesbyDate/',this.getLeaveParameters, 'POST')
        if (this.isAdmin)
          this.leaveStatusServiceSuccess = this.apiProvider.postauthService('attendanceApi/allLeavesbyDate/' + window.localStorage.getItem('userid'), this.getLeaveParameters, 'POST')
        else
          this.leaveStatusServiceSuccess = this.apiProvider.postauthService('attendanceApi/allLeavesbyDate/', this.getLeaveParameters, 'POST')
        this.leaveStatusServiceSuccess.subscribe(result => {
          console.log("leaveStatusData:" + JSON.stringify(result));
          if (result.status == 1) {
            this.IsDataFound = " ";
            this.isDataAvailable = true;
            this.getLeaveStatusDataList = result.data;
            // this.getLeaveStatusDataList.reverse();
            let adminGetLeaveStatusDataList: any[] = [];
            if (this.isAdmin) {
              console.log("Ts ignore")
              // @ts-ignore
              this.getLeaveStatusDataList.forEach(element => {
                if (element.leave_status != "pending") {
                  adminGetLeaveStatusDataList.push(element);
                }
              });
              this.getLeaveStatusDataList = adminGetLeaveStatusDataList;
            }
            // this.updatevalidator.showToast(result.message.message);
            loader.dismiss();
          } else if (result.status == 0) {
            this.isDataAvailable = false;
            this.IsDataFound = "Data not found! ";
            // this.updatevalidator.showToast(result.message.message);
            loader.dismiss()
          }
        })
      }
    });
    loader.dismiss();
  }

  goToHome() {
    if (this.isAdmin) {
      this.navCtrl.navigateRoot('AdminDashboardPage');
    } else {
      this.navCtrl.navigateRoot('HomePage');
    }
  }

  goToAttendance() {
    this.navCtrl.navigateRoot('AttendancePage');
  }

  filterVisit() {
    console.log('fromdate: ' + this.fromDate + ', todate: ' + this.toDate);
    this.selectedFromDate = this.updatevalidator.getMonthDateFormat(this.fromDate);
    this.selectedToDate = this.updatevalidator.getMonthDateFormat(this.toDate);
    this.isDataAvailable = false;
    let tempDatahold: any[] = [];
    this.getLeaveStatusDataList = tempDatahold;
    this.getLeaveStatusServiceCall();
    this.showSelectedDates = true;

  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.getLeaveStatusServiceCall();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }

  applyforleave() {
    this.navCtrl.navigateForward('ApplyLeavePage');
  }
}

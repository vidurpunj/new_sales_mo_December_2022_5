import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {LoadingController, ModalController, NavController} from "@ionic/angular";
import {CalendarPage} from "../calendar/calendar.page";
import {CalendarResult} from "ion2-calendar";
import {DesignUtilityService} from "../../services/design-utility.service";
import {Observable, Subscription} from "rxjs";
import {ApiService} from "../../services/api/api.service";


@Component({
  selector: 'app-apply-leave-page',
  templateUrl: './apply-leave-page.page.html',
  styleUrls: ['./apply-leave-page.page.scss'],
})
export class ApplyLeavePagePage implements OnInit {
  myDate: string | undefined;
  fromDate: any;
  toDate: any;
  date: Date = new Date();
  altDate: Date = new Date();
  secondDate: string = "";
  leaveTypesDataList: any[] = [];
  leave: FormGroup;
  calendarInfo: any;
  leaveTypesServiceSuccess: Observable<any> | undefined;
  applyleaveServiceSuccess: Observable<any> | undefined;
  isSubmit: boolean = false;
  leaveParamters: any;
  // myCalendarObs: Subscription;
  constructor(
    public formBuilder: FormBuilder,
    private apiProvider: ApiService,
    private updatevalidator: UpdateValidatorService,
    private modalCtrl: ModalController,
    private _designUtils: DesignUtilityService,
    private loadingCtrl: LoadingController,
    public navCtrl: NavController

  ) {
    this.leaveTypes();
    this.leave = this.formBuilder.group({
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      leaveType: new FormControl('', [Validators.required]),
      description: new FormControl()
    });

  }

  ngOnDestroy() {
  }

  ngOnInit() {
    this.myDate = this.updatevalidator.getMonthDateFormat(this.date)
    this.fromDate = this.updatevalidator.getAltDateFormat(this.altDate);
    this.leave.controls['fromDate'].setValue(this.fromDate);
  }

  async leaveTypes() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.leaveTypesServiceSuccess = this.apiProvider.getAuthService('attendanceApi/leavetypes/' + window.localStorage.getItem('org_id'), 'GET')
      console.log('Hi ....');
      this.leaveTypesServiceSuccess.subscribe((leaveTypesResult) => {
        console.log('BY ....');
        console.log("leaveTypesResult:" + JSON.stringify(leaveTypesResult));
        if (leaveTypesResult.status == 1) {
          // this.updatevalidator.showToast(leaveTypesResult.message.message)
          this.leaveTypesDataList = leaveTypesResult.data.leavetypes;
          loader.dismiss();
        } else {
          this.isSubmit = false;
          this.updatevalidator.showToast(leaveTypesResult.message.message);
          loader.dismiss();
        }

      }, (err) => {
        this.isSubmit = false;
        // this.updatevalidator.showAlert("Server Error", "Cannot get expense days limit, Please try again after sometime");
        this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
        loader.dismiss();
      });
    })

  }

  async fromDateOpenCalender() {
    let from: Date = new Date();
    let myCalendar = await this.modalCtrl.create({
      component: CalendarPage,
      breakpoints: [0, 0.3, 0.5, 0.8],
      initialBreakpoint: 0.5,
      componentProps: {
        minDate: new Date().setMonth(new Date().getMonth() - 1),
        toDate: new Date().setMonth(new Date().getMonth() + 36),
        dateMode: 'single'
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
        if (date) {
          console.log(date);
          this.leave.controls['fromDate'].setValue(this.updatevalidator.getAltDateFormat(date));
          this.leave.controls['toDate'].setValue('');
          this.toDate = '';
          this.secondDate = '';
          this.fromDate = this.updatevalidator.getAltDateFormat(date);
          this.myDate = this.updatevalidator.getMonthDateFormat(this.updatevalidator.getAltDateFormat(date))
        }
      })
    })
  }

  async toDateOpenCalender() {
    let myCalendar = await this.modalCtrl.create({
      component: CalendarPage,
      breakpoints: [0, 0.3, 0.5, 0.8],
      initialBreakpoint: 0.5,
      componentProps: {
        minDate: new Date().setMonth(new Date().getMonth() - 1),
        toDate: new Date().setMonth(new Date().getMonth() + 36),
        dateMode: 'single'
      },
    });
    myCalendar.present();
    this._designUtils.myCalendar.subscribe((response) => {
      console.log("subscribe calendar .....");
      console.log(response);
      this.calendarInfo = response;
      myCalendar.dismiss(); // when we call dismiss on didDidDismiss will get called
      myCalendar.onDidDismiss().then((date) => {
        console.log("selectedDate .... ", date);
        date = response;
        if (date) {
          this.leave.controls['toDate'].setValue(this.updatevalidator.getAltDateFormat(date));
          this.toDate = this.updatevalidator.getAltDateFormat(date)
          this.secondDate = this.updatevalidator.getMonthDateFormat(this.updatevalidator.getAltDateFormat(date))
        }
      })
    })
  }

  async applyLeave(leaveData) {
    this.isSubmit = true;
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.leaveParamters = {
        org_id: window.localStorage.getItem('org_id'),
        userId: window.localStorage.getItem('userid'),
        emp_name: window.localStorage.getItem('user_name'),
        fromDate: leaveData.value.fromDate,
        toDate: leaveData.value.toDate,
        leaveType: leaveData.value.leaveType,
        description: leaveData.value.description
      }
      console.log(JSON.stringify(this.leaveParamters));

      this.applyleaveServiceSuccess = this.apiProvider.postauthService('attendanceApi/leave', this.leaveParamters, 'POST')
      this.applyleaveServiceSuccess.subscribe(applyleaveResult => {
        console.log("applyleaveResult", JSON.stringify(applyleaveResult));
        if (applyleaveResult.status == 1) {
          this.updatevalidator.showToast(applyleaveResult.message.message)
          this.navCtrl.navigateRoot('LeavePage');
          loader.dismiss();
        } else {
          this.isSubmit = false;
          this.updatevalidator.showToast(applyleaveResult.message.message)
          loader.dismiss();
        }
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again after sometime!!");
        loader.dismiss();
      })
      //loader.dismiss();
    })
  }
}

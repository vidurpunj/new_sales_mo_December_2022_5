import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {ModalController} from "@ionic/angular";
import {CalendarPage} from "../calendar/calendar.page";
import {CalendarResult} from "ion2-calendar";
import {DesignUtilityService} from "../../services/design-utility.service";
import {Subscription} from "rxjs";


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

  // myCalendarObs: Subscription;
  constructor(
    public formBuilder: FormBuilder,
    private updatevalidator: UpdateValidatorService,
    private modalCtrl: ModalController,
    private _designUtils: DesignUtilityService
  ) {
    this.leave = this.formBuilder.group({
      fromDate: new FormControl('', [Validators.required]),
      toDate: new FormControl('', [Validators.required]),
      leaveType: new FormControl('', [Validators.required]),
      description: new FormControl()
    });
    // this._designUtils.myCalendar.subscribe((response) => {
    //   console.log("subscribe calendar .....");
    //   console.log(response);
    //   this.calendarInfo = response;
    //   // this.myCalendar.dismiss();
    // })
  }

  ngOnDestroy() {
    // this.myCalendarObs.unsubscribe();
  }

  ngOnInit() {
    this.myDate = this.updatevalidator.getMonthDateFormat(this.date)
    this.fromDate = this.updatevalidator.getAltDateFormat(this.altDate);
    // this.leave.get('fromDate').setValue(this.fromDate);
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
}

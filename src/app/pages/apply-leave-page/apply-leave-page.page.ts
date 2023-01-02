import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {ModalController} from "@ionic/angular";
import {CalendarPage} from "../calendar/calendar.page";


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

  constructor(
    public formBuilder: FormBuilder,
    private updatevalidator: UpdateValidatorService,
    private modalCtrl: ModalController
  ) {
  }


  ngOnInit() {
    // leave = this.formBuilder.group({
    //   fromDate: new FormControl(this.fromDate, [Validators.required]),
    //   toDate: new FormControl('', [Validators.required]),
    //   leaveType: new FormControl('', [Validators.required]),
    //   description: new FormControl()
    // });
    this.myDate = this.updatevalidator.getMonthDateFormat(this.date)
    this.fromDate = this.updatevalidator.getAltDateFormat(this.altDate);
    // this.leave.get('fromDate').setValue(this.fromDate);
  }

  leave = this.formBuilder.group({
    fromDate: new FormControl('', [Validators.required]),
    toDate: new FormControl('', [Validators.required]),
    leaveType: new FormControl('', [Validators.required]),
    description: new FormControl()
  });

  async fromDateOpenCalender() {
    console.log("called from date in calender.......");
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
    // let myCalendar = this.modalCtrl.create(CalendarPage, {
    //     minDate: new Date().setMonth(new Date().getMonth() - 1),
    //     toDate: new Date().setMonth(new Date().getMonth() + 36)
    //   }
    // );

    myCalendar.present();
    // myCalendar.onDidDismiss((date) => {
    //   console.log("selectedDate", date);
    //   if (date) {
    //     this.leave.get('fromDate').setValue(this.updatevalidator.getAltDateFormat(date));
    //     this.leave.get('toDate').setValue('');
    //     this.toDate = '';
    //     this.secondDate = '';
    //     this.fromDate = this.updatevalidator.getAltDateFormat(date);
    //     this.myDate = this.updatevalidator.getMonthDateFormat(this.updatevalidator.getAltDateFormat(date))
    //
    //   }
    // })
  }

  toDateOpenCalender() {
    // let myCalendar = this.modalCtrl.create('CalendarPage', { minDate: new Date(this.updatevalidator.getFullMonthDateFormat(this.fromDate)).toISOString(), toDate: new Date().setMonth(new Date().getMonth() + 36), dateMode: 'single' });
    // myCalendar.present();
    // myCalendar.onDidDismiss((date) => {
    //   console.log("selectedDate", date);
    //   if (date) {
    //     this.leave.get('toDate').setValue(this.updatevalidator.getAltDateFormat(date));
    //     this.toDate = this.updatevalidator.getAltDateFormat(date)
    //     this.secondDate = this.updatevalidator.getMonthDateFormat(this.updatevalidator.getAltDateFormat(date))
    //   }
    // })
  }

}

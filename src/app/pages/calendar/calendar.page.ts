import {Component, OnInit} from '@angular/core';
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {CalendarComponentOptions, CalendarModule} from "ion2-calendar";
import {NavParams} from "@ionic/angular";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {

  date: string | any;
  type: 'string' | any;

  dateRange: {
    from: string,
    to: string,
    showAdjacentMonthDay: true
  } | any;
  optionsRange: CalendarComponentOptions = {
    pickMode: this.navParams.get('dateMode'),
    showMonthPicker: true,
    showToggleButtons: true,
    from: this.navParams.get('minDate'),
    to: this.navParams.get('toDate'),
  };
  modal: any;

  constructor(
    private updatevalidator: UpdateValidatorService,
    public navParams: NavParams,
    // private viewCtrl: ViewController
    // private viewCtrl: ViewController
  ) {
    console.log('dateMode', this.navParams.get('dateMode'))
    console.log('minDate', this.navParams.get('minDate'))
    console.log('minDate', this.navParams.get('toDate'))
  }

  onChange($event) {
    console.log($event);
  }

  changeCalender(event, dateRange) {
    console.log(event, dateRange);
  }

  ngOnInit() {
  }

  dismiss() {
    // modal.dismiss()
  }

  SaveCalenderInfo(data) {
    console.log("data--", data, "--", this.updatevalidator.getDateFormat(data));
    // this.viewCtrl.dismiss(data);
    // this.viewCtrl.dismiss(data);
  }
}

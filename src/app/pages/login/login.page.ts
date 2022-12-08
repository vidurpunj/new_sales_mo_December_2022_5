import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController, MenuController, NavController, Platform} from "@ionic/angular";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {Observable, Subject} from "rxjs";
import {LoginResponseStatus} from "../utils/LogicResponseStatus";
import {ApiService} from "../../services/api/api.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import * as Events from "events";
import {PermissionConstants} from "../permission/PermissionConstants";
import {PermissionRequest} from "../permission/PermissionRequest";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  deviceId: string = "";
  deviceInfoObj: any = {};

  constructor(public formBuilder: FormBuilder,
              private loadingCtrl: LoadingController,
              private updatevalidator: UpdateValidatorService,
              private apiProvider: ApiService,
              private sharedData: SharedDataService
  ) {
  }

  user = this.formBuilder.group({
    'username': new FormControl('', [Validators.required, Validators.pattern("[1-9][0-9]{9}")]),
    'password': new FormControl('', [Validators.required])
  });

  get username() {
    return this.user.get('username');
  }

  get password() {
    return this.user.get('password');
  }

  networkType: any;

  forgotPassword() {

  }

  loginInfoParams: any = {};

  login(userData) {
    // console.log("userData", userData, userData.value.username.toLowerCase());
    console.log("Form userData", userData, "phone number: ", userData.value.username);
    // this.loginInfoParams = userData;
    // // window.localStorage.clear();
    // let loader = this.loadingCtrl.create({
    //   cssClass: 'activity-detail-loading',
    //   spinner: "dots",
    //   duration: 4000
    // }).then((response) => {
    //   response.present().then(() => {
    //     if (this.networkType === 'offline') {
    //       this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
    //     } else {
    //       console.log("Reached login call")
    //       // this.userLoginServiceCall(userData);
    //       // this.loginServiceCall(userData);
    //     }
    //   });
    // });
  }

  ngOnInit() {

  }

}

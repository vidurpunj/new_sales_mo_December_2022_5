import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController, MenuController, NavController, Platform} from "@ionic/angular";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {Observable, Subject} from "rxjs";
import {LoginResponseStatus} from "../utils/LogicResponseStatus";
import {ApiService} from "../../services/api/api.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Storage} from "@ionic/storage";
import { Subscription } from "rxjs";
import { Network } from '@ionic-native/network/ngx';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  deviceId: string = "";
  deviceInfoObj: any = {};

  private connected: Subscription[] = [];
  private disconnected: Subscription[] = [];
  networkType: any;

  constructor(public formBuilder: FormBuilder,
              private loadingCtrl: LoadingController,
              private updatevalidator: UpdateValidatorService,
              private apiProvider: ApiService,
              private sharedData: SharedDataService,
              private storage: Storage,
              private network: Network
  ) {
    this.checkNetwork();
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

  forgotPassword() {
    console.log("Forget password")
  }

  loginInfoParams: any = {};

  login(userData) {
    console.log("phone number: ", userData.value.username);
    console.log("Password: ", userData.value.password);
    this.loginInfoParams = userData;

    let loader = this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    }).then((response) => {
      response.present().then(() => {
        debugger;
        if (this.networkType === 'offline') {
          this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
        } else {
          console.log("call loginServiceCall");
          this.loginServiceCall(userData);
        }
        response.dismiss();
      });
    });

  }

  loginServiceCall(userData) {
    if (userData.value.username == "9999999991") {
      this.testtingCredentials();
    } else {
      let loginParameters = {
        "loginUserName": userData.value.username,
        "password": userData.value.password,
        "deviceId": this.deviceId
      };
      console.log("loginParameters:", loginParameters);
      let loader = this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      }).then((response) => {
        response.present().then(() => {
          if (this.networkType === 'offline') {
            this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
          } else {
            // this.userLoginServiceCall(userData);
            this.loginServiceCall(userData);
          }
          response.dismiss();
        });
      });
    }
  }

  testtingCredentials() {
    window.localStorage.setItem('user_phone', '8882189731')
    window.localStorage.setItem('sidebarPoPermission', "true"),
      window.localStorage.setItem('sidebarLeaveViewPermission', 'true')
    window.localStorage.setItem("sidebarLeaveViewPermission", 'true')
    window.localStorage.setItem('userid', "3363")
    window.localStorage.setItem('orgName', "Prabhat Fertilizers and Chemical Works")
    window.localStorage.setItem('sidebarPoViewPermission', "true");
    window.localStorage.setItem('user_email', 'rahul@spadeinfotech.net')
    window.localStorage.setItem('org_id', '1007');
    window.localStorage.setItem('user_Role', 'EMPLOYEE')
    let phpAuthCallParameters = {
      emp_id: window.localStorage.getItem('userid'),
      org_id: window.localStorage.getItem('org_id'),
      device_id: this.deviceId
    }
    let phpAuthCall: Observable<any> = this.apiProvider.postauthService('loginApi/generateToken', phpAuthCallParameters, 'POST');
    phpAuthCall.subscribe(response => {
      if (response.status == 1) {
        window.localStorage.setItem('token', response.data.token);
        console.log("token generated -> ", window.localStorage.getItem('token'));
        console.log("deviceId -> ", window.localStorage.getItem('device_id'));
        console.log("this.deviceId -> ", this.deviceId);
        // this.getUserImage();
        // this.navCtrl.setRoot('HomePage');
        // this.navigateAsPerPermission();
      } else
        this.updatevalidator.showAlert('Warning', 'You have already logged in from another device!');
    }, () => {
      this.updatevalidator.showAlert("Error", "Php Authentication server error");
      return;
    })
  }

  ngOnInit() {
    // create empty storage
    this.storage.create();
    // On initialization populate device id
    this.storage.get('user_device_id').then((deviceId) => {
      this.deviceId = deviceId;
      console.log("user deviceId:", deviceId);
      window.localStorage.setItem('device_id', deviceId);
    })
  }

  checkNetwork() {
    this.connected = this.network.onConnect().subscribe(data => {
      this.networkType = data.type;
    }, error => console.error(error));
    this.disconnected = this.network.onDisconnect().subscribe(data => {
      this.networkType = data.type;
    }, error => console.error(error));
  }
}

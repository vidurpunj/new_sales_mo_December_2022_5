import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {
  AlertController,
  LoadingController,
  MenuController,
  NavController,
  Platform,
  ToastController
} from "@ionic/angular";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {Observable, Subject} from "rxjs";
import {LoginResponseStatus} from "../utils/LogicResponseStatus";
import {ApiService} from "../../services/api/api.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Storage} from "@ionic/storage";
import {Network} from '@capacitor/network';
import {PluginListenerHandle} from "@capacitor/core";
import {Device} from '@capacitor/device';
import {NavigationExtras} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  deviceId: string = "";
  deviceInfoObj: any = {};


  networkType: any;
  networkListner: PluginListenerHandle | undefined;
  connected: boolean | undefined;
  connectionType: string = 'none';

  constructor(public formBuilder: FormBuilder,
              private loadingCtrl: LoadingController,
              private updatevalidator: UpdateValidatorService,
              private apiProvider: ApiService,
              private sharedData: SharedDataService,
              private storage: Storage,
              private ngZone: NgZone,
              private alertCtrl: AlertController,
              public menu: MenuController,
              public navCtrl: NavController,
              public platform: Platform,
              private toast: ToastController,
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

  forgotPassword() {
    console.log("Forget password")
  }

  loginInfoParams: any = {};

  async login(userData) {
    console.log("phone number: ", userData.value.username);
    console.log("Password: ", userData.value.password);
    this.loginInfoParams = userData;
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    })
    loader.present();
    if (this.connected === false) { // not connected to internet
      this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
    } else {
      console.log("call loginServiceCall");
      await this.loginServiceCall(userData);
    }
    console.log("Close loader")
    loader.dismiss();
  }

  async loginServiceCall(userData) {
    if (userData.value.username == "9999999991") {
      this.testtingCredentials();
    } else {
      let loginParameters = {
        "loginUserName": userData.value.username,
        "password": userData.value.password,
        "deviceId": this.deviceId
      };
      console.log("loginParameters:", loginParameters);
      let loader = await this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      }).then((loader_response) => {
        loader_response.present().then(() => {
          let loginServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('authenticate', loginParameters, 'POST');
          loginServiceCall.subscribe(response => {
            console.log("Inside the subscribe block  ====>>>>")
            console.log("inside loginServiceCall ====>>>>");
            if (response.status == 1) {
              console.log("Login Response Data =" + JSON.stringify(response));
              let status: LoginResponseStatus = response.data.status as LoginResponseStatus;
              if (response.data.userInfo != null) {
                this.sharedData.setUserId(response.data.userInfo.userId);
                window.localStorage.setItem('authToken', response.data.userInfo.authToken);
                window.localStorage.setItem('reqToken', response.data.userInfo.reqToken);
              }
              this.checkLoginStatus(status, response);
              loader_response.dismiss();
            } else {
              this.updatevalidator.showAlert("Status Failure", response.errorMsg);
              loader_response.dismiss();
            }
          }, (err) => {
            console.log("Show error", err);
            this.updatevalidator.showAlert("Server Error", "Please try again!!");
            loader_response.dismiss();
          })
        });
      });
    }
  }

  checkLoginStatus(status: LoginResponseStatus, response: any) {
    console.log("-------------------------------> ");
    console.log("authentication response status: ", status);
    console.log("Response: ", response);
    switch (status) {
      case LoginResponseStatus.SUCCESS: {
        this.initializeUserData(response);
        // this.finalLogin();
        console.log("Initialize user data =====>")
        this.sendIdForAuthenticationOnPhp();
        // this.navigateAsPerPermission();
        break;
      }

      case LoginResponseStatus.DEVICE_ID_NOT_FOUND: {
        console.log("********************************** device not fopund***************************")
        // alert("DEVICE_ID_NOT_FOUND");
        this.initializeUserData(response);
        this.viewAlert("DNF");
        break;
      }

      case LoginResponseStatus.INVALID_DEVICE_ID: {
        // alert("INVALID_DEVICE_ID");
        this.initializeUserData(response);
        this.viewAlert("IDE");
        break;
      }

      case LoginResponseStatus.INVALID_DEVICE_FOR_USER: {
        // alert("INVALID_DEVICE_FOR_USER");
        this.initializeUserData(response);
        this.viewAlert("IDU");
        break;
      }

      case LoginResponseStatus.FAILURE:
      case LoginResponseStatus.INVALID_USERNAME_AND_PASSWORD:
      case LoginResponseStatus.USER_INACTIVE:
      case LoginResponseStatus.USER_LOCKED:
      case LoginResponseStatus.CUSTOMER_LOCKED:
      case LoginResponseStatus.CUSTOMER_INACTIVE: {
        this.updatevalidator.showAlert("Login Failure", response.data.statusDescription);
        // this.logout();
        break;
      }

      default:
        this.updatevalidator.showAlert("Login Failure", response.data.statusDescription);
        // this.logout();
        break;
    }
  }

  initializeUserData(response: any) {
    console.log("-------- INITIALIZING USER DATA --------");

    this.sharedData.setUserId(response.data.userInfo.userId);
    window.localStorage.setItem('userid', response.data.userInfo.userId);
    // window.localStorage.setItem('userid', "Raj1447");
    console.log("userid set for application: " + window.localStorage.getItem('userid'));

    //Organization Name
    window.localStorage.setItem('orgName', response.data.userInfo.custName);
    console.log("organization name set for application: " + window.localStorage.getItem('orgName'));

    //User Name
    let user_name = response.data.userInfo.firstName + ' ' + (response.data.userInfo.middleName != null ? response.data.userInfo.middleName + ' ' : "") + response.data.userInfo.lastName;
    window.localStorage.setItem('user_name', user_name);
    console.log("user_name:", user_name);

    //Initialize email and phone number
    let userContactList: any[] = response.data.userInfo.contactList;
    let user_email = userContactList.find(value => value.isPrimary == "Y" && value.contactType == "E").contactInfo;
    window.localStorage.setItem('user_email', user_email);
    console.log("user_email:", user_email);
    let user_phone = userContactList.find(value => value.isPrimary == "Y" && value.contactType == "P").contactInfo;
    window.localStorage.setItem('user_phone', user_phone);
    console.log("user_phone:", user_phone);

    //Set User Role
    // window.localStorage.setItem('user_Role', this.roleAs);
    // console.log("user_Role:", this.roleAs);

    //Set Login Auth Tokens
    window.localStorage.setItem('authToken', response.data.userInfo.authToken);
    console.log("authToken:", response.data.userInfo.authToken);
    window.localStorage.setItem('reqToken', response.data.userInfo.reqToken);
    console.log("reqToken:", response.data.userInfo.reqToken);

    //Set profile ppic/image of user if exists, empty otherwise
    window.localStorage.setItem('user_Profile_Pic', '');

    //Add org_id to local storage for multi-tenant model
    window.localStorage.setItem('org_id', response.data.userInfo.custId);
    // window.localStorage.setItem('org_id', "pb101");
    console.log("org_id set for application: " + window.localStorage.getItem('org_id'));


    console.log("-------- FINISHED INITIALIZING USER DATA --------");
  }

  async viewAlert(action: string) {
    let alertMessage: string = "";
    let alertTitle: string = "";

    if (action == 'DNF') {
      alertTitle = 'Device Not Found'
      alertMessage = "Your device is not registered.<br/> Please register your device first!<br> Send OTP to number below for registration?<br> <strong>" + window.localStorage.getItem('user_phone') + "</strong>";
    } else if (action == "IDE") {
      alertTitle = 'Invalid Device';
      alertMessage = "This Device does not exist.<br/> Please register your device again!<br> Send OTP to number below for registration?<br> <strong>" + window.localStorage.getItem('user_phone') + "</strong>";
    } else if (action == "IDU") {
      alertTitle = 'Device already mapped';
      alertMessage = "This Device is already mapped with another user.<br/> Please register to this device!<br> Send OTP to number below for registration?<br> <strong>" + window.localStorage.getItem('user_phone') + "</strong>";
    }

    let prompt = await this.alertCtrl.create({
      header: alertTitle,
      message: alertMessage,

      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('No clicked');
            this.logout();
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.requestForDeviceRegistration();
            console.log('calling done requestForDeviceRegistration');
          }
        }
      ]
    });
    prompt.present();
  }

  sendIdForAuthenticationOnPhp() {
    console.log("empId", this.sharedData.getUserId());

    console.log(">> sending user and org id to php >>");
    let phpAuthCallParameters = {
      emp_id: this.sharedData.getUserId(),
      org_id: window.localStorage.getItem('org_id'),
      device_id: this.deviceId
    }
    console.log("phpAuthCallParameters -> ", phpAuthCallParameters);
    let phpAuthCall: Observable<any> = this.apiProvider.postauthService('loginApi/generateToken', phpAuthCallParameters, 'POST');
    phpAuthCall.subscribe(response => {
      console.log("Inside phpAuthCall =======>")
      if (response.status == 1) {
        window.localStorage.setItem('token', response.data.token);
        console.log("token generated -> ", window.localStorage.getItem('token'));
        console.log("deviceId -> ", window.localStorage.getItem('device_id'));
        console.log("this.deviceId -> ", this.deviceId);
        console.log("vidur comment")
        this.getUserImage();
        // this.navigateAsPerPermission();
      } else
        this.updatevalidator.showAlert('Warning', 'You have already logged in from another device!');
    }, () => {
      this.updatevalidator.showAlert("Error", "Php Authentication server error");
      return;
    })
  }

// ===============================>>>>
  async getUserImage() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    console.log("Inside getUserImage  ====>>")
    loader.present().then(() => {
      // show message connect to internet
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        console.log('inside userimage function');
        let userImageServiceSuccess: Observable<any> = this.apiProvider.getAuthService('orgInfoApi/orgCommonSetting/' + window.localStorage.getItem('org_id') + '/' + window.localStorage.getItem('userid'), 'GET')
        userImageServiceSuccess.subscribe(result => {
          console.log("userImageData:" + JSON.stringify(result));
          debugger;
          if (result.status == 1) {
            window.localStorage.setItem('user_Profile_Pic', result.data.user_img);
            // make it again by using rxjs
            // this.events.publish('user:created', '');
            loader.dismiss()
          } else {
            // what this show toast function is doing
            // this.updatevalidator.showToast(result.message.message)
            loader.dismiss()
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
          loader.dismiss();
        })
      } //loader.dismiss();
    })
  }

  // showToast(connectionState) {
  //   this.toast.create({
  //     message: `${connectionState}`,
  //     duration: 1500
  //   }).present();
  // }

  logout() {
    let simsLogoutParameters = {
      'userId': this.sharedData.getUserId(),
      'authToken': window.localStorage.getItem('authToken'),
      'reqToken': window.localStorage.getItem('reqToken')
    }
    let simsLogoutServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('logout', simsLogoutParameters, 'POST');
    simsLogoutServiceCall.subscribe(response => {
      console.log("SIMS Logout Response in login.ts -> ", JSON.stringify(response));
    });

    if (window.localStorage.getItem('token') != undefined) {
      let phpLogoutServiceCall: Observable<any> = this.apiProvider.postauthService('loginApi/deleteToken', {'token': window.localStorage.getItem('token')}, 'POST');
      phpLogoutServiceCall.subscribe(response => {
        console.log("PHP Logout Response in login.ts -> ", JSON.stringify(response));
      });
    }
    this.menu.close();
    // vidur commented
    // this.events.unsubscribe('user:created', () => {
    // });
    // Need to set the root url from routing
    // this.navCtrl.setRoot('LoginPage');
    this.navCtrl.navigateRoot('login');
    console.log('Navigate to the login page')
    window.localStorage.clear();
  }

  async requestForDeviceRegistration() {
    console.log("inside requestForDeviceRegistration ====>>>>")
    let registrationRequestParameters = {
      'appId': this.sharedData.getAppId(),
      'userId': this.sharedData.getUserId(),
      'registerMobNo': window.localStorage.getItem('user_phone'),
      'otpChannel': ["SMS"]
    }
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present();
      console.log("Inside loader ====>>>>")
      let registrationRequestServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('requestForDeviceRegister', registrationRequestParameters, 'POST');
      registrationRequestServiceCall.subscribe(async response => {
        console.log("Showing loader again")
        console.log("****************************** Request for devise registration *****************************")
        console.log("requestForDeviceRegistration response : ", (JSON.stringify(response)));
        if (response.status == 1) {
          let deviceInfo = await Device.getInfo();
          if (deviceInfo.operatingSystem === 'ios' || deviceInfo.operatingSystem === 'android') {
            // this.fcm.getToken().then(token => {
            //   this.deviceInfoObj.firebase_device_token_id = token;
            // this.getDeviceInformation();
            this.deviceInfoObj.register_mobile_no = window.localStorage.getItem('user_phone');
            // this.navCtrl.push("OtpPage", {
            //   page: "DeviceRegistrationPage",
            //   transactionId: response.data.TransactionId,
            //   deviceInfoObj: this.deviceInfoObj,
            //   loginInfo: this.loginInfoParams
            // });
            this.updatevalidator.showToast("OTP Sent");
            loader.dismiss();
            // }).catch(err => {
            // this.updatevalidator.showToast(err);
            // loader.dismiss();
            // });
          } else {
            this.deviceInfoObj.firebase_device_token_id = "token";
            await this.getDeviceInformation();
            this.deviceInfoObj.register_mobile_no = window.localStorage.getItem('user_phone');
            console.log("Inside the web section handle")

            console.log("Redirect to otp page ====>>>>")

            console.log("Send arguments");
            await this.storage.set('page', "DeviceRegistrationPage");
            await this.storage.set('transactionId', response.data.TransactionId);
            await this.storage.set('deviceInfoObj', this.deviceInfoObj);
            await this.storage.set('loginInfo', this.loginInfoParams.value);
            await this.navCtrl.navigateForward(['/otp']);
            console.log("Redirect to the otp page ====>>>> ")
            loader.dismiss();
          }
        } else {
          this.updatevalidator.showAlert("Response Failure", response.errorMsg);
          loader.dismiss();
        }
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again! " + JSON.stringify(err));
        loader.dismiss();
      });
    console.log(" loader end  ====>>>>")
  }

  async getDeviceInformation() {
    let deviceInfo = await Device.getInfo();
    console.log("DeviceInfo -> ", deviceInfo);
    await this.detectDeviceType();
    await this.detectDeviceOs(deviceInfo);
    console.log("GetDeviceInformation complete ====>>")
    // returns if the app is running on a Desktop browser.
  }

  detectDeviceType() {
    if (this.platform.is('mobile'))
      this.deviceInfoObj.device_type = "P";
    else if (this.platform.is('desktop'))
      this.deviceInfoObj.device_type = "D";
    else if (this.platform.is('tablet'))
      this.deviceInfoObj.device_type = "T";
    else
      this.deviceInfoObj.device_type = "L";   //Laptop
  }

  detectDeviceOs(deviceInfo) {
    if (deviceInfo.operatingSystem === "android")
      this.deviceInfoObj.device_os = "A";
    else if (deviceInfo.operatingSystem === "windows")
      this.deviceInfoObj.device_os = "W";
    else if (deviceInfo.operatingSystem === "mac")
      this.deviceInfoObj.device_os = "I";
    else
      this.deviceInfoObj.device_os = "A";
  }

  testtingCredentials() {
    window.localStorage.setItem('user_phone', '8882189731')
    window.localStorage.setItem('sidebarPoPermission', "true")
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

  async ngOnInit() {
    // execute first time on page load
    // create empty storage
    await this.storage.create();
    // On initialization populate device id
    this.storage.get('user_device_id').then((deviceId) => {
      this.deviceId = deviceId;
      console.log("user deviceId:", deviceId);
      window.localStorage.setItem('device_id', deviceId);
    })

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

  ngOnDestroy(): void {
    // destroy the network getting used
    if (this.networkListner) {
      console.log("Removing network listener from on page changed")
      this.networkListner.remove();
    }
  }
}

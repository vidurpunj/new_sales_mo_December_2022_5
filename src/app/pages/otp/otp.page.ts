import {Component, OnInit} from '@angular/core';
import {LoadingController} from "@ionic/angular";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Observable} from "rxjs";
import {ApiService} from "../../services/api/api.service";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Network} from "@capacitor/network";
import {Storage} from '@ionic/storage';
import {ActivatedRoute} from "@angular/router"; // This line added manually.

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  userOtp: FormGroup | undefined;
  regenerateOtpParameters: any;
  userMobileNumber: number | undefined;
  regenerateOtpServiceCall: Observable<any> | undefined;
  transactionId: number | undefined;
  networkType: any;
  otp: string = "";
  connected: boolean = false;
  connectionType: string = "";
  OtpValue: any = null;
  newPassword: any;
  isOtp: boolean = false;
  loginInfo: any = {};

  constructor(
    public sharedData: SharedDataService,
    public loadingCtrl: LoadingController,
    public apiProvider: ApiService,
    public updatevalidator: UpdateValidatorService,
    public storage: Storage,
    private route: ActivatedRoute
  ) {
    storage.get('page').then((parameter) => {
      console.log('Received page Parameter: ' + parameter);
    });
    storage.get('transactionId').then((parameter) => {
      console.log('Received transactionId Parameter: ' + parameter);
      this.transactionId = parameter;
    });
    storage.get('deviceInfoObj').then((parameter) => {
      console.log('Received deviceInfoObj Parameter: ' + JSON.stringify(parameter));
    });
    storage.get('loginInfo').then((parameter) => {
      console.log('Received loginInfo Parameter: ' + JSON.stringify(parameter));
    });
  }

  async ngOnInit() {
    this.userOtp = new FormGroup({
      otp1: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp2: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp3: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp4: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp5: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp6: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')])
    });

    const status = await Network.getStatus();
    this.changeStatus(status);
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  onOtpChange(OTPValue) {
    console.log("OTPValue", OTPValue);

    if (OTPValue.length == 6) {
      this.OtpValue = OTPValue;
      this.isOtp = true;
    } else {
      this.isOtp = false;
    }
  }

  async resendOTPServiceCall() {
    // this.resendOtpServiceParameter = { "aUserEmail": this.userEmailId };
    // this.resendOtpServiceParameter = { "sMobileNo": this.userMobileNumber };

    // Incase of resending otp for forgot password call
    console.log("Fetch the page")
    debugger;

    // if (this.navParams.get('page') == 'ForgotPasswordPage') {
    if (true) {
      // this.resendOtpServiceParameter.userDeviceRegisterRequest = false;
      // this.otpSucess = this.apiProvider.postauthService('loginApi/sendOtp', this.resendOtpServiceParameter, 'POST');
      this.regenerateOtpParameters = {
        "userId": "",
        "appId": this.sharedData.getAppId(),
        "registerMobNo": this.userMobileNumber,
        "purpose": "PASSWORD_RECOVERY",
        "otpChannel": ["SMS"]
      }
      console.log("this.regenerateOtpParameters for ForgotPassword", this.regenerateOtpParameters);

      let loader = await this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      });
      loader.present().then(() => {
        this.regenerateOtpServiceCall = this.apiProvider.postSimsOTPService('generateOTP', this.regenerateOtpParameters, 'POST');
        this.regenerateOtpServiceCall.subscribe(response => {
          console.log("regenerateOtpServiceCall response(forgot password) : ", (JSON.stringify(response)));
          if (response.status == 0) {
            // this.updatevalidator.showAlert("Error", response.errorMsg);
            loader.dismiss();
          } else if (response.status == 1) {
            this.transactionId = response.data.TransactionId;
            console.log("New TransactionId for ForgotPassword: " + this.transactionId);
            // this.updatevalidator.showAlert("Otp Sent", "Please Enter new OTP");
            console.log("showToast Validate ====>>>>")
            // this.updatevalidator.showToast("Otp Sent");
          }
          //loader.dismiss();
        }, (err) => {
          // this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        });
      });
    }
      // In case of resending OTP for device registration
    // else if (this.navParams.get('page') == 'DeviceRegistrationPage') {
    else if (true) {
      this.regenerateOtpParameters = {
        'appId': this.sharedData.getAppId(),
        // 'userId': window.localStorage.getItem('userid'),
        // 'userId': 3340,
        'userId': this.sharedData.getUserId(),
        'registerMobNo': window.localStorage.getItem('user_phone'),
        'otpChannel': ["SMS"]
      }
      console.log("this.regenerateOtpParameters for DeviceRegistration", this.regenerateOtpParameters);
      let loader = await this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      });
      loader.present().then(() => {
        this.regenerateOtpServiceCall = this.apiProvider.postSimsAuthService('requestForDeviceRegister', this.regenerateOtpParameters, 'POST');
        this.regenerateOtpServiceCall.subscribe(response => {
          console.log("regenerateOtpServiceCall response(device registration request) : ", (JSON.stringify(response)));
          if (response.status == 1) {
            this.transactionId = response.data.TransactionId;
            // this.updatevalidator.showToast("OTP Sent");
            console.log("updatevalidator.showToast commented ====>>>>")
            console.log("New TransactionId for deviceRegistration: " + this.transactionId);
            loader.dismiss();
          } else {
            // this.updatevalidator.showAlert("Response Failure", response.errorMsg);
            loader.dismiss();
          }
        }, (err) => {
          // this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        });
      });
    }
  }

  async verifyOtpServiceCall(otpData) {
    otpData = this.OtpValue
    let page = await this.storage.get('page').then((val) => {
      console.log('Page url is ', val);
      return val;
    });
    // called if user is offline
    if (this.connected === false) {
      this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
    }
    // else if(this.navParams.get('page') == 'ForgotPasswordPage')
    else if (page === 'ForgotPasswordPage') {
      console.log("forgotPassword");
      // this.forgotPasswordServiceCall(otpData);
      this.verifyOtpForResettingPassword();
    }
      // DeviceRegistrationPage is basically LoginPage, only given another name to differentiate between functionalities
    // else if(this.navParams.get('page') == 'DeviceRegistrationPage')
    else if (page === 'DeviceRegistrationPage') {
      this.loginInfo = await this.storage.get('loginInfo').then((val) => {
        console.log('Login info:', val);
        return val;
      });
      console.log("device registration");
      this.completeDeviceRegistration();
    }
  }

  async verifyOtpForResettingPassword() {
    // this.Otp = otpValue.value.otp1.toString() + otpValue.value.otp2.toString() + otpValue.value.otp3.toString() + otpValue.value.otp4.toString() + otpValue.value.otp5.toString() +
    // otpValue.value.otp6.toString();
    if (this.OtpValue.length < 6 || this.OtpValue.length > 6) {
      // this.updatevalidator.showToast("Please enter 6 digit OTP number!!"); //====>>>> commented
      return;
    }
    let verifyOtpForResettingPasswordParameters = {
      "userId": "",
      "appId": this.sharedData.getAppId(),
      "otp": this.OtpValue,
      "purpose": "PASSWORD_RECOVERY",
      "transactionId": this.transactionId
    }
    console.log("verifyOtpForResettingPasswordParameters -> ", verifyOtpForResettingPasswordParameters);

    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      let verifyOtpServiceCall: Observable<any> = this.apiProvider.postSimsOTPService('verifyOTP', verifyOtpForResettingPasswordParameters, 'POST');
      verifyOtpServiceCall.subscribe(response => {
        console.log("verifyOtpServiceCall response -> ", JSON.stringify(response));
        if (response.status == 1) {
          this.resetPassword();
          loader.dismiss();
          // this.navCtrl.setRoot('LoginPage');
        } else
          this.updatevalidator.showAlert("Message", response.errorMsg);
        loader.dismiss();
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again!!");
        loader.dismiss();
      });
    });
    // loader.dismiss();
  }

  async completeDeviceRegistration() {
    console.log("inside completeDeviceRegistration() ====>>>>")
    // this.Otp = otpValue.value.otp1.toString() + otpValue.value.otp2.toString() + otpValue.value.otp3.toString() + otpValue.value.otp4.toString() + otpValue.value.otp5.toString() +
    // otpValue.value.otp6.toString();
    if (this.OtpValue.length < 6 || this.OtpValue.length > 6) {
      // this.updatevalidator.showToast("Please enter 6 digit OTP number!!"); // ====>>>> commented
    } else {
      let completeRegistrationParameters = {
        user_id: this.sharedData.getUserId(),
        app_id: this.sharedData.getAppId(),
        otpInfo: {transactionId: this.transactionId, otp: this.OtpValue},
        // deviceInfo: this.navParams.get('deviceInfoObj') ====>>>> commented
      }
      console.log("completeRegistrationParameters", completeRegistrationParameters);
      let loader = await this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      });
      console.log("Show loader again ====>>>>")
      loader.present();
        let completeRegistrationServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('completeDeviceRegister', completeRegistrationParameters, 'POST');
        completeRegistrationServiceCall.subscribe(response => {
          console.log("Now observe ====>>>>")
          console.log(response);
          if (response.status == 1) {
           debugger;
            window.localStorage.setItem('device_id', response.data.deviceId);
            //Add new device id to storage
            this.storage.set('user_device_id', response.data.deviceviceId); // ====>>>> commented
            // this.finalLogin();
            // this.navCtrl.setRoot('LoginPage');
            // this.login(this.loginInfo)  // ====>>>> commented
            // this.updatevalidator.showToast("Device Registered Successfully!"); // ====>>>> commented
            loader.dismiss();
          } else {
            this.updatevalidator.showAlert("Response Failure", response.errorMsg);
            loader.dismiss();
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again!! " + JSON.stringify(err));
          loader.dismiss();
        })
    }
  }

  resetPassword() {

    let resetPasswordParameters = {
      user_id: null,
      loginUserName: this.userMobileNumber,
      newPassword: this.newPassword,
      // confirmPassword: this.navParams.get('confirmPassword')  // ====>>>> commented
    }
    console.log("resetPasswordParameters -> ", resetPasswordParameters);

    // let resetPasswordServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('forgotPassword', resetPasswordParameters, 'POST');
    let resetPasswordServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('changeOrResetPassword', resetPasswordParameters, 'POST');
    resetPasswordServiceCall.subscribe(response => {
      console.log("resetPasswordServiceCall response -> ", JSON.stringify(response));
      if (response.status == 1) {
        this.updatevalidator.showAlert("Success", "Your Password has been reset successfully");
        // this.navCtrl.setRoot('LoginPage');  // ====>>>> commented
      } else
        this.updatevalidator.showAlert("Message", response.errorMsg);
    }, err => {
      this.updatevalidator.showAlert("Server Error", "Please try again!!");
    });
  }

}

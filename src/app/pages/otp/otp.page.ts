import {Component, OnInit} from '@angular/core';
import {LoadingController} from "@ionic/angular";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Observable} from "rxjs";
import {ApiService} from "../../services/api/api.service";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";

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

  otp: string = "";

  constructor(
    public sharedData: SharedDataService,
    public loadingCtrl: LoadingController,
    public apiProvider: ApiService
  ) {
    console.log("Hello UpdateValidatorProvider Provider ====>>>>");
  }

  ngOnInit() {
    this.userOtp = new FormGroup({
      otp1: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp2: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp3: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp4: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp5: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')]),
      otp6: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(1), Validators.pattern('^[0-9]$')])
    });
  }

  onOtpChange(event) {

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

}

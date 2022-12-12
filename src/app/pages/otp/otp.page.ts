import {Component, OnInit} from '@angular/core';
import {LoadingController, NavParams} from "@ionic/angular";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Observable} from "rxjs";
import {ApiService} from "../../services/api/api.service";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";


@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  regenerateOtpParameters: any;
  userMobileNumber: number | undefined;
  regenerateOtpServiceCall: Observable<any> | undefined;
  transactionId: number | undefined;
  constructor(

  ) {
    console.log("Hello UpdateValidatorProvider Provider ====>>>>");
  }

  ngOnInit() {
  }

  // async resendOTPServiceCall() {
  //   // this.resendOtpServiceParameter = { "aUserEmail": this.userEmailId };
  //   // this.resendOtpServiceParameter = { "sMobileNo": this.userMobileNumber };
  //
  //   // Incase of resending otp for forgot password call
  //   if (this.navParams.get('page') == 'ForgotPasswordPage') {
  //     // this.resendOtpServiceParameter.userDeviceRegisterRequest = false;
  //     // this.otpSucess = this.apiProvider.postauthService('loginApi/sendOtp', this.resendOtpServiceParameter, 'POST');
  //     this.regenerateOtpParameters = {
  //       "userId": "",
  //       "appId": this.sharedData.getAppId(),
  //       "registerMobNo": this.userMobileNumber,
  //       "purpose": "PASSWORD_RECOVERY",
  //       "otpChannel": ["SMS"]
  //     }
  //     console.log("this.regenerateOtpParameters for ForgotPassword", this.regenerateOtpParameters);
  //
  //     let loader = await this.loadingCtrl.create({
  //       cssClass: 'activity-detail-loading',
  //       spinner: "dots"
  //     });
  //     loader.present().then(() => {
  //       this.regenerateOtpServiceCall = this.apiProvider.postSimsOTPService('generateOTP', this.regenerateOtpParameters, 'POST');
  //       this.regenerateOtpServiceCall.subscribe(response => {
  //         console.log("regenerateOtpServiceCall response(forgot password) : ", (JSON.stringify(response)));
  //         if (response.status == 0) {
  //           // this.updatevalidator.showAlert("Error", response.errorMsg);
  //           loader.dismiss();
  //         } else if (response.status == 1) {
  //           this.transactionId = response.data.TransactionId;
  //           console.log("New TransactionId for ForgotPassword: " + this.transactionId);
  //           // this.updatevalidator.showAlert("Otp Sent", "Please Enter new OTP");
  //           console.log("showToast Validate ====>>>>")
  //           // this.updatevalidator.showToast("Otp Sent");
  //         }
  //         //loader.dismiss();
  //       }, (err) => {
  //         // this.updatevalidator.showAlert("Server Error", "Please try again!!");
  //         loader.dismiss();
  //       });
  //     });
  //   }
  //
  //
  //   // In case of resending OTP for device registration
  //   else if (this.navParams.get('page') == 'DeviceRegistrationPage') {
  //     this.regenerateOtpParameters = {
  //       'appId': this.sharedData.getAppId(),
  //       // 'userId': window.localStorage.getItem('userid'),
  //       // 'userId': 3340,
  //       'userId': this.sharedData.getUserId(),
  //       'registerMobNo': window.localStorage.getItem('user_phone'),
  //       'otpChannel': ["SMS"]
  //     }
  //     console.log("this.regenerateOtpParameters for DeviceRegistration", this.regenerateOtpParameters);
  //
  //     let loader = await this.loadingCtrl.create({
  //       cssClass: 'activity-detail-loading',
  //       spinner: "dots"
  //     });
  //     loader.present().then(() => {
  //       this.regenerateOtpServiceCall = this.apiProvider.postSimsAuthService('requestForDeviceRegister', this.regenerateOtpParameters, 'POST');
  //       this.regenerateOtpServiceCall.subscribe(response => {
  //         console.log("regenerateOtpServiceCall response(device registration request) : ", (JSON.stringify(response)));
  //         if (response.status == 1) {
  //           this.transactionId = response.data.TransactionId;
  //           // this.updatevalidator.showToast("OTP Sent");
  //           console.log("updatevalidator.showToast commented ====>>>>")
  //           console.log("New TransactionId for deviceRegistration: " + this.transactionId);
  //           loader.dismiss();
  //         } else {
  //           // this.updatevalidator.showAlert("Response Failure", response.errorMsg);
  //           loader.dismiss();
  //         }
  //       }, (err) => {
  //         // this.updatevalidator.showAlert("Server Error", "Please try again!!");
  //         loader.dismiss();
  //       });
  //     });
  //   }
  // }

}

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {LoadingController, NavController} from "@ionic/angular";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {ApiService} from "../../services/api/api.service";
import {Observable} from "rxjs";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
  user: any;
  deviceInfoObj: any;
  loginInfoParams: any;

  constructor(
    public formBuilder: FormBuilder,
    public navCtrl: NavController,
    private updatevalidator: UpdateValidatorService,
    private loadingCtrl: LoadingController,
    private apiProvider: ApiService,
    private sharedData: SharedDataService,
    public storage: Storage
  ) {

  }


  ngOnInit(): void {
    //create empty storage
    this.storage.create();

    this.user = this.formBuilder.group({
      username: new FormControl('', [Validators.required, Validators.pattern("[7-9][0-9]{9}")]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&+*()=])(?!.*\\s)[A-Za-z\\d][A-Za-z\\d!@#$%^&*()_+]{7,}")]),
      confirmation_password: new FormControl('', [Validators.required, Validators.minLength(8)])
    })
  }

  get username() {
    return this.user.get('username');
  }

  get password() {
    return this.user.get('password');
  }

  forgotPasswordService(userdata) {
    console.log("forgotPasswordService called ....")
    console.log("formData -> ", userdata);
    if (userdata.value.password == userdata.value.confirmation_password) {
      // this.updatepasswordServiceCall(userdata);
      // this.generateOTP(userdata);
      this.validateUserAndPassword(userdata);
    } else
      this.updatevalidator.showAlert("Warning", "Password and Confirm Password do not match.");
  }

  async validateUserAndPassword(form: FormGroup) {
    let validationParameters = {
      user_id: null,
      loginUserName: form.value.username,
      newPassword: form.value.password,
      confirmPassword: form.value.confirmation_password
    }
    console.log("validationParameters", validationParameters);

    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      let validationServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('validateUserAndPassword', validationParameters, 'POST');
      validationServiceCall.subscribe(response => {
        console.log("validationServiceCall response", JSON.stringify(response));
        if (response.status == 1)
          this.generateOTP(form);
        else
          this.updatevalidator.showAlert("Message", (response.data != null) ? response.data : response.errorMsg);
        loader.dismiss();
      }, err => {
        this.updatevalidator.showAlert("Validation Server Error", "Please try again!!");
        loader.dismiss();
      })
    });
    loader.dismiss();
  }

  async generateOTP(form: FormGroup) {
    let generateOTPParameters = {
      // "userId" : this.sharedData.getUserId(),
      "userId": "",
      "appId": this.sharedData.getAppId(),
      "registerMobNo": form.value.username,
      "purpose": "PASSWORD_RECOVERY",
      "otpChannel": ["SMS"]
    }
    console.log("generateOTPParameters", generateOTPParameters);
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      let generateOTPServiceCall: Observable<any> = this.apiProvider.postSimsOTPService('generateOTP', generateOTPParameters, 'POST');
      generateOTPServiceCall.subscribe(async response => {
        console.log("generateOTPServiceCall response : ", (JSON.stringify(response)));
        if (response.status == 1) {
          this.updatevalidator.showToast("OTP Sent");
          console.log("Stopped navigation controll ....")

          console.log("Send arguments");
          await this.storage.set('page', "ForgotPasswordPage");
          await this.storage.set('mobileNumber', form.value.username);
          await this.storage.set('transactionId', response.data.TransactionId);
          await this.storage.set('newpassword', form.value.password);
          await this.storage.set('confirmPassword', form.value.confirmation_password);
          await this.navCtrl.navigateForward(['/otp']);
          // Not redirecting anywhere
          // this.navCtrl.push('OtpPage', {
          //   page: 'ForgotPasswordPage',
          //   mobileNumber: form.value.username,
          //   transactionId: response.data.TransactionId,
          //   newpassword: form.value.password,
          //   confirmPassword: form.value.confirmation_password
          // });
        } else
          this.updatevalidator.showAlert("Message", response.errorMsg);
        loader.dismiss();
      }, (err) => {
        this.updatevalidator.showAlert("OTP Server Error", "Please try again!!");
        loader.dismiss();
      });
    });
    loader.dismiss();
  }
  goToLogin() {
    console.log("goToLogin called ....");
    this.navCtrl.navigateRoot('login');
  }
}

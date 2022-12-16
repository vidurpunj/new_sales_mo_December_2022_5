import {AlertController, LoadingController, MenuController, NavController} from "@ionic/angular";
import {Network} from "@capacitor/network";
import {ApiService} from "../../services/api/api.service";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";
import {Observable} from "rxjs";
import {LoginResponseStatus} from "../utils/LogicResponseStatus";
import {Storage} from "@ionic/storage";
import {PermissionConstants} from "../permission/PermissionConstants";

export class OtpBasePage {
  connected: boolean = false;
  connectionType: string = "";
  deviceId: string | null = "";

  constructor(
    public sharedData: SharedDataService,
    public loadingCtrl: LoadingController,
    public apiProvider: ApiService,
    public updatevalidator: UpdateValidatorService,
    public storage: Storage,
    public alertCtrl: AlertController,
    public menu: MenuController,
    public navCtrl: NavController
  ) {
    // check if network connection is correct
    const status = Network.getStatus();
    this.changeStatus(status);
  }

  changeStatus(status) {
    this.connected = status?.connected;
    this.connectionType = status?.connectionType;
  }

  async login(userData) {
    console.log("Now device registered and do the login again automatically  ====>>>>")
    console.log("userData", userData, userData.username);
    this.deviceId = window.localStorage.getItem('device_id');
    console.log("Form userData", userData, "phone number: ", userData.username);
    // window.localStorage.clear();
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      if (this.connected) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        // this.userLoginServiceCall(userData);
        this.loginServiceCall(userData);
      }
      loader.dismiss();
    });
  }

  async loginServiceCall(userData) {
    if (userData.username == "9999999991") {
      this.testtingCredentials();
    } else {

      let loginParameters = {
        "loginUserName": userData.username,
        "password": userData.password,
        "deviceId": this.deviceId
      };
      console.log("loginParameters:", loginParameters);
      let loader = await this.loadingCtrl.create({
        cssClass: 'activity-detail-loading',
        spinner: "dots"
      });
      loader.present().then(() => {
        let loginServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('authenticate', loginParameters, 'POST');
        loginServiceCall.subscribe(response => {
          if (response.status == 1) {
            console.log("Login Response Data =" + JSON.stringify(response));
            let status: LoginResponseStatus = response.data.status as LoginResponseStatus;

            if (response.data.userInfo != null) {
              this.sharedData.setUserId(response.data.userInfo.userId);
              window.localStorage.setItem('authToken', response.data.userInfo.authToken);
              window.localStorage.setItem('reqToken', response.data.userInfo.reqToken);
            }
            this.checkLoginStatus(status, response);
            loader.dismiss();
          } else {
            this.updatevalidator.showAlert("Status Failure", response.errorMsg);
            loader.dismiss();
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again!!");
          loader.dismiss();
        })
      });
      // loader.dismiss();
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
        console.log("send user to the home page after registration ====>>>>")
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

  checkLoginStatus(status: LoginResponseStatus, response: any) {
    console.log("authentication response status: ", status);
    switch (status) {
      case LoginResponseStatus.SUCCESS: {
        this.initializeUserData(response);
        // this.finalLogin();
        console.log("sendIdForAuthenticationOnPhp commented ====>>>>")
        this.sendIdForAuthenticationOnPhp();
        // this.navigateAsPerPermission();
        break;
      }

      case LoginResponseStatus.DEVICE_ID_NOT_FOUND: {
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
          }
        }
      ]
    });
    prompt.present();
  }

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
    console.log("commented below 2 lines ====>>>>")
    // this.events.unsubscribe('user:created', () => { });
    // this.navCtrl.setRoot('LoginPage');
    window.localStorage.clear();
  }

  async requestForDeviceRegistration() {
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
    loader.present().then(() => {
      let registrationRequestServiceCall: Observable<any> = this.apiProvider.postSimsAuthService('requestForDeviceRegister', registrationRequestParameters, 'POST');
      registrationRequestServiceCall.subscribe(response => {
        console.log("requestForDeviceRegistration response : ", (JSON.stringify(response)));
        if (response.status == 1) {
          // this.fcm.getToken().then(token => {
          //   this.deviceInfoObj.firebase_device_token_id = token;
          //   this.getDeviceInformation();
          //   this.deviceInfoObj.register_mobile_no = window.localStorage.getItem('user_phone');
          //   this.navCtrl.push("OtpPage", { page: "DeviceRegistrationPage", transactionId: response.data.TransactionId, deviceInfoObj: this.deviceInfoObj });
          //   this.updatevalidator.showToast("OTP Sent");
          //   loader.dismiss();
          // }).catch(err => {
          //   this.updatevalidator.showToast(err);
          //   loader.dismiss();
          //     });

          console.log("commented below lines ====>>>> ");
          // this.deviceInfoObj.firebase_device_token_id = "token";
          // this.getDeviceInformation();
          // this.deviceInfoObj.register_mobile_no = window.localStorage.getItem('user_phone');
          // this.navCtrl.push("OtpPage", {
          //   page: "DeviceRegistrationPage",
          //   transactionId: response.data.TransactionId,
          //   deviceInfoObj: this.deviceInfoObj
          // });
          this.updatevalidator.showToast("OTP Sent");
          loader.dismiss();
        } else {
          this.updatevalidator.showAlert("Response Failure", response.errorMsg);
          loader.dismiss();
        }
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again! " + JSON.stringify(err));
        loader.dismiss();
      });
    });
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
      if (response.status == 1) {
        window.localStorage.setItem('token', response.data.token);
        console.log("token generated -> ", window.localStorage.getItem('token'));
        console.log("deviceId -> ", window.localStorage.getItem('device_id'));
        console.log("this.deviceId -> ", this.deviceId);
        this.getUserImage();
        this.navigateAsPerPermission();
      } else
        this.updatevalidator.showAlert('Warning', 'You have already logged in from another device!');
    }, () => {
      this.updatevalidator.showAlert("Error", "Php Authentication server error");
      return;
    })
  }

  async getUserImage() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      if (this.connected) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        console.log('inside userimage function');
        let userImageServiceSuccess: Observable<any> = this.apiProvider.getAuthService('orgInfoApi/orgCommonSetting/' + window.localStorage.getItem('org_id') + '/' + window.localStorage.getItem('userid'), 'GET')
        userImageServiceSuccess.subscribe(result => {
          console.log("userImageData:" + JSON.stringify(result));
          if (result.status == 1) {
            window.localStorage.setItem('user_Profile_Pic', result.data.user_img);
            console.log("Now commented ====>>>>");
            // this.events.publish('user:created', ''); // commented ====>>>>
            loader.dismiss()
          } else {
            this.updatevalidator.showToast(result.message.message)
            loader.dismiss()
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
          loader.dismiss();
        })
      }
      loader.dismiss();
    })
  }

  async navigateAsPerPermission() {
    // this.navCtrl.push('ChooseLoginAsPage');
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.checkAdminAccessPermission().then(permissions => {
        console.log("permissions in navigateAsPerPermission: ", JSON.stringify(permissions));
        // console.log("admin permission in ionViewWillEnter: ", JSON.stringify(permissions)['adminPermission']);
        // console.log("admin permission in ionViewWillEnter: ", permissions['adminPermission']);

        // @ts-ignore
        if (permissions['adminPermission'] === true && permissions['employeePermission'] === false) {
          console.log("First If in navigateAsPerPermission");
          window.localStorage.setItem('user_Role', "ADMIN");
          window.localStorage.setItem('IsPermissionBoth', "false");
          console.log("commented navigate to new function ====>>>>");
          // this.navCtrl.setRoot('AdminDashboardPage');
          // this.updatevalidator.showToast("Login Successful, Welcome " + window.localStorage.getItem('user_name'));
        } else { // @ts-ignore
          if (permissions['adminPermission'] === false && permissions['employeePermission'] === true) {
            console.log("Second If in navigateAsPerPermission");
            window.localStorage.setItem('user_Role', "EMPLOYEE");
            window.localStorage.setItem('IsPermissionBoth', "false");
            console.log("commented navigate to the home page ====>>>>");
            // this.navCtrl.setRoot('HomePage');
            this.navCtrl.navigateForward(['/HomePage']);
            // this.updatevalidator.showToast("Login Successful, Welcome " + window.localStorage.getItem('user_name'));
          }
          //If User has neither admin nor employee permissions
          else { // @ts-ignore
            if (permissions['adminPermission'] === false && permissions['employeePermission'] === false) {
              this.updatevalidator.showAlert("Message", "You dont have permissions to access the app!");
              window.localStorage.setItem('IsPermissionBoth', "false");
              this.logout();
            }
            //If User has both admin and employee permissions
            else {
              // this.updatevalidator.showAlert("Alert!", "You have ADMIN Access Permission as well");
              window.localStorage.setItem('IsPermissionBoth', "true");
              console.log("commented navingate to choose login page ====>>>>")
              // this.navCtrl.setRoot('ChooseLoginAsPage');
            }
          }
        }
        loader.dismiss();
      }, () => {
        this.updatevalidator.showAlert("Error", "ADMIN access check failed!");
        loader.dismiss();
        return;
      });
    });
    // loader.dismiss();
  }

  checkAdminAccessPermission() {
    console.log(">> checking admin access permission after login >>");
    let promise = new Promise((resolve, reject) => {
      this.updatevalidator.validatePermissions(PermissionConstants.admin_access_permissions).subscribe(result => {
        console.log("checkAdminAccessPermission() response -> ", result);
        let adminPermission = false;
        let employeePermission = false;
        if (result != undefined && result.size > 0) {
          PermissionConstants.admin_access_permissions.forEach(value => {
            switch (value) {
              case "es.app.admin.access":
                // @ts-ignore
                adminPermission = result.get(value);
                console.log("check Admin Access Permission:", adminPermission);
                // resolve(permissions);
                break;

              case "es.app.employee.access":
                // @ts-ignore
                employeePermission = result.get(value);
                console.log("check Employee Access Permission:", employeePermission);
                break;
            }
          });
          resolve({'adminPermission': adminPermission, 'employeePermission': employeePermission});
        } else
          reject();
      });
    });
    return promise;
  }
}

import {Injectable} from '@angular/core';
import {AlertController, ToastController, LoadingController} from '@ionic/angular';
import {Observable, Subject} from "rxjs";
import {PermissionRequest} from "../../pages/permission/PermissionRequest";
import {ApiService} from "../api/api.service";
import {SharedDataService} from "../../services/shared-data/shared-data.service";

@Injectable({
  providedIn: 'root'
})
export class UpdateValidatorService {

  constructor(
    public alertCtrl: AlertController,
    private apiProvider: ApiService,
    private sharedData: SharedDataService
  ) {
  }

  showAlert(title, message) {
    let alert = this.alertCtrl.create({
      header: 'title',
      // subTitle: message,
      message: message,
      buttons: [{text: 'ok'}],
      backdropDismiss: false
    }).then((response) => {
      response.present();
    });
    // alert.present();
  }

  validatePermissions(permissionList: string[]): Observable<Map<string, boolean>> {
    let result: Subject<Map<string, boolean>> = new Subject<Map<string, boolean>>();
    let resultMap: Map<string, boolean> = new Map<string, boolean>();

    // let permissionRequest: PermissionRequest = new PermissionRequest(3340, 111, permissionList);
    // @ts-ignore
    let permissionRequest: PermissionRequest = new PermissionRequest(+window.localStorage.getItem('userid'), this.sharedData.getAppId(), permissionList);
    let permissionService: Observable<any> = this.apiProvider.postSimsAuthService('validatePermissions', permissionRequest);
    permissionService.subscribe(response => {
      if (response.status == 1) {
        console.log("Permission call success response -> ", JSON.stringify(response));
        permissionList.forEach(value => {
          resultMap.set(value, response.data[value]);
        })
      } else
        console.log("Permission call failure");

      result.next(resultMap);
    });
    return result;
  }
}

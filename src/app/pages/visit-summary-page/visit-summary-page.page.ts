import {Component, NgZone, OnInit} from '@angular/core';
import {VisitSummaryPagePageBase} from "./visit-summary-page-base.page";
import {LoadingController, NavParams} from "@ionic/angular";
import {UpdateValidatorService} from "../../services/update-validator/update-validator.service";
import {Observable} from "rxjs";
import {ApiService} from "../../services/api/api.service";
import {Network} from "@capacitor/network";
import {PluginListenerHandle} from "@capacitor/core";

@Component({
  selector: 'app-visit-summary-page',
  templateUrl: './visit-summary-page.page.html',
  styleUrls: ['./visit-summary-page.page.scss'],
  providers: [NavParams]
})
export class VisitSummaryPagePage extends VisitSummaryPagePageBase implements OnInit{
  networkListner: PluginListenerHandle | undefined;
  connectionType: string = 'none';
  connected: boolean | undefined;
  isDisTributor: boolean = false;
  isField: boolean = false;
  isFarmer: boolean = false;
  isMisc: boolean = false;
  currenLocationData: any;
  isPhotoAvailable: boolean | undefined;
  currentDate: string | undefined;
  VisitTypeList: any[] = [];
  getVisitTypeListServiceSuccess: Observable<any> | undefined;
  distrbutorListServiceSuccess: Observable<any> | undefined;
  getDistrbutorList: any[] = [];
  searchedDistributors: any[] = [];
  constructor(
    public override navParams: NavParams,
    public updatevalidator: UpdateValidatorService,
    public apiProvider: ApiService,
    public loadingCtrl: LoadingController,
    public ngZone: NgZone

  ) {
    super(navParams)
    // Get all the visits
    this.getVisitTypeList();
  }

  async ngOnInit() {

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
  visitTypeChange(ViSitTypeID) {
    console.log('visitTypeChange called ....');
    console.log('ViSitDataType', ViSitTypeID);
    this.visitTypeId = ViSitTypeID;
    let forminfo = this.VisitTypeList.find(obj => obj.id === ViSitTypeID);

    if (ViSitTypeID == "1") {
      this.getDistrbutorDataList();
      this.isDisTributor = true;
      this.isField = false;
      this.isFarmer = false;
      this.isFormVisible = false;
      this.isMisc = false;
      this.currentDate = new Date().toISOString();
      console.log("currentDate", this.currentDate);
      // this.updatevalidator.showToast("You Selected Distributor Type");
    }
    else if (ViSitTypeID == "2") {
      this.isField = true;
      this.isFarmer = false;
      this.isFormVisible = false;
      this.isDisTributor = false;
      this.isMisc = false;
      // this.getProductTypeDataList();
    }
    else if (ViSitTypeID == "3") {
      this.isFarmer = true;
      this.isField = false;
      this.isFormVisible = false;
      this.isDisTributor = false;
      this.isMisc = false;
      // this.getProductTypeDataList();
    }
    else if (ViSitTypeID > 3) {
      this.isMisc = true;
      this.isFarmer = false;
      this.isField = false;
      this.isDisTributor = false;
      let editable: boolean = false;

      if (this.navParams.get('visitEditData') != undefined) {
        let vistDditInfo = this.navParams.get('visitEditData');
        if (vistDditInfo.visit_type == ViSitTypeID) {
          editable = true;
          this.getVisitTypeList();
          this.loadCustomForm(forminfo, editable);
        } else {
          this.editableEntity = {};
          this.loadCustomForm(forminfo, editable);
        }
      } else {
        this.editableEntity = {};
        this.loadCustomForm(forminfo, editable);
      }

    }
    console.log("selected visit type name: " + JSON.stringify(this.VisitTypeList.filter(value => value.id === this.visitTypeId)[0].name));
  }



  async getDistrbutorDataList() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      if (this.connected === false) {
        this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
      } else {
        this.distrbutorListServiceSuccess = this.apiProvider.getAuthService('distributorApi/allDistributors/' + window.localStorage.getItem('userid') + '/' + window.localStorage.getItem('org_id'), 'GET')
        this.distrbutorListServiceSuccess.subscribe(result => {
          console.log("resultDistributorList:" + JSON.stringify(result));
          if (result.status == 1) {
            this.getDistrbutorList = result.data.distributorList;
            this.concatOrgnizationAndPhone();
            this.searchedDistributors = this.getDistrbutorList;
            //    this.updatevalidator.showToast(result.message.message);
            loader.dismiss()
          } else {
            this.updatevalidator.showToast(result.message.message)
            loader.dismiss()
          }
        }, (err) => {
          this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
          loader.dismiss();
        })
      } //loader.dismiss();
    })
  }

  async getVisitTypeList() {
    let loader = await this.loadingCtrl.create({
      cssClass: 'activity-detail-loading',
      spinner: "dots"
    });
    loader.present().then(() => {
      this.getVisitTypeListServiceSuccess = this.apiProvider.getAuthService('visitApi/allVisitTypes/' + window.localStorage.getItem('org_id'), 'GET');
      this.getVisitTypeListServiceSuccess.subscribe(allVisitTypeResult => {
        if (allVisitTypeResult.status == 1) {
          //    this.updatevalidator.showToast(allVisitTypeResult.message.message)
          this.VisitTypeList = allVisitTypeResult.data;
          loader.dismiss();
          if (this.navParams.get('visitEditData') != undefined) {
            console.log("Commented below ....");
            // this.configureVistOnEditMode(this.navParams.get('visitEditData'));
          }
          console.log("visitTypeList: ", JSON.stringify(this.VisitTypeList));
        } else {
          loader.dismiss();
        }
      }, (err) => {
        this.updatevalidator.showAlert("Server Error", "Please try again after sometime");
        loader.dismiss();
      });

    });
  }

  concatOrgnizationAndPhone() {
    let data: any = [];

    this.getDistrbutorList.forEach(element => {
      if (element.organization) {
        element['organizationAndPhone'] = element.organization + " " + element.phone;
      }
      data.push(element);
    });
    this.getDistrbutorList = data;
  }
}

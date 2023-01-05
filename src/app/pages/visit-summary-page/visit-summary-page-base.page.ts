import {NavParams} from "@ionic/angular";
import {Component} from "@angular/core";
@Component({
  template: ''
})
export abstract class VisitSummaryPagePageBase {
  public visitTypeId: any = '';
  isFormVisible: boolean = false;
  editableEntity: any = {};
  constructor(
    public navParams: NavParams
  ) { }


  loadCustomForm(forminfo, editable) {
    // this.form_id = forminfo.form_id;
    // this.isFormVisible = false;
    // let loader = this.loadingCtrl.create({
    //   cssClass: 'activity-detail-loading',
    //   spinner: "dots"
    // });
    // loader.present().then(() => {
    //   if (this.networkType === 'offline')
    //     this.updatevalidator.showAlert("Connection Error", "Check your connection and try again later");
    //   else {
    //     let params = {
    //       "org_id": window.localStorage.getItem('org_id'),
    //       "user_id": window.localStorage.getItem('userid'),
    //       "module_code": "visit_model",
    //       "form_id": forminfo.form_id,
    //
    //     }
    //     let allListService: Observable<any> = this.apiProvider.postauthService('generatepoApi/getCustomFrom', params, 'POST');
    //     allListService.subscribe(result => {
    //       console.log("allLists: " + JSON.stringify(result));
    //       if (result.status == 1) {
    //         this.form_Meta_list = result.data.form_metadata;
    //         this.myFormGroup = this.updatevalidator.addFormControls(this.form_Meta_list);
    //
    //         this.form_Meta_list.forEach(formObj => {
    //           this.editableEntity[formObj.column_name] = "";
    //           if (formObj.data_type == "multiselect" && formObj.is_dependent_load == "false") {
    //             this.getDropDownList(formObj);
    //
    //           }
    //           if (formObj.data_type == "select" && formObj.is_dependent_load == "false") {
    //             this.getDropDownList(formObj);
    //             if (formObj.is_dependent == "true") {
    //               if (editable) {
    //                 let visitEdit = this.navParams.get('visitEditData')
    //                 this.onChange(visitEdit[formObj.column_name], formObj);
    //
    //               }
    //             }
    //           }
    //           if (formObj.data_type == "select" && formObj.is_dependent_load == "true") {
    //             if (editable) {
    //               this.getDropDownList(formObj);
    //             }
    //           }
    //
    //           if (formObj.data_type == "searchable_select" && formObj.is_dependent_load == "false") {
    //             this.getDropDownList(formObj)
    //           }
    //         })
    //         this.myFormGroup = this.updatevalidator.addValidators(this.form_Meta_list, this.myFormGroup);
    //         this.myFormGroup.get('org_id').setValue(window.localStorage.getItem('org_id'))
    //         this.myFormGroup.get('visit_id').setValue(window.localStorage.getItem('visit_Id'))
    //         this.myFormGroup.get('visit_type').setValue(this.visitTypeId)
    //         this.myFormGroup.get('visit_name').setValue(this.VisitTypeList.filter(value => value.id === this.visitTypeId)[0].name)
    //         this.editableEntity.org_id = window.localStorage.getItem('org_id');
    //         this.editableEntity.visit_id = window.localStorage.getItem('visit_Id');
    //         this.editableEntity.visit_type = this.visitTypeId;
    //         this.editableEntity.visit_name = this.VisitTypeList.filter(value => value.id === this.visitTypeId)[0].name;
    //         if (editable) {
    //           this.ConfigureEntityEdiatble(this.form_Meta_list, this.navParams.get('visitEditData'));
    //         }
    //
    //
    //         this.isFormVisible = true;
    //       }
    //       else
    //         this.updatevalidator.showToast(result.message.message);
    //       loader.dismiss();
    //     }, (err) => {
    //       this.updatevalidator.showAlert("Server Error", "please try again. If problem does not resolve please contact your System Administrator !!!");
    //       loader.dismiss();
    //     });
    //   }
    // });
  }

  isMiscVisitEditMode(): boolean {
    let isEdit = false;
    if (this.navParams.get('visitEditData') != undefined) {
      isEdit = true;
      return isEdit;
    }
    return isEdit;
  }
}

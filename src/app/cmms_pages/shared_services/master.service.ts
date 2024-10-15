import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private http: HttpClient) { }

  toastdata(t_text: any, t_icon: any, timer = 2000) {
    Swal.fire({
      icon: t_icon,
      text: t_text,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: timer,
      width: 'auto',
      timerProgressBar: true,
    })
  }

  /* Company */
  // Company List
  getCompanyList(companyListdata: any) {
    return this.http.post<any>(environment.API_URL + 'companyLists/', companyListdata)
  }
  // Save
  saveCompany(newCompanydtl: any) {
    return this.http.post<any>(environment.API_URL + 'savecompany/', newCompanydtl)
  }
  // Status
  changeStatusCompany(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_company/', userstatus)
  }

  /* Business Unit */
  //  BU List
  getBuList(buListdata: any) {
    return this.http.post<any>(environment.API_URL + 'buLists/', buListdata)
  }
  // Save
  saveBu(newbudtl: any) {
    return this.http.post<any>(environment.API_URL + 'savebu/', newbudtl)
  }
  // Status
  changeStatusBu(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_bu/', userstatus)
  }

  /* Plant */
  // Plant List
  getPlantList(PlantListdata: any) {
    return this.http.post<any>(environment.API_URL + 'plantLists/', PlantListdata)
  }
  // Save
  savePlant(newPlantdtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveplant/', newPlantdtl)
  }
  // Status
  changeStatusPlant(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_plant/', userstatus)
  }

  /* Shift */
  // Shift List
  getShiftList(shiftListdata: any) {
    return this.http.post<any>(environment.API_URL + 'shift_Lists/', shiftListdata)
  }
  // Save
  saveShift(newShiftdtl: any) {
    return this.http.post<any>(environment.API_URL + 'save_shift/', newShiftdtl)
  }
  // Status
  changeStatusShift(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_shift/', userstatus)
  }

  /* Department */
  // Department List
  getDepartmentList(departmentListdata: any) {
    return this.http.post<any>(environment.API_URL + 'departmentLists/', departmentListdata)
  }
  // Save
  saveDepartment(newdepartmentdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savedepartment/', newdepartmentdtl)
  }
  // Status
  changeStatusDepartment(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_department/', userstatus)
  }

  /* Location */
  // Location List
  getLocationList(locationListdata: any) {
    return this.http.post<any>(environment.API_URL + 'locationLists/', locationListdata)
  }
  // Save
  saveLocation(newLocationdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savelocation/', newLocationdtl)
  }
  // Status
  changeStatusLocation(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_location/', userstatus)
  }

  /* User */
  // User List
  getUserList(employeeListdata: any) {
    return this.http.post<any>(environment.API_URL + 'employeeLists/', employeeListdata)
  }
  // Save
  saveUser(newEmployeedtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveemployee/', newEmployeedtl)
  }
  // Status
  changeStatusUser(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_employee/', userstatus)
  }

  /* Department Head */
  // List
  getDepartmentHeadList(department_headListdata: any) {
    return this.http.post<any>(environment.API_URL + 'department_headLists/', department_headListdata)
  }
  // Save
  saveDepartmentHead(newDepartment_headtl: any) {
    return this.http.post<any>(environment.API_URL + 'savedepartment_head/', newDepartment_headtl)
  }
  // Status
  changeStatusDepartmentHead(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_department_head/', userstatus)
  }

  /* Asset Model */
  // List
  getAssetModelList(assetmodelListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'asset_modelLists/', assetmodelListsdata)
  }
  // Save
  saveAssetModel(newAssetModeldtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveasset_model/', newAssetModeldtl)
  }
  // Status
  changeStatusAssetModel(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_asset_model/', userstatus)
  }

  /* Spare List */
  // List
  getSpareList(assetgroupListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'spareLists/', assetgroupListsdata)
  }
  // Save
  saveSpare(newSparedtl: any) {
    return this.http.post<any>(environment.API_URL + 'savespare/', newSparedtl)
  }
  // Status
  changeStatusSpare(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_spare/', userstatus)
  }

  /* Asset Group */
  // List
  getAssetGroupList(assetgroupListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'asset_groupLists/', assetgroupListsdata)
  }
  // Save
  saveAssetGroup(newAssetGroupdtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveasset_group/', newAssetGroupdtl)
  }
  // Status
  changeStatusAssetGroup(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_asset_group/', userstatus)
  }

  /* MTTR */
  // MTTR List
  getMttrList(mttrListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'mttrLists/', mttrListsdata)
  }
  // Save
  saveMttr(newMttrdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savemttr/', newMttrdtl)
  }
  // Status
  changeStatusMttr(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_mttr/', userstatus)
  }

  /* Breakdown Category */
  // List
  getBreakdownCategory(mcListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'breakdown_categoryLists/', mcListsdata)
  }
  // Save
  saveBreakdownCategory(newMcdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savebreakdown_category/', newMcdtl)
  }
  // Status
  changeStatusBreakdownCategory(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_breakdown_category/', userstatus)
  }

  /*Breakdown Sub Category*/
  // List
  getBreakdownSubCatergory(mscListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'breakdown_sub_categoryLists/', mscListsdata)
  }
  //Save
  saveBreakdownSubCategory(newMscdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savebreakdown_sub_category/', newMscdtl)
  }
  //Status
  changeStatusBreakdownsubCategory(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_breakdown_sub_category/', userstatus)
  }

  /*Breakdown Assignment*/
  // List
  getBreakdownAssign(mscListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'breakdown_assignmentLists/', mscListsdata)
  }
  //Save
  saveBreakdownAssign(newMscdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savebreakdown_assignment/', newMscdtl)
  }
  //Status
  changeStatusBreakdownAssign(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_breakdown_assignment/', userstatus)
  }

  /* Service */
  // List
  getServiceList(serviceListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'serviceLists/', serviceListsdata)
  }
  // Save
  saveService(newServicedtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveservice/', newServicedtl)
  }
  // Status
  changeStatusService(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_service/', userstatus)
  }

  /* Asset */
  // Asset List
  getAssetList(assetListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'assetLists/', assetListsdata)
  }
  // Save
  saveAsset(newAssetdtl: any) {
    return this.http.post<any>(environment.API_URL + 'saveasset/', newAssetdtl)
  }
  // Status
  changeStatusAsset(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_asset/', userstatus)
  }

  /*Task*/
  //List
  getTaskList(taskListdata: any) {
    return this.http.post<any>(environment.API_URL + 'taskLists/', taskListdata);
  }
  //Save
  saveTask(newTask: any) {
    return this.http.post<any>(environment.API_URL + 'save_task/', newTask);
  }
  //Status
  changeStatusTask(userStatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_task/', userStatus);
  }

  /*UOM*/
  //List
  getUomList(list: any) {
    return this.http.post<any>(environment.API_URL + 'uomLists/', list);
  }
  //Save
  saveUom(save: any) {
    return this.http.post<any>(environment.API_URL + 'saveuom/', save);
  }
  //Status
  changeStatusUom(status: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_uom/', status);
  }
  
  /* Department Engineer List */
  /* For Engineer List */
  getengineerListdata(engineereListdata: any) {
    return this.http.post<any>(environment.API_URL + 'department_engineerLists/', engineereListdata)
  }
  /* For Engineer Add */
  savenewengineer(newEngineertl: any) {
    return this.http.post<any>(environment.API_URL + 'savedepartment_engineer/', newEngineertl)
  }
  /* For Active Inactive Engineer */
  activeinactiveEngineer(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_department_engineer/', userstatus)
  }
  /* Api For select box */
  getBuName(company_id: any) {
    return this.http.post<any>(environment.API_URL + 'get_bu_name/', company_id)
  }
  getPlantName(bu_id: any) {
    return this.http.post<any>(environment.API_URL + 'get_plant_name/', bu_id)
  }
  getDepartmentName(plant_id: any) {
    return this.http.post<any>(environment.API_URL + 'get_department_name/', plant_id)
  }
  getLocationName(department_id: any) {
    return this.http.post<any>(environment.API_URL + 'get_location_name/', department_id)
  }
  getEgName(egName: any) {
    return this.http.post<any>(environment.API_URL + 'get_asset_group_name/', egName)
  }
  getAssetName(assetName: any) {
    return this.http.post<any>(environment.API_URL + 'get_asset_name/', assetName)
  }
  getIssueName(issueName: any) {
    return this.http.post<any>(environment.API_URL + 'get_issue_name/', issueName)
  }
  getSpareName(spareName: any) {
    return this.http.post<any>(environment.API_URL + 'spare_filter/', spareName)
  }

  /* For Designation List */
  getdesignationListdata(designationListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'designationLists/', designationListsdata)
  }
  /* For Designation Add */
  savenewdesignation(newDesignationdtl: any) {
    return this.http.post<any>(environment.API_URL + 'savedesignation/', newDesignationdtl)
  }


  /* For Asset Group Spare List */
  assetSpareList(spareList: any) {
    return this.http.post<any>(environment.API_URL + 'asset_group_spare_Lists/', spareList)
  }
  /* For Asset Group Spare Add */
  saveAssetGroupSpare(newspare: any) {
    return this.http.post<any>(environment.API_URL + 'saveasset_group_spare/', newspare)
  }
  /* For Active Inactive Asset Group Spare*/
  activeinactiveEgSpare(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_asset_group_spare_Lists/', userstatus)
  }

  /* For Asset Group Document List */
  assetDocumentList(documentList: any) {
    return this.http.post<any>(environment.API_URL + 'asset_group_document_Lists/', documentList)
  }
  /* For Asset Group Document Add */
  saveAssetGroupDocument(newdocument: any) {
    return this.http.post<any>(environment.API_URL + 'saveasset_group_document/', newdocument)
  }
  /* For Active Inactive Asset Group Document*/
  activeinactiveDocument(userstatus: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_asset_group_document_Lists/', userstatus)
  }

  /* For Generating Qr Code  */
  generateQrCode(qrcode: any) {
    return this.http.post<any>(environment.API_URL + 'asset_generate_qr_code/', qrcode)
  }
}

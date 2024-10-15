import { Component } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { WorkOrderService } from '../../shared_services/work-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterService } from '../../shared_services/master.service';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-pm-checklist',
  templateUrl: './pm-checklist.component.html',
  styleUrls: ['./pm-checklist.component.css']
})
export class PmChecklistComponent {
  isPMDetail: boolean = false;
  isCheckOut: boolean = false;
  pmStatus: any = 'open';
  searchTerm: any = '';

  pmCheckList: any = [];
  pmTaskList: any = [];
  generalList: any = [];
  monitoringList: any = [];
  spareList: any = [];
  spareGeneralList: any = [];
  spareMappingList: any = [];
  dropdownList: any = [];
  pmDetail: any = [];
  pmTaskDetail: any = [];
  engineerList: any = [];
  sparePMList = Array(1)

  openCount: any = 0;
  assignCount: any = 0;
  reassignCount: any = 0;
  progressCount: any = 0;
  overdueCount: any = 0;
  acknowledgeCount: any = 0;
  closedCount: any = 0;
  upcomingCount: any = 0;

  listTitle: any = '';
  spareSelectedId: any = [];
  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  departmentId: any = '';
  locationId: any = '';
  assetGroupId: any = '';
  assetId: any = '';
  pmId: any = '';
  pmStatusId: any = '';

  lastPmStatusSelect: any = ''
  engineerId: any = '';
  priority: any = '';

  comments: any = '';
  commentDivId: any = [];

  loginId: any = '';
  userType: any = '';
  model_attachment: any = "assets/images/placeholder.jpg";

  constructor(private activateRoute: ActivatedRoute, private commonService: CommonService, private workOrder: WorkOrderService, private spinner: NgxSpinnerService, private masterService: MasterService) { }
  ngOnInit() {
    var type = this.activateRoute.snapshot.paramMap.get('type');
    if (type == "app") {
      this.loginId = this.activateRoute.snapshot.paramMap.get('login_id')
      this.userType = this.activateRoute.snapshot.paramMap.get('login_type')
    } else {
      this.loginId = localStorage.getItem('employee_id');
      this.userType = localStorage.getItem('employee_type');
      this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
      this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
      this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
      this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
      this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');
    }


    this.getPmCheckList('open', '');
    $('.select2').chosen();

    this.sparePMList = Array(1).fill({});
    this.sparePMList.forEach((item: any, index: any) => {
      this.sparePMList[index] = {
        task_id: "",
        task_name: "Select Task",
        spare_id: "",
        spare_name: "Select Spare",
        spare_stock: "",
        spare_unit_price: "",
        consumed_qty: "",
        updated_stock: "",
      };
    });
  }

  /* ------------------------------------------------------ PM CheckList ----------------------------------------------------- */
  getPmCheckList(pm_status: any, pm_id: any) {
    this.spinner.show();
    const pmCheckForm = new FormData();
    pmCheckForm.append('pm_status', pm_status);
    pmCheckForm.append('pm_id', pm_id);
    pmCheckForm.append('login_id', this.loginId);
    pmCheckForm.append('from_date', '');
    pmCheckForm.append('to_date', '');
    pmCheckForm.append('schedule_type', '');
    this.workOrder.getPmCheckLists(pmCheckForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.pmStatus = pm_status;

        this.pmCheckList = res[0].pm_list;
        var countData = res[0].pm_list_count;
        this.openCount = countData[0].open;
        this.assignCount = countData[0].assign;
        this.reassignCount = countData[0].reassign;
        this.progressCount = countData[0].in_progress;
        this.overdueCount = countData[0].overdue;
        this.acknowledgeCount = countData[0].acknowledge;
        this.closedCount = countData[0].fixed;
        this.upcomingCount = countData[0].upcoming;
      }
    })
  }

  /* -------------------------------------- */
  searchPM() {
    const searchTerm = this.searchTerm.toLowerCase();
    const rows = document.querySelectorAll('#pm_list_tbody tr');

    rows.forEach((row: any) => {
      const cells = row.getElementsByTagName('td');
      let rowContainsSearchTerm = false;

      // Check if any cell in the row contains the search term
      for (let cell of cells) {
        if (cell.textContent.toLowerCase().includes(searchTerm)) {
          rowContainsSearchTerm = true;
          break;
        }
      }

      // Show or hide the row based on the search term match
      row.style.display = rowContainsSearchTerm ? '' : 'none';
    });
  }

  /* ----------------------------------------------------- PM DETAIL VIEW AND ITS PROCESS ----------------------------------------- */
  viewPMDetail(pm: any) {
    this.isPMDetail = true;
    this.spinner.show();
    this.pmDetail = pm;
    this.companyId = pm.company_id == 0 ? '' : pm.company_id;
    this.buId = pm.bu_id == 0 ? '' : pm.bu_id;
    this.plantId = pm.plant_id == 0 ? '' : pm.plant_id;
    this.departmentId = pm.department_id == 0 ? '' : pm.department_id;
    this.assetGroupId = pm.asset_group_id == 0 ? '' : pm.asset_group_id;
    this.assetId = pm.asset_id == 0 ? '' : pm.asset_id;
    this.engineerId = pm.assigned_owner == 0 ? '' : pm.assigned_owner;

    this.getEngineerList();

    if (pm.checklist_id == '') {
      this.pmId = '';
      const newTaskForm = new FormData();
      newTaskForm.append('service_id', pm.service_id);
      newTaskForm.append('status', 'active');

      this.masterService.getTaskList(newTaskForm).subscribe((res: any) => {
        if (res.is_error) {
          this.spinner.hide();
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.spinner.hide();
          this.pmTaskList = res[0].taskLists;
          this.pmTaskList.forEach((element: any) => {
            element["pm_status_name"] = 'Open';
            element["assigned_to"] = '';
            element["id"] = '';
            element["assigned_to_name"] = 'Select Engineer';
            element["task_status_val"] = '';
            element["task_value"] = '';
            element["task_status_id"] = 1;
            element["task_remarks"] = "";
            element["mt_task_value"] = element.value;
            element["mt_task_max_value"] = element.max_value;
            element["task_condition"] = element.condition;
            element["comment"] = "";
          });
          this.generalList = this.pmTaskList.filter((task: any) => task.task_type == 'General');
          this.monitoringList = this.pmTaskList.filter((task: any) => task.task_type == 'Monitoring');
        }
      });
    } else {
      this.pmId = pm.checklist_id;
      const pmCheckForm = new FormData();
      pmCheckForm.append('pm_id', this.pmId);
      pmCheckForm.append('login_id', this.loginId);
      this.workOrder.getPmCheckLists(pmCheckForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.pmCheckList = res[0].pm_list;
          this.pmTaskList = res[0].pm_task;
          this.pmTaskList.forEach((element: any) => {
            if (element.task_status_id == 3) {
              element['comment'] = element.reassigned_comment + ' by ' + element.reassigned_by_name
            } else if (element.task_status_id == 14) {
              element['comment'] = element.cancel_complete_comment + ' by ' + element.cancel_complete_by_name
            } else {
              element['comment'] = element.task_remarks;
            }
          });

          this.generalList = this.pmTaskList.filter((task: any) => task.task_type == 'General');
          this.monitoringList = this.pmTaskList.filter((task: any) => task.task_type == 'Monitoring');
        }
        this.getSpareList();
        this.getPmSpareList();
      });
    }

    setTimeout(() => {
      this.commonService.upperCase();
      this.commonService.numericDot();
    }, 500);
  }

  /* ------------------------------------------------------------ UPDATE THE PM STATUS PROCESS -------------------------------------- */
  updateStatus(status_id: any, div_id: any, task: any = []) {
    this.commentDivId = [];
    $('#' + div_id).val(status_id);
    if (status_id == 4) {
      if (div_id.includes('monitor')) {
        var id = div_id.split('_');
        $('#monitor_check_in_' + id[2]).attr('disabled', true);
      } else {
        var id = div_id.split('_');
        $('#task_check_in_' + id[2]).attr('disabled', true);
      }
    } else if (status_id == 3) {
      $('#comment_modal').modal('show');
      this.commentDivId.push(div_id);
      this.commentDivId.push('reassign');

    } else if (status_id == 11) {
      if (div_id.includes('monitor')) {
        var id = div_id.split('_');
        if ($('#monitoring_value_' + id[2]).val() == '') {
          this.commonService.toastdata('Kindly enter the value', 'error');
          $('#monitor_complete_' + id[2]).prop('checked', null);
        }
      } else {
        var id = div_id.split('_');
        var task_status_val = $('input[name="general_status_' + id[2] + '"]:checked').val();
        if (task_status_val == undefined || task_status_val == null) {
          this.commonService.toastdata('Kindly choose the task status', 'error');
          $('#complete_' + id[2]).prop('checked', null);
        }
      }
    } else if (status_id == 14) {
      $('#comment_modal').modal('show');
      this.commentDivId.push(div_id);
      this.commentDivId.push('cancel');
    }
  }

  commentSave() {
    if ($('#comment_form').valid) {
      var id = this.commentDivId[0].split('_');
      var use_type = this.commentDivId[1];
      if (this.commentDivId[0].includes('monitor')) {
        $('#monitor_comment_' + id[2]).val(this.comments)
        if (use_type == 'reassign') {
          $('#monitor_reassign_' + id[2]).attr('disabled', true);
        } else {
          $('#monitor_cancel_' + id[2]).attr('disabled', true);
        }
        $('#monitor_comment_' + id[2]).attr('disabled', true);
      } else {
        $('#task_comment_' + id[2]).val(this.comments)
        if (use_type == 'reassign') {
          $('#general_reassign_' + id[2]).attr('disabled', true);
        } else {
          $('#general_cancel_' + id[2]).attr('disabled', true);
        }
        $('#task_comment_' + id[2]).attr('disabled', true);
      }
      $('#comment_modal').modal('hide');
      this.comments = '';
    }
  }

  updatePM(status_id: any = '') {
    this.spinner.show();
    var pm_status_id: any = '';
    var general_table = document.getElementById('general_tbody') as HTMLTableElement;
    var monitor_table = document.getElementById('monitoring_tbody') as HTMLTableElement;
    var task_status: any = [];
    var task_obj: any = [];
    var error = false;
    var monitor_error = false;

    // General Task
    for (var i = 1; i <= general_table.rows.length; i++) {
      var remarks = '';
      var reassign_comment = '';
      var cancel_comment = '';
      var cri: any = {};
      var pm_task_id: any = $('#pm_general' + i + '_id').val();
      if (pm_task_id != '') {
        pm_task_id = Number($('#pm_general' + i + '_id').val())
      }
      cri["pm_task_id"] = pm_task_id;
      cri["pm_task_id"] = ($('#pm_general' + i + '_id').val());
      cri["task_id"] = Number($('#task_id_' + i).val());
      if ($('#general_engineer_' + i + '_id').val() == '') {
        error = true;
      }
      cri["assigned_user"] = Number($('#general_engineer_' + i + '_id').val());
      cri["task_status_id"] = Number($('#task_status_' + i + '_id').val() == 1 ? 2 : $('#task_status_' + i + '_id').val());
      cri["estimate_time"] = 0;
      var task_status_val = $('input[name="general_status_' + i + '"]:checked').val();
      if (task_status_val == undefined || task_status_val == null) {
        task_status_val = '';
      }
      cri["task_status_val"] = task_status_val;
      cri["task_value"] = 0;
      if ($('#task_status_' + i + '_id').val() == 3) {
        reassign_comment = $('#task_comment_' + i).val();
      } else if ($('#task_status_' + i + '_id').val() == 14) {
        cancel_comment = $('#task_comment_' + i).val();
      } else if ($('#task_status_' + i + '_id').val() == 2) {
        remarks = '';
      } else {
        remarks = $('#task_comment_' + i).val();
      }
      cri["monitoring_val_exceed"] = '';
      cri["reassign_comment"] = reassign_comment;
      cri["task_remarks"] = remarks;
      cri["cancel_complete_comment"] = cancel_comment;
      task_status.push(Number($('#task_status_' + i + '_id').val() == 1 ? 2 : $('#task_status_' + i + '_id').val()));
      task_obj.push(cri);
    }
    // Monitoring Task
    for (var i = 1; i <= monitor_table.rows.length; i++) {
      var remarks = '';
      var reassign_comment = '';
      var cancel_comment = '';

      var cri: any = {};
      var pm_task_id: any = $('#pm_monitor' + i + '_id').val();
      if (pm_task_id != '') {
        pm_task_id = Number($('#pm_monitor' + i + '_id').val())
      }
      cri["pm_task_id"] = pm_task_id;
      cri["task_id"] = Number($('#monitor_task_id_' + i).val());
      if ($('#monitor_engineer_' + i + '_id').val() == '') {
        monitor_error = true;
      }
      cri["assigned_user"] = Number($('#monitor_engineer_' + i + '_id').val());
      cri["task_status_id"] = Number($('#monitor_status_' + i + '_id').val() == 1 ? 2 : $('#monitor_status_' + i + '_id').val());
      cri["task_status_val"] = '';
      if ($('#monitor_status_' + i + '_id').val() == 3) {
        reassign_comment = $('#monitor_comment_' + i).val();
      } else if ($('#monitor_status_' + i + '_id').val() == 14) {
        cancel_comment = $('#monitor_comment_' + i).val();
      } else if ($('#monitor_status_' + i + '_id').val() == 2) {
        remarks = '';
      } else {
        remarks = $('#monitor_comment_' + i).val();
      }
      cri["estimate_time"] = 0;

      cri["task_value"] = $('#monitoring_value_' + i).val() == null ? 0 : Number($('#monitoring_value_' + i).val());
      cri["monitoring_val_exceed"] = '';
      cri["reassign_comment"] = reassign_comment;
      cri["task_remarks"] = remarks;
      cri["cancel_complete_comment"] = cancel_comment;
      task_status.push(Number($('#monitor_status_' + i + '_id').val() == 1 ? 2 : $('#monitor_status_' + i + '_id').val()))
      task_obj.push(cri);
    }

    if (status_id != 12) {
      if (task_status.includes(3)) {
        pm_status_id = 3;
      } else if (task_status.includes(4)) {
        pm_status_id = 4;
      } else if (task_status.includes(7)) {
        pm_status_id = 7;
      } else if (task_status.includes(8)) {
        pm_status_id = 8;
      } else if (task_status.includes(11) && !task_status.includes(2)) {
        pm_status_id = 11
      } else if (task_status.includes(14) && !task_status.includes(2)) {
        pm_status_id = 14
      } else {
        pm_status_id = 2;
      }
    } else {
      pm_status_id = 12;
    }

    if (error == true || monitor_error == true) {
      if (error == true) {
        this.spinner.hide();
        this.commonService.toastdata('Kindly Select the Engineer for General Task', 'warning');
      } else if (monitor_error == true) {
        this.spinner.hide();
        this.commonService.toastdata('Kindly Select the Engineer for Monitoring Task', 'warning');
      }
    } else {
      this.engineerId = Number($('#assign_owner_id').val());
      const savePM = new FormData();
      savePM.append('pm_id', this.pmId);
      savePM.append('schedule_id', this.pmDetail.schedule_id);
      savePM.append('service_id', this.pmDetail.service_id);
      savePM.append('pm_status_id', pm_status_id);
      savePM.append('pm_owner', this.engineerId);
      savePM.append('completion_time', '');
      savePM.append('login_id', this.loginId);
      savePM.append('task_obj', JSON.stringify(task_obj));
      savePM.append('reassign_comment', this.comments);
      savePM.append('cancel_comment', this.comments);

      this.workOrder.savePmStatus(savePM).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
          this.spinner.hide();
        } else {
          this.commonService.toastdata(res.message, 'success');
          this.commonService.reloadComponent('panel-iframe-work_order-pm_checklist');
          this.spinner.hide();
        }
      })
    }
  }

  /* ----------------------------------------------------- Pm Spare Details ----------------------------------------------------------- */
  // Spare Utilized for Breakdown
  getPmSpareList() {
    this.spinner.show();
    const spare = new FormData();
    spare.append('pm_id', this.pmId)
    spare.append('pm_task_id', '0')
    this.workOrder.getPMSpareList(spare).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        var sparelist = res[0].pm_spare;
        if (sparelist == '') {
          this.sparePMList = Array(1).fill({});
          this.sparePMList.forEach((item: any, index: any) => {
            this.sparePMList[index] = {
              pm_task_id: "",
              task_name: "Select Task",
              spare_id: "",
              spare_name: "Select Spare",
              spare_stock: "",
              spare_unit_price: "",
              consumed_qty: "",
              updated_stock: "",
            };
          });
        } else {
          this.sparePMList = sparelist;
          this.sparePMList.forEach((element: any) => {
            if (element.pm_task_id != 0) {
              var pmtask = this.pmTaskList.filter((data: any) => data.id == element.pm_task_id)
              element["task_name"] = pmtask[0].task_name;
            } else {
              element["task_name"] = '';
            }
            element["updated_stock"] = Number(element.spare_stock) + Number(element.consumed_qty)
          })
        }
        this.spinner.hide();
        setTimeout(() => {
          this.commonService.numericDot();
        }, 100);
      }
    })
  }

  getSpareList() {
    const spareForm = new FormData;
    spareForm.append('plant_id', this.plantId);
    spareForm.append('department_id', this.departmentId);
    spareForm.append('asset_group_id', this.assetGroupId);
    spareForm.append('asset_id', this.assetId);
    spareForm.append('type', 'all');
    this.workOrder.getSpareDetailList(spareForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.spareList = res[0].spares_lists;
      }
    });
  }

  addSpare() {
    var table_rows = document.getElementById('spare_tbody') as HTMLTableElement;
    var table_id = table_rows.rows.length;
    if (($('#spare' + table_id + '_id').val() == '' || $('#quantity_' + table_id).val() == '') && ($('#row_' + table_id).is(":visible"))) {
      this.commonService.toastdata('Kindly fill the previous one', 'warning');
    } else {
      table_id++;
      var str = '';
      str += '<tr id="row_' + table_id + '">';
      str += '  <td class="d-flex justify-content-center align-items-center">';
      str += '    <div class="custom-control custom-checkbox">';
      str += '      <input class="custom-control-input custom-control-input-info" type="checkbox" id="spare_check_' + table_id + '"';
      str += '        name="spare_check_' + table_id + '" checked="true" />';
      str += '      <label for="spare_check_' + table_id + '" class="custom-control-label"></label>';
      str += '    </div>';
      str += '    <button type="button" class="btn text-danger delete_spare" title="Delete Spare" ref_id="' + table_id + '"><i class="fas fa-trash"></i></button>';
      str += '  </td>';
      str += '  <td>';
      str += '    <div class="select_box mb-0">';
      str += '      <input type="hidden" name="task' + table_id + '_id" id="task' + table_id + '_id" value="" />';
      str += '      <p id="task' + table_id + '_name" class="form_dropdown task_name" ref_id="' + table_id + '"> Select Task </p>';
      str += '      <i class="fas fa-sort-down dropdown_icon"></i>';
      str += '    </div>';
      str += '  </td>';
      str += '  <td>';
      str += '    <div class="select_box mb-0">';
      str += '      <input type="hidden" name="spare' + table_id + '_id" id="spare' + table_id + '_id" value="" />';
      str += '      <p id="spare' + table_id + '_name" class="form_dropdown spare_name" ref_id="' + table_id + '"> Select Spare </p>';
      str += '      <i class="fas fa-sort-down dropdown_icon"></i>';
      str += '    </div>';
      str += '  </td>';
      str += '  <td id="available_qty_' + table_id + '"></td>';
      str += '  <td id="unit_price_' + table_id + '"></td>';
      str += '  <td><input class="form-control" id="quantity_' + table_id + '" name="quantity_' + table_id + '" value="" /></td>';
      str += '</tr>';

      $('#spare_tbody').append(str);

      this.commonService.numericDot();

      $('.delete_spare').on('click', (e: any) => {
        this.deleteSpare($(e.currentTarget).attr('ref_id'))
      });

      $('.spare_name').on('click', (e: any) => {
        this.loadSpareList($(e.currentTarget).attr('ref_id'))
      });

      $('.task_name').on('click', (e: any) => {
        this.loadSelectBox('task' + $(e.currentTarget).attr('ref_id'));
      });
    }
  }

  deleteSpare(div_id: any) {
    this.spareSelectedId = this.spareSelectedId.filter((id: any) => id != $('#spare' + div_id + '_id').val());

    $('#spare_check_' + div_id).prop('checked', null);
    $('#spare' + div_id + '_name').addClass('disabled');
    $('#quantity_' + div_id).prop('disabled', true);
    $('#row_' + div_id).css('background', '#ebebeb');
    $('#row_' + div_id).hide();
  }

  checkQuantity(div_id: any, e: any) {
    if (Number($(e.currentTarget).val()) > Number($('#hand_stock_' + div_id).val())) {
      this.commonService.toastdata('The Consumed Quantity is Greater than Hand Stock Quantity', 'warning', 2500);
      $(e.currentTarget).val('');
    }
  }

  loadSpareList(div_id: any) {
    $('#spare_search_box').val('');
    if ($('#spare' + div_id + '_name').hasClass('disabled')) { }
    else {
      var spare_list = this.spareList.filter((data: any) => !this.spareSelectedId.includes(data.spare_id));

      this.spareGeneralList = spare_list.filter((data: any) => data.type == "general");
      this.spareMappingList = spare_list.filter((data: any) => data.type == "mapping");
      this.spareMappingList.forEach((element: any) => {
        element['div_id'] = div_id;
      });

      this.spareGeneralList.forEach((element: any) => {
        element['div_id'] = div_id;
      });

      $('#spare_list_modal').modal('show');
    }
  }

  updateSpare(data: any) {
    if ($('#spare' + data.div_id + '_id').val() != "") {
      this.spareSelectedId = this.spareSelectedId.filter((id: any) => id != $('#spare' + data.div_id + '_id').val());
    }

    $('#spare' + data.div_id + '_name').text(data.spare_name);
    $('#spare' + data.div_id + '_id').val(data.spare_id);
    $('#available_qty_' + data.div_id).text(data.spare_stock);
    $('#unit_price_' + data.div_id).text(data.spare_unit_price);
    $('#hand_stock_' + data.div_id).val(data.spare_stock);
    this.spareSelectedId.push(data.spare_id);

    $('#spare_list_modal').modal('hide');
    $('#spare_search_box').val('');
    this.spareGeneralList = [];
    this.spareMappingList = [];
  }

  saveSpare() {
    var table = document.getElementById('spare_tbody') as HTMLTableElement;
    var spare_dtl: any = [];
    for (var i = 1; i <= table.rows.length; i++) {
      var cri: any = {};
      if ($('#spare_check_' + i).is(':checked')) {
        $('#spare' + i + '_id').addClass('required');
        $('#quantity_' + i).addClass('required');
      }
      cri['pm_task_id'] = Number($('#task' + i + '_id').val());
      cri['spare_id'] = Number($('#spare' + i + '_id').val());
      cri['consumed_qty'] = Number($('#quantity_' + i).val());
      cri['total_cost'] = (Number($('#unit_price_' + i).text() == '' ? 0 : $('#unit_price_' + i).text()) * Number($('#quantity_' + i).val()));
      cri['is_checked'] = $('#spare_check_' + i).is(':checked') ? "true" : "false";
      spare_dtl.push(cri);
    }

    if ($('#spare_form').valid()) {
      this.spinner.show();
      const spareForm = new FormData();
      spareForm.append('pm_id', this.pmId);
      spareForm.append('spare_obj', JSON.stringify(spare_dtl));
      this.workOrder.savePMSpare(spareForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
          this.spinner.hide();
        } else {
          this.commonService.toastdata('Saved Spare Data Successfully', 'success');
          this.spinner.hide();
        }
      })
    }
  }

  /* ---------------------------------------------------------- CHECK OUT FUNCTION -------------------------------------------------- */
  showpmStatus(id: any = '') {
    $('#' + id).show();
    this.isCheckOut = true;
  }

  /*----------------------------------------------------------- Engineer List -------------------------------------------------------*/
  getEngineerList() {
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('bu_id', this.buId);
    userForm.append('plant_id', this.plantId);
    userForm.append('is_engineer', 'yes');
    userForm.append('status', 'active');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.engineerList = res[0].employeeLists;
      }
    });
  }

  modelImage(task: any) {
    this.model_attachment = task.task_image_url;    
    $('#task_video_file').attr('src', task.task_video_url)
    $('#task_manual_file').attr('src', task.task_manual_url)
    $("#modal-image").modal("show");
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-work_order-pm_checklist');
  }


  // Load the Select Box
  loadSelectBox(categoryId: any) {
    $('#search_box').val('');
    if ($('#' + categoryId + '_name').hasClass('disabled')) {
    } else {
      this.dropdownList = [];
      if (categoryId.includes('general_engineer') || categoryId.includes('monitor_engineer') || categoryId.includes('assign_owner')) {
        this.listTitle = 'Engineer';
        this.dropdownList = this.engineerList;
        this.dropdownList.forEach((element: any) => {
          element['reason_id'] = element.employee_id;
          element['reason_name'] = element.employee_name;
          element['reason_div_id'] = categoryId;
        });
        $('#list_view_popup').modal('show');
      }
      else if (categoryId.includes('task')) {
        this.listTitle = 'Task';
        if (this.engineerId == this.loginId || this.userType == 'Plant Head' || this.userType == 'Department Head') {
          this.dropdownList = this.pmTaskList;
        } else {
          this.dropdownList = this.pmTaskList.filter((data: any) => (data.assigned_to == this.loginId && (data.task_status_id == 4 || data.task_status_id == 7 || data.task_status_id == 8)));
        }
        this.dropdownList.forEach((element: any) => {
          element['reason_id'] = element.id;
          element['reason_name'] = element.task_type + ' - ' + element.task_name;
          element['reason_div_id'] = categoryId;
        });
        $('#list_view_popup').modal('show');
      }
    }
  }

  // Search
  searchSelectBox(search_box: any, div_id: any) {
    var input, filter, ul, li, a, i, txtValue;
    var input: any = document.getElementById(search_box) as HTMLInputElement;
    filter = input.value.toUpperCase();
    var ul: any = document.getElementById(div_id) as HTMLUListElement;
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
      txtValue = li[i].textContent || li[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  // Update
  updateSelectBox(reason_id: any, reason_name: any, div_id: any) {
    $('#search_box').val('');
    this.listTitle = '';
    $('#' + div_id + '_name').text(reason_name);
    $('#' + div_id + '_id').val(reason_id);
    if (div_id.includes('general_engineer')) {
      var id = div_id.split('_')[2];
      $('#task_status_' + id + '_id').val(2);
    } else if (div_id.includes('monitor_engineer')) {
      var id = div_id.split('_')[2];
      $('#monitor_status_' + id + '_id').val(2);
    }
    $('#list_view_popup').modal('hide');
    this.dropdownList = [];
  }

}
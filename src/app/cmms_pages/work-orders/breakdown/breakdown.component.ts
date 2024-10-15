import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { WorkOrderService } from '../../shared_services/work-order.service';
import { CommonService } from '../../shared_services/common.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from '../../shared_services/report.service';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-breakdown',
  templateUrl: './breakdown.component.html',
  styleUrls: ['./breakdown.component.css']
})
export class BreakdownComponent {
  searchTerm: any = '';
  isBreakdownDtl: boolean = false;

  isCheckOut: boolean = false;
  isComplete: boolean = false;
  breakdownChanges: boolean = false;
  isSolutionBankSaved: boolean = false;

  isMultiple: boolean = false;
  isDowntimeEdit: boolean = false;
  isMttr: boolean = false;

  totalCount = 0;
  openCount = 0;
  acceptCount = 0;
  completedCount = 0;
  holdCount = 0;
  assignCount = 0;
  inprogressCount = 0;
  pendingCount = 0;
  holdPendingCount = 0;
  fixedCount = 0;

  lastBreakdownStatusSelect: any = '';
  breakdownList: any = [];
  breakdownDetail: any = [];

  engineerList: any = [];
  ownerEngineerList: any = [];
  comments: any = '';
  checkOutComment: any = '';

  spareSelectedId: any = [];
  spareList: any = [];
  spareGeneralList: any = [];
  spareMappingList: any = [];
  spareBreakdownList = Array(1)
  listTitle: any = '';
  dropdownList: any = [];
  mttrList: any = [];
  why1: any = '';
  why2: any = '';
  why3: any = '';
  why4: any = '';
  why5: any = '';
  action1: any = '';
  action2: any = '';
  action3: any = '';
  action4: any = '';
  action5: any = '';
  remarks: any = '';
  rootCause: any = '';
  solution: any = '';
  actualDowntime: any = '';

  ticketId: any = '';
  breakdownStatusId: any = '';
  assignType: any = '';
  engineerId: any = '';
  priority: any = '';

  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  assetGroupList: any = [];
  assetList: any = [];
  breakdownCategoryList: any = [];
  breakdownSubCategoryList: any = [];
  documentList: any = [];
  logDetailList: any = [];

  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  departmentId: any = '';
  locationId: any = '';
  assetGroupId: any = '';
  assetId: any = '';

  loginId: any = '';
  userType: any = '';
  constructor(private commonService: CommonService, private workOrder: WorkOrderService, private reportService: ReportService,
    private masterService: MasterService, private datePipe: DatePipe, private spinner: NgxSpinnerService, private timeFormat: TimeFormatPipe) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.userType = localStorage.getItem('employee_type');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
    this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');

    this.getCompanyList();

    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      autoclose: true,
      endDate: '0d',
      orientation: 'bottom bottom'
    });

    const date = new Date();
    // Subtract 30 days
    const pastDate = new Date(date);
    pastDate.setDate(date.getDate() - 30);
    var from_date = this.datePipe.transform(pastDate, 'dd-MM-yyyy');
    var to_date = this.datePipe.transform(date, 'dd-MM-yyyy')
    $('#from_date').datepicker('setDate', from_date);
    $('#to_date').datepicker('setDate', to_date);

    this.spareBreakdownList = Array(1).fill({});
    this.spareBreakdownList.forEach((item: any, index: any) => {
      this.spareBreakdownList[index] = {
        spare_id: "",
        spare_name: "Select Spare",
        spare_stock: "",
        spare_unit_price: "",
        consumed_qty: "",
        updated_stock: "",
      };
    });

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#assign_engineer").validate();
    $("#create_breakdown").validate();
    $("#solution_bank_form").validate();

    this.getBreakdownList('open', '');
    $('.chosen').chosen();

    $('#multi_engineer_id').change(() => {
      this.ownerEngineerList = [];
      var selectElement = (document.getElementById('multi_engineer_id') as HTMLSelectElement).selectedOptions;
      for (var j = 0; j < selectElement.length; j++) {
        var cri: any = {};
        cri['employee_name'] = (selectElement[j].text);
        cri['employee_id'] = (selectElement[j].value);
        this.ownerEngineerList.push(cri);
      }
      setTimeout(() => {
        $('#responsible_owner').chosen('destroy');
        $('#responsible_owner').chosen();
      }, 100);
    });
  }

  viewMore(e: any) {
    var viewMoreIcon = $(e.currentTarget);
    var circles = viewMoreIcon.next(".circles");

    if (viewMoreIcon.hasClass("fa-ellipsis-v")) {
      viewMoreIcon.removeClass("fa-ellipsis-v").addClass("fa-times");
      circles.css("display", "flex");
    } else {
      viewMoreIcon.removeClass("fa-times").addClass("fa-ellipsis-v");
      circles.css("display", "none");
    }
  }

  underDevop() {
    $('#under_development').modal('show');
  }

  /* ----------------------------------------- TICKET CREATE AND SAVE ------------------------------------- */
  createTicket() {
    $('#create_ticket').modal('show');
  }

  saveTicket() {
    $('.is_error').hide();
    var company_id = (document.getElementById('company_id') as HTMLInputElement).value;
    var bu_id = (document.getElementById('bu_id') as HTMLInputElement).value;
    var plant_id = (document.getElementById('plant_id') as HTMLInputElement).value;
    var department_id = (document.getElementById('department_id') as HTMLInputElement).value;
    var location_id = (document.getElementById('location_id') as HTMLInputElement).value;
    var asset_group_id = (document.getElementById('asset_group_id') as HTMLInputElement).value;
    var asset_id = (document.getElementById('asset_id') as HTMLInputElement).value;
    var breakdown_category_id = (document.getElementById('breakdown_category_id') as HTMLInputElement).value;
    var breakdown_id = (document.getElementById('breakdown_id') as HTMLInputElement).value;
    var asset_status = $("input[name='asset_status']:checked").val();
    var priority = $('input[name="create_breakdown_priority"]:checked').val();

    if (asset_status != undefined && breakdown_id != '' && asset_id != '') {
      this.spinner.show();
      const saveTicket = new FormData();
      saveTicket.append('company_id', company_id);
      saveTicket.append('bu_id', bu_id);
      saveTicket.append('plant_id', plant_id);
      saveTicket.append('department_id', department_id);
      saveTicket.append('location_id', location_id);
      saveTicket.append('asset_group_id', asset_group_id);
      saveTicket.append('asset_id', asset_id);
      saveTicket.append('breakdown_category_id', breakdown_category_id);
      saveTicket.append('breakdown_subcategory_id', breakdown_id);
      saveTicket.append('asset_status', asset_status);
      saveTicket.append('priority', priority);
      saveTicket.append('user_login_id', this.loginId);

      this.workOrder.createBreakdown(saveTicket).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.commonService.toastdata('Ticket Created Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-work_order-breakdown');
        }
      })
    } else {
      if (asset_id == '') {
        $('#asset_error').show();
      }
      if (breakdown_id == '') {
        $('#breakdown_error').show();
      }
      if (asset_status == undefined) {
        $('#asset_status_error').show();
      }
    }
  }

  /* ----------------------------------------- BREAKDOWN LIST ----------------------------------------- */
  // Breakdown List and it's Detail
  getBreakdownList(breakdown_status: any, ticket_id: any) {
    this.searchTerm = '';
    this.spinner.show();
    const breakdownForm = new FormData();
    breakdownForm.append('ticket_id', ticket_id);
    breakdownForm.append('breakdown_status', breakdown_status);
    breakdownForm.append('user_login_id', this.loginId);
    breakdownForm.append('period', 'from_to');
    breakdownForm.append('from_date', $('#from_date').val());
    breakdownForm.append('to_date', $('#to_date').val());
    this.workOrder.getBreakdownList(breakdownForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.isMultiple = false;
        this.isDowntimeEdit = false;
        this.isMttr = false;

        this.spinner.hide();

        if (ticket_id == '') {
          this.breakdownList = res[0].breakdown_detail_list;
          var ticket_count = res[0].breakdown_list_count;
          if (ticket_count != '' || ticket_count != null) {
            this.openCount = ticket_count[0].open;
            this.assignCount = ticket_count[0].assigned;
            this.acceptCount = ticket_count[0].accepted;
            this.completedCount = ticket_count[0].acknowledge;
            this.holdCount = ticket_count[0].hold;
            this.inprogressCount = ticket_count[0].on_progress;
            this.pendingCount = ticket_count[0].pending;
            this.holdPendingCount = ticket_count[0].hold_pending;
            this.fixedCount = ticket_count[0].closed;
            // this.totalCount = this.openCount + this.assignCount + this.acceptCount + this.inprogressCount + this.holdCount + this.pendingCount + this.completedCount + this.fixedCount;
            this.totalCount = this.openCount + this.assignCount + this.acceptCount + this.inprogressCount + this.holdPendingCount + this.completedCount + this.fixedCount;
          }
          this.lastBreakdownStatusSelect = breakdown_status;
        } else {
          this.breakdownDetail = res[0].breakdown_detail_list[0];
          this.viewBreakdownDetail();
        }
      }
    });
  }

  searchBreakdownList() {
    const searchTerm = this.searchTerm.toLowerCase();
    const rows = document.querySelectorAll('#breakdown_list_tbody tr');

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

  /* ---------------------------------------- UPDATE THE BREAKDOWN STATUS PROCESS ---------------------- */
  // Update Breakdown Status
  updateTicket(ticket_id: any, status_id: any, engineer_id: any = '') {

    if (engineer_id != '') {
      this.engineerId = engineer_id;
    }

    if (status_id == 3) {
      const bool = confirm('Do you want to Check In this ticket? Press OK to check in, Cancel to accept.');
      if (bool) {
        status_id = 6;
        if (engineer_id == 0) {
          this.engineerId = this.loginId;
        }
      } else {
        status_id = 3;
        if (engineer_id == 0) {
          this.engineerId = this.loginId;
        }
      }
    }

    const saveBreakdown = new FormData();
    saveBreakdown.append('ticket_id', ticket_id);
    saveBreakdown.append('status_id', status_id);
    saveBreakdown.append('priority', this.priority);
    saveBreakdown.append('engineer_id', this.engineerId);
    saveBreakdown.append('user_login_id', this.loginId);
    saveBreakdown.append('assign_type', this.assignType);

    if (status_id == 1 || status_id == 13 || status_id == 14) {
      saveBreakdown.append('open_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 2) {
      saveBreakdown.append('assigned_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 3) {
      saveBreakdown.append('accept_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 4) {
      saveBreakdown.append('reject_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 8) {
      if (this.comments == '') {
        this.comments = this.checkOutComment;
      }
      saveBreakdown.append('hold_comment', this.comments);
      saveBreakdown.append('check_out_comment', this.checkOutComment);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 9) {
      if (this.comments == '') {
        this.comments = this.checkOutComment;
      }
      saveBreakdown.append('pending_comment', this.comments);
      saveBreakdown.append('check_out_comment', this.checkOutComment);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 6) {
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 10) {
      saveBreakdown.append('check_out_comment', this.checkOutComment);
      saveBreakdown.append('comment', this.checkOutComment);

      if (this.isDowntimeEdit) {
        var actual_time = (this.actualDowntime == 0 || this.actualDowntime == '') ? '00:00:00' : this.actualDowntime;
        const [hours, minutes, seconds] = actual_time.split(':').map(Number);

        // Return the hours and minutes joined by a colon
        var time = hours + ':' + minutes + ':' + seconds;
        saveBreakdown.append('downtime_val', time);
      }
    } else if (status_id == 11) {
      saveBreakdown.append('completed_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    }
    else if (status_id == 12) {
      saveBreakdown.append('reopen_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    } else if (status_id == 5) {
      saveBreakdown.append('reassign_comment', this.comments);
      saveBreakdown.append('comment', this.comments);
    }
    this.workOrder.updateBreakdown(saveBreakdown).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.commonService.toastdata(res.message, 'success');
        this.breakdownDetail = [];
        this.ticketId = '';
        this.companyId = '';
        this.buId = '';
        this.plantId = '';
        this.departmentId = '';
        this.assetGroupId = '';
        this.engineerId = '';
        this.engineerId = '';
        this.breakdownStatusId = '';
        this.isMttr = false;
        this.isDowntimeEdit = false;
        this.isMultiple = false;
        this.commonService.reloadComponent('panel-iframe-work_order-breakdown');
        this.spinner.hide();
      }
    })
  }

  /* ----- COMMENTS ----- */
  openComment(ticket_id: any, breakdown_status: any, engineer_id: any, breakdown: any) {
    this.ticketId = ticket_id;
    this.breakdownStatusId = breakdown_status;
    this.engineerId = engineer_id;
    if (breakdown_status == 1 || breakdown_status == 13 || breakdown_status == 14) {
      this.comments = breakdown.open_comment;
      this.engineerId = 0;
    } else if (breakdown_status == 2) {
      this.comments = breakdown.assigned_comment;
    } else if (breakdown_status == 3) {
      this.comments = breakdown.accept_comment;
    } else if (breakdown_status == 4) {
      this.comments = breakdown.reject_comment;
    } else if (breakdown_status == 8) {
      this.comments = breakdown.hold_comment;
    } else if (breakdown_status == 9) {
      this.comments = breakdown.pending_comment;
    } else if (breakdown_status == 6 || breakdown_status == 10) {
      this.comments = breakdown.check_out_comment;
    } else if (breakdown_status == 11) {
      this.comments = breakdown.completed_comment;
    } else if (breakdown_status == 12) {
      this.comments = breakdown.reopen_comment;
    } else if (breakdown_status == 5) {
      if (breakdown.reassign_by_1 != '') {
        this.comments = breakdown.reassign_comment_1
      } else if (breakdown.reassign_by_2 != '') {
        this.comments = breakdown.reassign_comment_2;
      } else {
        this.comments = breakdown.reassign_comment_3;
      }
    }
    $('#comment_modal').modal('show');
  }

  /*----------- ASSIGN ENGINEER-------- */
  // Assign Engineer
  loadAssignDiv(breakdown_id: any, status_id: any, breakdown: any, priority: any) {
    this.getEngineerList(breakdown.company_id, breakdown.bu_id, breakdown.plant_id);
    this.getDepartmentDetail(breakdown.plant_id, breakdown.department_id);

    $('#assign_modal').modal('show');
    this.ticketId = breakdown_id;
    this.breakdownStatusId = status_id;
    this.priority = priority;
  }

  getDepartmentDetail(plant_id: any, department_id: any) {
    this.spinner.show();
    const departmentForm = new FormData;
    departmentForm.append('plant_id', plant_id);
    departmentForm.append('department_id', department_id);
    departmentForm.append('status', 'active');
    this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.spinner.hide();
        var department_list = res[0].departmentLists[0];

        if (department_list != null || department_list != '') {
          this.isMultiple = department_list.is_multiple == 'yes' ? true : false;
          this.isDowntimeEdit = department_list.is_downtime == 'yes' ? true : false;
          this.isMttr = department_list.is_mttr == 'yes' ? true : false;
        }

        setTimeout(() => {
          $('input[name="assignType"]').change(() => {
            var selectedValue = $('input[name="assignType"]:checked').val();
            $('#is_engineer').hide();
            $('#is_multi_engineer').hide();
            if (selectedValue == 'Multiple') {
              $('#is_multi_engineer').show();
              $('#is_multiple_assign').show();

              $('#multi_engineer_id').addClass('required');
              $('#responsible_owner').addClass('required');
              $('#engineer_id').removeClass('required');

              $('#multi_engineer_id').select2();
            } else {
              $('#is_engineer').show();

              $('#engineer_id').addClass('required');
              $('#responsible_owner').removeClass('required');
              $('#multi_engineer_id').removeClass('required');

              $('#is_multiple_assign').hide();
              $('#engineer_id').chosen('destroy');
              $('#engineer_id').chosen();
            }
          });
        }, 50);
      }
    })
  }

  getEngineerList(company_id: any, bu_id: any, plant_id: any) {
    const startTime = Date.now();
    const userForm = new FormData;
    userForm.append('company_id', company_id);
    userForm.append('bu_id', bu_id);
    userForm.append('plant_id', plant_id);
    userForm.append('is_engineer', 'yes');
    userForm.append('status', 'active');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.engineerList = res[0].employeeLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#engineer_id').chosen('destroy');
          $('#engineer_id').chosen();
        }, responseTime);
      }
    });
  }

  assignEngineer() {
    this.assignType = $('input[name="assignType"]:checked').val();
    this.priority = $('input[name="breakdown_priority"]:checked').val();
    if ($("#assign_engineer").valid()) {
      if (this.assignType == 'Multiple') {
        var selectElement = (document.getElementById('multi_engineer_id') as HTMLSelectElement).selectedOptions;
        var engineerList = [];
        for (var j = 0; j < selectElement.length; j++) {
          var cri: any = {};
          cri['is_owner'] = $('#responsible_owner').val() == (selectElement[j].value) ? "yes" : "no";
          cri['engineer_id'] = Number((selectElement[j].value));
          engineerList.push(cri);
        }
        this.engineerId = JSON.stringify(engineerList);
      } else {
        this.engineerId = $('#engineer_id').val();
      }
      this.updateTicket(this.ticketId, this.breakdownStatusId);
    }
  }

  /* ------------------------------------ BREAKDOWN DETAIL VIEW AND ITS PROCESS -------------------------- */
  // Breakdown Detail and it's function
  viewBreakdownDetail() {
    this.isBreakdownDtl = true;

    this.ticketId = this.breakdownDetail.id;
    this.companyId = this.breakdownDetail.company_id == 0 ? '' : this.breakdownDetail.company_id;
    this.buId = this.breakdownDetail.bu_id == 0 ? '' : this.breakdownDetail.bu_id;
    this.plantId = this.breakdownDetail.plant_id == 0 ? '' : this.breakdownDetail.plant_id;
    this.departmentId = this.breakdownDetail.department_id == 0 ? '' : this.breakdownDetail.department_id;
    this.assetGroupId = this.breakdownDetail.asset_group_id == 0 ? '' : this.breakdownDetail.asset_group_id;
    this.engineerId = this.breakdownDetail.engineer_id == 0 ? '' : this.breakdownDetail.engineer_id;
    this.checkOutComment = this.breakdownDetail.check_out_comment;

    this.why1 = this.breakdownDetail.why1;
    this.why2 = this.breakdownDetail.why2;
    this.why3 = this.breakdownDetail.why3;
    this.why4 = this.breakdownDetail.why4;
    this.why5 = this.breakdownDetail.why5;
    this.action1 = this.breakdownDetail.action1;
    this.action2 = this.breakdownDetail.action2;
    this.action3 = this.breakdownDetail.action3;
    this.action4 = this.breakdownDetail.action4;
    this.action5 = this.breakdownDetail.action5;
    this.remarks = this.breakdownDetail.remarks;
    this.rootCause = this.breakdownDetail.root_cause;
    this.solution = this.breakdownDetail.solution;

    this.getDepartmentDetail(this.plantId, this.departmentId);
    this.getAssetGroupDocumentList();
    if (this.breakdownDetail.status_id == 6) {
      this.actualDowntime = this.timeFormat.transform(this.breakdownDetail.downtime_duration);
      this.getBreakdownSpareList();
      this.getSpareList();

      this.getMttrList();
    } else if (this.breakdownDetail.status_id > 6) {
      this.actualDowntime = this.timeFormat.transform(this.breakdownDetail.downtime_duration);

      this.getBreakdownSpareList();
      this.getBreakdownMttrList();
    }

    setTimeout(() => {
      this.commonService.upperCase();
      this.commonService.numericDot();
      if (this.breakdownDetail.status_id != 6) {
        $('#why1').attr('disabled', true);
        $('#why2').attr('disabled', true);
        $('#why3').attr('disabled', true);
        $('#why4').attr('disabled', true);
        $('#why5').attr('disabled', true);
        $('#action1').attr('disabled', true);
        $('#action2').attr('disabled', true);
        $('#action3').attr('disabled', true);
        $('#action4').attr('disabled', true);
        $('#action5').attr('disabled', true);
        $('#root_cause').attr('disabled', true);
        $('#solution').attr('disabled', true);
        $('#solution_remarks').attr('disabled', true);
        $('#downtime_edit').attr('disabled', true);
      }
    }, 500);
    /* 
    setTimeout(() => {
      $('input[name="check_out"]').change(() => {
        console.log('Outside Checkout');
        var check_out = $('input[name="check_out"]:checked').val();
        if (check_out != 'complete') {
          if (check_out == 'hold') {
            if (this.checkOutComment == '') {
              this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
              $('input[name="check_out"]').prop('checked', false);
            } else {
              this.updateTicket(this.ticketId, 8, this.engineerId);
            }
          } else {
            if (this.checkOutComment == '') {
              this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
              $('input[name="check_out"]').prop('checked', false);
            } else {
              this.updateTicket(this.ticketId, 9, this.engineerId);
            }
          }
          this.isComplete = false;
        } else {
          this.isComplete = true;
          const bool = confirm('Do you want to enter the solution bank?');
          if (bool) {
            $('.nav-link').removeClass('active');
            setTimeout(() => {
              $('#solution_bank_div').addClass('active');
            }, 100)

            $('#general').removeClass('show active');
            $('#spare_part').removeClass('show active');
            $('#solution_bank').addClass('show active')
          } else {
            if (this.isMttr) {
              this.isSolutionBankSaved = true;

              $('.nav-link').removeClass('active');
              setTimeout(() => {
                $('#mttr_div').addClass('active');
              }, 100)

              $('#general').removeClass('show active');
              $('#spare_part').removeClass('show active');
              $('#mttr').addClass('show active');
              this.commonService.toastdata('Kindly fill the MTTR Detail Below', 'error');
            } else {
              if (this.checkOutComment == '') {
                this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
                $('input[name="check_out"]').prop('checked', false);
              } else {
                this.updateTicket(this.ticketId, 10, this.engineerId);
              }
            }
          }
        }
      });
    }, 1000); */
  }

  backToList() {
    this.isBreakdownDtl = false;
    setTimeout(() => {
      $('#open_tab').removeClass('active');
      $('#' + this.lastBreakdownStatusSelect + '_tab').addClass('active');
    }, 50);
    this.breakdownDetail = [];
    this.ticketId = '';
    this.companyId = '';
    this.buId = '';
    this.plantId = '';
    this.departmentId = '';
    this.assetGroupId = '';
    this.engineerId = '';
    this.checkOutComment = '';
    this.isMttr = false;
    this.isDowntimeEdit = false;
    this.isMultiple = false;
    this.isCheckOut = false;
    this.isComplete = false;
    this.isSolutionBankSaved = false;

    $('#why1').attr('disabled', null);
    $('#why2').attr('disabled', null);
    $('#why3').attr('disabled', null);
    $('#why4').attr('disabled', null);
    $('#why5').attr('disabled', null);
    $('#action1').attr('disabled', null);
    $('#action2').attr('disabled', null);
    $('#action3').attr('disabled', null);
    $('#action4').attr('disabled', null);
    $('#action5').attr('disabled', null);
    $('#root_cause').attr('disabled', null);
    $('#solution').attr('disabled', null);
    $('#solution_remarks').attr('disabled', null);
    $('#downtime_edit').attr('disabled', null);
  }

  /* ----------------- CHECK OUT FUNCTION ------------------- */
  showBreakdownStatus(ticket_id: any = '') {
    if (this.isCheckOut) {
      this.commonService.toastdata('Kindly fill the Breakdown Status and Comments', 'warning');
    } else {
      if (ticket_id != '') {
        this.getBreakdownList('', ticket_id);
      }
      this.isCheckOut = true;
    }

    setTimeout(() => {
      console.log('Inside Checkout');
      $('input[name="check_out"]').change(() => {
        var check_out = $('input[name="check_out"]:checked').val();
        if (check_out != 'complete') {
          if (check_out == 'hold') {
            if (this.checkOutComment == '') {
              this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
              $('input[name="check_out"]').prop('checked', false);
            } else {
              this.updateTicket(this.ticketId, 8, this.engineerId);
            }
          } else {
            if (this.checkOutComment == '') {
              this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
              $('input[name="check_out"]').prop('checked', false);
            } else {
              this.updateTicket(this.ticketId, 9, this.engineerId);
            }
          }
          this.isComplete = false;
        } else {
          this.isComplete = true;
          const bool = confirm('Do you want to enter the solution bank?');
          if (bool) {
            $('.nav-link').removeClass('active');
            setTimeout(() => {
              $('#solution_bank_div').addClass('active');
            }, 100)

            $('#general').removeClass('show active');
            $('#spare_part').removeClass('show active');
            $('#solution_bank').addClass('show active')
          } else {
            if (this.isMttr) {
              this.isSolutionBankSaved = true;

              $('.nav-link').removeClass('active');
              setTimeout(() => {
                $('#mttr_div').addClass('active');
              }, 100)

              $('#general').removeClass('show active');
              $('#spare_part').removeClass('show active');
              $('#mttr').addClass('show active');
              this.commonService.toastdata('Kindly fill the MTTR Detail Below', 'error');
            } else {
              if (this.checkOutComment == '') {
                this.commonService.toastdata('Kindly fill the Check Out comment', 'error');
                $('input[name="check_out"]').prop('checked', false);
              } else {
                this.updateTicket(this.ticketId, 10, this.engineerId);
              }
            }
          }
        }
      });
    }, 1000);
  }

  closeModal(type: any) {
    if (type = "spare") {
      $('#spare_search_box').val('');
      this.spareGeneralList = [];
      this.spareMappingList = [];
    } else {
      $('#search_box').val('');
      this.dropdownList = [];
    }
  }

  /* ---------------------------------- SPARE UTILIZATION ---------------------------------------- */
  // Spare Utilized for Breakdown
  getBreakdownSpareList() {
    this.spinner.show();
    const spare = new FormData();
    spare.append('ticket_id', this.ticketId)
    this.workOrder.getBreakdownSpareList(spare).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        var sparelist = res[0].ticket_spare_data;
        if (sparelist == '') {
          this.spareBreakdownList = Array(1).fill({});
          this.spareBreakdownList.forEach((item: any, index: any) => {
            this.spareBreakdownList[index] = {
              spare_id: "",
              spare_name: "Select Spare",
              spare_stock: "",
              spare_unit_price: "",
              consumed_qty: "",
              updated_stock: "",
            };
          });
        } else {
          this.spareBreakdownList = sparelist;
          this.spareBreakdownList.forEach((element: any) => {
            element["updated_stock"] = Number(element.spare_stock) + Number(element.consumed_qty)
            this.spareSelectedId.push(element.spare_id);
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
    if (this.departmentId == '') {
      this.departmentId = 0;
    }
    var asset_id = this.breakdownDetail.asset_id;
    spareForm.append('plant_id', this.plantId);
    spareForm.append('department_id', this.departmentId);
    spareForm.append('asset_group_id', this.assetGroupId);
    spareForm.append('asset_id', asset_id);
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
      str += '        name="spare_check_' + table_id + '" checked="true" disabled />';
      str += '      <label for="spare_check_' + table_id + '" class="custom-control-label"></label>';
      str += '    </div>';
      str += '    <button type="button" class="btn text-danger delete_spare" title="Delete Spare" ref_id="' + table_id + '"><i class="fas fa-trash"></i></button>';
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
    var error = 'no';
    for (var i = 1; i <= table.rows.length; i++) {
      var cri: any = {};
      if ($('#spare_check_' + i).is(':checked')) {
        $('#spare' + i + '_id').addClass('required');
        $('#quantity_' + i).addClass('required');
      }
      cri['spare_id'] = Number($('#spare' + i + '_id').val());
      cri['consumed_qty'] = Number($('#quantity_' + i).val());
      if (Number($('#quantity_' + i).val()) == 0) {
        error = 'yes';
      }
      cri['total_cost'] = (Number($('#unit_price_' + i).text() == '' ? 0 : $('#unit_price_' + i).text()) * Number($('#quantity_' + i).val()));
      cri['on_hand_stock'] = Number($('#available_qty_' + i).text());
      cri['is_checked'] = $('#spare_check_' + i).is(':checked') ? "true" : "false";
      spare_dtl.push(cri);
    }

    if (error == 'yes') {
      this.commonService.toastdata('Kindly enter the Spare Quantity', 'error');
    } else {
      if ($('#spare_form').valid()) {
        this.spinner.show();
        const spareForm = new FormData();
        spareForm.append('ticket_id', this.ticketId);
        spareForm.append('obj', JSON.stringify(spare_dtl));
        spareForm.append('user_login_id', this.loginId);
        this.workOrder.saveSpareBreakdown(spareForm).subscribe((res: any) => {
          if (res.is_error) {
            this.commonService.toastdata(res.message, 'error');
            this.spinner.hide();
          } else {
            this.commonService.toastdata(res[0].message, 'success');
            this.spinner.hide();
          }
        })
      }
    }
  }

  /* ------------------------------------------ SOLUTION BANK ----------------------------------- */
  saveSolutionBank() {
    var solutionBank: any = [];
    var cri: any = {}
    cri['why1'] = this.why1;
    cri['why2'] = this.why2;
    cri['why3'] = this.why3;
    cri['why4'] = this.why4;
    cri['why5'] = this.why5;
    cri['action1'] = this.action1;
    cri['action2'] = this.action2;
    cri['action3'] = this.action3;
    cri['action4'] = this.action4;
    cri['action5'] = this.action5;
    cri['remark'] = this.remarks;
    cri['root_cause'] = this.rootCause;
    cri['solution'] = this.solution;
    solutionBank.push(cri);

    if ($('#solution_bank_form').valid()) {
      this.spinner.show();
      const solutionForm = new FormData();
      solutionForm.append('ticket_id', this.ticketId);
      solutionForm.append('obj', JSON.stringify(solutionBank));
      this.workOrder.saveSolutionBank(solutionForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
          this.spinner.hide();
        } else {
          this.commonService.toastdata(res[0].message, 'success');

          if (this.isMttr) {
            this.isSolutionBankSaved = true;

            $('.nav-link').removeClass('active');

            setTimeout(() => {
              $('#mttr_div').addClass('active');
            }, 100)

            $('#solution_bank').removeClass('show active');
            $('#mttr').addClass('show active');
          } else {
            this.isSolutionBankSaved = false;
            this.updateTicket(this.ticketId, 10, this.engineerId);
          }
          this.spinner.hide();
        }
      })
    }
  }

  /* ------------------------------------------- MTTR --------------------------------------------- */
  //Mttr for breakdown
  getBreakdownMttrList() {
    this.spinner.show();
    const mttrForm = new FormData;
    mttrForm.append('ticket_id', this.ticketId);
    this.workOrder.getBreakdownMttr(mttrForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.mttrList = res[0].mttr_data;
        if (this.mttrList == '') {
          this.getMttrList();
        }
        this.spinner.hide();
      }
    })
  }

  getMttrList() {
    const mttrForm = new FormData;
    mttrForm.append('asset_group_id', this.assetGroupId);
    this.workOrder.getMttr(mttrForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.mttrList = res[0].mttr_Lists;
        this.mttrList.forEach((element: any) => {
          element['mttr_value'] = 0;
        });
      }
    })
  }

  saveMttr() {
    if (this.isSolutionBankSaved) {
      var mttr: any = [];
      var total_time = 0;
      this.mttrList.forEach((element: any, index: number) => {
        var cri: any = {};
        cri['mttr_id'] = element.mttr_id;
        cri['mttr_name'] = element.mttr_name;
        var parts = (($('#mttr_value' + (index + 1)).val()) == '') ? ('00:00:00'.split(':')) : ($('#mttr_value' + (index + 1)).val()).split(':');
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        var seconds = parseInt(parts[2], 10);
        var time = (hours * 3600) + (minutes * 60) + seconds;
        cri['mttr_value'] = time;
        total_time += time;
        mttr.push(cri);
      });


      var downtime_val = this.timeFormat.transform(this.breakdownDetail.downtime_duration);
      if (this.isDowntimeEdit) {
        downtime_val = $('#downtime_edit').val();
      }

      const [hours, minutes, seconds] = downtime_val.split(':').map(Number);
      var time = (hours * 3600) + (minutes * 60) + (seconds);

      if ((total_time == time) || mttr == '') {
        this.spinner.show();
        const mttrForm = new FormData();
        mttrForm.append('ticket_id', this.ticketId);
        mttrForm.append('obj', JSON.stringify(mttr));

        this.workOrder.saveMttr(mttrForm).subscribe((res: any) => {
          if (res.is_error) {
            this.commonService.toastdata(res.message, 'error');
            this.spinner.hide();
          } else {
            this.commonService.toastdata(res[0].message, 'success');
            this.updateTicket(this.ticketId, 10, this.engineerId);
            this.spinner.hide();
          }
        });
      } else {
        this.commonService.toastdata('The Total Downtime and Actual Downtime is not same..!', 'warning');
      }
    } else {
      this.commonService.toastdata('Kindly save the Solution Bank and then save MTTR', 'warning')
    }
  }

  closeComment(ticketId: any, status_id: any) {
    if (status_id == 11) {
      this.updateTicket(ticketId, status_id);
    }
    $('#comment_modal').modal('hide');
    this.comments = '';

  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-work_order-breakdown');
  }

  /* ---------------------------------- DOCUMENTS ------------------------- */
  getAssetGroupDocumentList() {
    const assetDocument = new FormData;
    var asset_id = this.breakdownDetail.asset_id;
    assetDocument.append('asset_group_id', this.assetGroupId);
    assetDocument.append('asset_id', asset_id);
    this.masterService.assetDocumentList(assetDocument).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.documentList = res[0].asset_group_document_Lists;
      }
    })
  }

  documentShow(data: any) {
    var height = window.innerHeight - 150;
    $('#document_manual').css('height', height)
    $('#document_manual').prop('src', data.document_url);
    $('#modal_docs').modal('show');
  }

  /* ------------------------------------- ALL MASTER SELECT BOX LOAD FUNCTION ------------------------ */

  //CompanyList
  getCompanyList() {
    const companyForm = new FormData;
    companyForm.append('company_id', this.companyId);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.companyList = res[0].companyLists;
        if (this.companyId != '') {
          $('#company_id').val(this.companyId);
          $('#company_name').text(this.companyList[0].company_name).addClass('disabled');
          this.getBuList(this.companyId);
          this.getBreakdownCategoryList();
        }
      }
    })
  }

  //BuList
  getBuList(company_id: any) {
    this.spinner.show();
    const buForm = new FormData;
    buForm.append('company_id', company_id);
    buForm.append('bu_id', this.buId);
    buForm.append('status', 'active');
    this.masterService.getBuList(buForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.buList = res[0].buLists;
        this.spinner.hide();
        if (this.buId != '') {
          $('#bu_id').val(this.buId);
          $('#bu_name').text(this.buList[0].bu_name).addClass('disabled');
          this.getPlantList(this.buId);
        }
      }
    })
  }

  //PlantList
  getPlantList(bu_id: any) {
    this.spinner.show();
    const plantForm = new FormData;
    plantForm.append('bu_id', bu_id);
    plantForm.append('plant_id', this.plantId);
    plantForm.append('status', 'active');
    this.masterService.getPlantList(plantForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.plantList = res[0].plantLists;
        this.spinner.hide();
        if (this.plantId != '') {
          $('#plant_id').val(this.plantId);
          $('#plant_name').text(this.plantList[0].plant_name).addClass('disabled');
          if (this.userType == 'Department Head' || this.userType == 'Head/Engineer') {
            this.getHeadDepartmentLists();
          } else {
            this.getDepartmentList(this.plantId);
          }
        }
      }
    })
  }

  //DepartmentList
  getDepartmentList(plant_id: any) {
    this.spinner.show();
    const departmentForm = new FormData;
    departmentForm.append('plant_id', plant_id);
    departmentForm.append('department_id', this.departmentId);
    departmentForm.append('status', 'active');
    this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.departmentList = res[0].departmentLists;
        this.spinner.hide();
        if (this.departmentId != '') {
          $('#department_id').val(this.departmentId);
          $('#department_name').text(this.departmentList[0].department_name).addClass('disabled');
          this.getLocationList(this.departmentId);
        }
      }
    })
  }

  //Head Department Lists
  getHeadDepartmentLists() {
    this.spinner.show();
    const departmentForm = new FormData;
    departmentForm.append('user_login_id', this.loginId);
    this.workOrder.getHeadDepartmentList(departmentForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.departmentList = res[0].assign_department_head;
        this.spinner.hide();
        if (this.departmentId != '') {
          $('#department_id').val(this.departmentList[0].department_id);
          $('#department_name').text(this.departmentList[0].department_name);
          this.getLocationList(this.departmentList[0].department_id);
        }
      }
    })
  }

  //LocationList
  getLocationList(department_id: any) {
    this.spinner.show();
    const locationtForm = new FormData;
    locationtForm.append('department_id', department_id);
    locationtForm.append('location_id', '');
    locationtForm.append('status', 'active');
    this.masterService.getLocationList(locationtForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.locationList = res[0].locationLists;
        this.spinner.hide();
        if (this.locationId != '') {
          $('#location_id').val(this.locationId);
          $('#location_name').text(this.locationList[0].location_name).addClass('disabled');
          this.getAssetGroupList(this.locationId);
        }
      }
    })
  }

  //AssetGroupList
  getAssetGroupList(location_id: any) {
    this.spinner.show();
    const assetgroupForm = new FormData;
    assetgroupForm.append('company_id', this.companyId);
    assetgroupForm.append('bu_id', this.buId);
    assetgroupForm.append('plant_id', this.plantId);
    assetgroupForm.append('department_id', this.departmentId);
    assetgroupForm.append('location_id', location_id);
    assetgroupForm.append('asset_group_id', '');
    assetgroupForm.append('status', 'active');
    this.masterService.getAssetGroupList(assetgroupForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.assetGroupList = res[0].asset_groupLists;
        this.spinner.hide();
      }
    })
  }

  //AssetList
  getAssetList(asset_group_id: any) {
    this.spinner.show();
    const assetForm = new FormData;
    assetForm.append('company_id', this.companyId);
    assetForm.append('bu_id', this.buId);
    assetForm.append('plant_id', this.plantId);
    assetForm.append('department_id', this.departmentId);
    assetForm.append('location_id', this.locationId);
    assetForm.append('asset_group_id', asset_group_id);
    assetForm.append('asset_id', this.assetId);
    assetForm.append('status', 'active');
    this.masterService.getAssetList(assetForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.assetList = res[0].assetLists;
        this.spinner.hide();
      }
    })
  }

  //BreakdownCategoryList
  getBreakdownCategoryList() {
    this.spinner.show();
    const breakdownCategoryForm = new FormData;
    breakdownCategoryForm.append('breakdown_category_id', '');
    breakdownCategoryForm.append('status', 'active');
    this.masterService.getBreakdownCategory(breakdownCategoryForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.breakdownCategoryList = res[0].breakdown_categoryLists;
        this.spinner.hide();
      }
    })
  }

  //BreakdownSubCategoryList
  getBreakdownSubCategoryList(breakdown_category_id: any) {
    this.spinner.show();
    const breakdownForm = new FormData;
    breakdownForm.append('company_id', this.companyId);
    breakdownForm.append('bu_id', this.buId);
    breakdownForm.append('plant_id', this.plantId);
    breakdownForm.append('asset_group_id', this.assetGroupId);
    breakdownForm.append('breakdown_category_id', breakdown_category_id);
    breakdownForm.append('breakdown_sub_category_id', '');
    breakdownForm.append('status', 'active');
    this.masterService.getBreakdownAssign(breakdownForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.breakdownSubCategoryList = res[0].breakdown_categoryLists;
        this.spinner.hide();
      }
    })
  }

  getAssetBasedBreakdown() {
    this.spinner.show();
    const formdata = new FormData;
    formdata.append('asset_code', $('#qr_code').val())
    this.workOrder.getAssetBasedBreakdown(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.breakdownSubCategoryList = res[0].asset_based_sub_category_lists;
        this.spinner.hide();
        const formdata = new FormData;
        formdata.append('asset_group_id', this.breakdownSubCategoryList[0].asset_group_id);
        formdata.append('status', 'active');
        this.masterService.getAssetList(formdata).subscribe((res: any) => {
          if (res.is_error) {
            this.commonService.toastdata(res.message, 'error');
            this.spinner.hide();
          } else {
            var asset_list = res[0].assetLists;
            this.spinner.hide();
            var assetList = asset_list.filter((data: any) => data.asset_code == $('#qr_code').val());

            // $('#res_engineer').text(assetList[0].responsible_person);
            this.companyId = assetList[0].company_id;
            this.buId = assetList[0].bu_id;
            this.plantId = assetList[0].plant_id;
            this.departmentId = assetList[0].department_id;
            this.locationId = assetList[0].location_id;
            this.assetGroupId = assetList[0].asset_group_id;

            $('#company_id').val(assetList[0].company_id);
            $('#bu_id').val(assetList[0].bu_id);
            $('#plant_id').val(assetList[0].plant_id);
            $('#department_id').val(assetList[0].department_id);
            $('#location_id').val(assetList[0].location_id);
            $('#asset_group_id').val(assetList[0].asset_group_id);
            $('#asset_id').val(assetList[0].asset_id);

            $('#company_name').text(assetList[0].company);
            $('#bu_name').text(assetList[0].bu);
            $('#plant_name').text(assetList[0].plant);
            $('#department_name').text(assetList[0].department);
            $('#location_name').text(assetList[0].location);
            $('#asset_group_name').text(assetList[0].asset_group);
            $('#asset_name').text(assetList[0].asset_code + ' - ' + assetList[0].asset_name);
            this.getBuList(assetList[0].company_id);
            this.getPlantList(assetList[0].bu_id);
            this.getDepartmentList(assetList[0].plant_id);
            this.getLocationList(assetList[0].department_id);
            this.getAssetGroupList(assetList[0].location_id);
            this.getAssetList(assetList[0].asset_group_id);
            this.getBreakdownCategoryList();
            this.loadSelectBox('breakdown_category', 'asset_based');
          }
        })
      }
    });
  }

  // Load the Select Box
  loadSelectBox(categoryId: any, type: any = "") {
    $('#search_box').val('');
    if ($('#' + categoryId + '_name').hasClass('disabled')) {
    } else {
      this.dropdownList = [];
      if (categoryId == 'company') {
        this.listTitle = 'Company';
        this.dropdownList = this.companyList;
        this.dropdownList.forEach((element: any) => {
          element['reason_id'] = element.company_id;
          element['reason_name'] = element.company_name;
          element['reason_div_id'] = categoryId;
        });
        $('#list_view_popup').modal('show');
      }
      else if (categoryId == 'bu') {
        if ($('#company_id').val() == '') {
          this.commonService.toastdata('Please Select Company', 'warning');
        }
        else {
          this.listTitle = 'Business Unit';
          this.dropdownList = this.buList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.bu_id;
            element['reason_name'] = element.bu_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'plant') {
        if ($('#bu_id').val() == '') {
          this.commonService.toastdata('Please Select BU', 'warning');
        }
        else {
          this.listTitle = 'Plant';
          this.dropdownList = this.plantList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.plant_id;
            element['reason_name'] = element.plant_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'department') {
        if ($('#plant_id').val() == '') {
          this.commonService.toastdata('Please Select Plant', 'warning');
        }
        else {
          this.listTitle = 'Department';
          this.dropdownList = this.departmentList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.department_id;
            element['reason_name'] = element.department_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'location') {
        if ($('#department_id').val() == '') {
          this.commonService.toastdata('Please Select Department', 'warning');
        }
        else {
          this.listTitle = 'Location';
          this.dropdownList = this.locationList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.location_id;
            element['reason_name'] = element.location_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'asset_group') {
        if ($('#location_id').val() == '') {
          this.commonService.toastdata('Please Select Location', 'warning');
        }
        else {
          this.listTitle = 'Asset Group';
          this.dropdownList = this.assetGroupList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.asset_group_id;
            element['reason_name'] = element.asset_group_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'asset') {
        if ($('#asset_group_id').val() == '') {
          this.commonService.toastdata('Please Select Asset Group', 'warning');
        }
        else {
          this.listTitle = 'Asset';
          this.dropdownList = this.assetList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.asset_id;
            element['reason_name'] = element.asset_code + ' - ' + element.asset_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'breakdown_category') {
        if ($('#company_id').val() == '') {
          this.commonService.toastdata('Please Select Company', 'warning');
        }
        else {
          this.listTitle = 'Breakdown Category';
          this.dropdownList = this.breakdownCategoryList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.breakdown_category_id;
            element['reason_name'] = element.breakdown_category_name;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
      }
      else if (categoryId == 'breakdown') {
        if ($('#breakdown_category_id').val() == '' && type == '') {
          this.commonService.toastdata('Please Select Breakdown Category', 'warning');
        }
        else {
          this.listTitle = 'Breakdown';
          this.dropdownList = this.breakdownSubCategoryList;
          this.dropdownList.forEach((element: any) => {
            element['reason_id'] = element.breakdown_sub_category_id;
            element['reason_name'] = element.breakdown_sub_category;
            element['reason_div_id'] = categoryId;
          });
          $('#list_view_popup').modal('show');
        }
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
    if (div_id == 'company') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);

      $('#bu_name').text('Select BU');
      $('#bu_id').val('');

      $('#plant_name').text('Select Plant');
      $('#plant_id').val('');

      $('#department_name').text('Select Department');
      $('#department_id').val('');

      $('#location_name').text('Select Location');
      $('#location_id').val('');

      $('#asset_group_name').text('Select Asset Group');
      $('#asset_group_id').val('');

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getBuList(reason_id);
      this.getBreakdownCategoryList();
    }
    else if (div_id == 'bu') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);

      $('#plant_name').text('Select Plant');
      $('#plant_id').val('');

      $('#department_name').text('Select Department');
      $('#department_id').val('');

      $('#location_name').text('Select Location');
      $('#location_id').val('');

      $('#asset_group_name').text('Select Asset Group');
      $('#asset_group_id').val('');

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getPlantList(reason_id);

    }
    else if (div_id == 'plant') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);

      $('#department_name').text('Select Department');
      $('#department_id').val('');

      $('#location_name').text('Select Location');
      $('#location_id').val('');

      $('#asset_group_name').text('Select Asset Group');
      $('#asset_group_id').val('');

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getDepartmentList(reason_id);
    }
    else if (div_id == 'department') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);

      $('#location_name').text('Select Location');
      $('#location_id').val('');

      $('#asset_group_name').text('Select Asset Group');
      $('#asset_group_id').val('');

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getLocationList(reason_id);
    }
    else if (div_id == 'location') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);
      this.departmentId = $('#department_id').val();

      $('#asset_group_name').text('Select Asset Group');
      $('#asset_group_id').val('');

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getAssetGroupList(reason_id);
    }
    else if (div_id == 'asset_group') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);

      $('#asset_name').text('Select Asset');
      $('#asset_id').val('');

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');

      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getAssetList(reason_id);
    }
    else if (div_id == 'asset') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);
      var asset_list = this.assetList.filter((data: any) => data.asset_id == reason_id);
      // $('#res_engineer').text(asset_list[0].responsible_person)

      $('#breakdown_category_name').text('Select Breakdown Category');
      $('#breakdown_category_id').val('');

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');

      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      $('#' + div_id + '_error').hide();
    }
    else if (div_id == 'breakdown_category') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);
      this.assetGroupId = $('#asset_group_id').val();

      $('#breakdown_name').text('Select Breakdown');
      $('#breakdown_id').val('');

      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      this.getBreakdownSubCategoryList(reason_id);
    }
    else if (div_id == 'breakdown') {
      $('#' + div_id + '_name').text(reason_name);
      $('#' + div_id + '_id').val(reason_id);
      $('#list_view_popup').modal('hide');
      this.dropdownList = [];
      $('#' + div_id + '_error').hide();
    }
  }

  /* ------------------------------------ Full Work Log Detail ---------------------------- */
  getWorkLogDetail() {
    this.spinner.show();
    const formdata = new FormData();
    formdata.append('ticket_id', this.ticketId)
    formdata.append('user_login_id', this.loginId)
    this.workOrder.getWorkLogDetail(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.logDetailList = res[0].breakdown_work_log_list;
        $('#work_log').modal('show');
        this.spinner.hide();
      }
    })
  }

  /* ----------------------------------- BREAKDOWN PROCESS DOWNLOAD -------------------------------------- */
  downloadBreakdown(ticket_id: any) {
    this.ticketId = ticket_id;
    this.spinner.show();
    const breakdownForm = new FormData();
    breakdownForm.append('ticket_id', ticket_id);
    breakdownForm.append('breakdown_status', '');
    breakdownForm.append('user_login_id', this.loginId);
    this.workOrder.getBreakdownList(breakdownForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.breakdownDetail = res[0].breakdown_detail_list[0];
        this.getBreakdownSpareList();
        setTimeout(() => {
          this.downloadBreakdownPdf();
          this.spinner.hide();
        }, 1000);
      }
    });
  }

  downloadBreakdownPdf() {
    var logo1 = new Image();
    logo1.src = 'assets/images/ti_black.png';
    var doc = new jsPDF('p', 'mm');
    doc.addImage(logo1, 'png', 10, 5, 25, 7);
    doc.setFontSize(14);
    autoTable(doc, {
      html: '#pdf_breakdown',
      includeHiddenHtml: false,
      margin: {
        top: 15,
        left: 5,
        right: 5,
        bottom: 5
      },
      styles: {
        cellPadding: 2,
        minCellHeight: 8,
        fontSize: 10,
        fillColor: 255,
        textColor: [54, 54, 54],
        overflow: "linebreak",
        halign: "center",
        valign: "middle",
        lineColor: '#c0c0c0',
        lineWidth: 0.1,
        font: "helvetica"
      },
      theme: 'grid',
      didParseCell: function (data: any) {
        if (data.cell.raw && data.cell.raw.className) {
          // Check if data.cell.raw and data.cell.raw.className are defined 
          if (data.cell.raw.className.includes("head")) {
            data.cell.styles.fillColor = [9, 127, 145];
            data.cell.styles.textColor = 255;
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = "11";
          }
          if (data.cell.raw.className.includes('pdf-title')) {
            data.cell.styles.textColor = [0, 85, 159];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = "14";
          }
        }
      },
    });
    doc.save('Breakdown Report');
    this.ticketId = '';
  }
}
import { Component, Input, OnChanges } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})

export class TaskComponent implements OnChanges {
  @Input() serviceId: any = "";
  @Input() companyId: any = "";
  @Input() buId: any = "";
  @Input() plantId: any = "";

  taskCard: boolean = false;
  listView: boolean = false;

  taskList: any = [];
  serviceList: any = [];
  uomList: any = [];
  masterOperation: any = [];

  taskId: any = "";
  taskName: any = "";
  taskType: any = "";
  taskDescription: any = "";
  taskCondition: any = "";
  taskMinValue: any = "";
  taskMaxValue: any = "";
  uomId: any = "";
  createdOn: any = "";
  createdBy: any = "";
  modifiedOn: any = "";
  modifiedBy: any = "";

  taskImage: any = "";
  taskImageOld: any = "placeholder.jpg";
  taskImageFile: any = "assets/images/placeholder.jpg";
  taskVideo: any = "";
  taskVideoOld: any = "dummy.mp4";
  taskVideoFile: any = "assets/images/dummy.mp4";
  taskManual: any = "";
  taskManualOld: any = "dummy.pdf";
  taskManualFile: any = "assets/images/dummy.pdf";
  loginId: any = [];

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');

    $('#task_toggle_icon').on('click', () => {
      const toggleIcon = $('#tasktoggleIcon');
      const dataElements = $('#task_dataTable, #task_dataTable_info, #task_dataTable_filter, #task_dataTable_paginate, #task_dataTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        dataElements.hide();
        this.listView = true;
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.listView = false;
      }
    });

    this.masterOperation = this.settingService.masterOperation(22, this.loginId);

    $("#task_type").change(() => {
      this.taskTypeChange($("#task_type").val());
    });

    $('#task_condition').change(() => {
      this.taskConditionChange();
    });

    $('.task_select2').chosen();
    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" })
    $("#task_form").validate();
    this.commonService.numericDot();
  }

  ngOnChanges() {
    this.getTaskLists();
  }

  taskTypeChange(task_type: any) {
    $('#condition_div, #task_value, #max_value, #uom_div').hide();
    $('#task_detail_div').show();
    if (task_type == 'Monitoring') {
      $('#condition_div, #task_value, #uom_div').show();
      $('#task_condition, #task_uom').chosen('destroy');
      $('#task_condition, #task_value, #task_uom').addClass('required');
      $('#task_condition, #task_uom').chosen();
    } else {
      $('#condition_div, #task_value, #uom_div, #max_value').hide();
      $('#task_condition, #task_uom').chosen('destroy');
      $('#task_condition, #task_value, #task_uom, #max_value').removeClass('required');
      $('#task_condition, #task_uom').chosen();
      $('#task_value_name').text('Value');
    }
  }

  taskConditionChange() {
    this.getUomList();
    if ($("#task_condition").val() == 'range') {
      $('#max_value').show();
      $('#max_value').addClass('required');
      $('#task_value_name').text('Minimum Value');
    } else {
      $('#max_value').hide();
      $('#max_value').removeClass('required');
      $('#task_value_name').text('Value');
    }
  }

  getTaskLists() {
    const startTime = Date.now();
    const newTaskForm = new FormData();
    newTaskForm.append('task_id', '');
    newTaskForm.append('service_id', this.serviceId);
    newTaskForm.append('status', '');

    this.masterService.getTaskList(newTaskForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.taskList = res[0].taskLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#task_dataTable').DataTable({
            "paging": true,
            "retrieve": true,
            "lengthChange": true,
            "searching": true,
            "ordering": true,
            "info": true,
          });
        }, responseTime);
      }
    })
  }

  getUomList() {
    const uomForm = new FormData;
    uomForm.append('uom_id', '');
    uomForm.append('status', 'active');
    this.masterService.getUomList(uomForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.uomList = res[0].uomLists;
        setTimeout(() => {
          $('#task_uom').chosen('destroy');
          if (this.uomId != '') {
            $('#task_uom').val(this.uomId);
          }
          $('#task_uom').chosen();
        }, 1000);
      }
    });
  }

  textWrap() {
    $('#task_dataTable th, #task_dataTable td').toggleClass('full-content');
  }

  addTask() {
    this.taskCard = true;
  }

  uploadTaskImage(event: any) {
    const file = event.target.files[0];
    const ext = file.type;

    switch (ext) {
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
        if (file) {
          const reader = new FileReader();

          reader.onload = (e: any) => {
            const image = new Image();
            image.onload = () => {
              const width = image.width;
              const height = image.height;

              if (width <= 1200 && height <= 600) {
                this.taskImage = file;
                $("#task_image_name").html(this.taskImage.name);
                this.taskImageFile = e.target.result;
                this.taskImageOld = '';

              } else {
                alert('Please upload an image with resolution 1200 x 600.');
              }
            };
            image.src = e.target.result;
          };

          reader.readAsDataURL(file);
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  uploadTaskVideo(event: any) {
    const file = event.target.files[0];
    const ext = file.type;
    const maxSizeMB = 30;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    switch (ext) {
      case 'video/mp4':
      case 'video/m4v':
      case 'video/avi':
      case 'video/mov':
      case 'video/mpg':
      case 'video/mpeg':
        if (file) {
          if (file.size > maxSizeBytes) {
            alert('Please upload a video file smaller than 30MB.');
            return;
          }

          this.taskVideo = file;
          $("#task_video_name").html(this.taskVideo.name);

          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.taskVideoFile = e.target.result;
            $('#task_video_file').attr('src', e.target.result)
          };
          reader.readAsDataURL(this.taskVideo);
          this.taskVideoOld = '';
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  uploadTaskManual(event: any) {
    var ext = event.target.files[0].type;
    switch (ext) {
      case 'application/pdf':
        if (event.target.files && event.target.files[0]) {
          this.taskManual = event.target.files[0];
          $("#task_manual_name").html(this.taskManual.name);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.taskManualFile = e.target.result;
            $('#task_manual_file').attr('src', e.target.result)
          };
          reader.readAsDataURL(this.taskManual);
          this.taskManualOld = '';
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  saveTask() {
    if ($("#task_form").valid()) {
      var task_type = $('#task_type').val();
      var uom = $('#task_uom').val();
      var condition = $('#task_condition').val();

      if (task_type == 'Monitoring' && condition == 'range' && (Number(this.taskMaxValue) <= Number(this.taskMinValue))) {
        this.commonService.toastdata('The Maximum Value is smaller than Minimum Value', 'error');
      } else {
        const taskForm = new FormData;
        taskForm.append('task_id', this.taskId);
        taskForm.append('service_id', this.serviceId);
        taskForm.append('task_type', task_type);
        taskForm.append('task_name', this.taskName);
        taskForm.append('task_description', this.taskDescription);
        taskForm.append('uom_id', uom);
        taskForm.append('condition', condition);
        taskForm.append('value', this.taskMinValue);
        taskForm.append('max_value', this.taskMaxValue);
        taskForm.append('task_image_old', this.taskImageOld);
        taskForm.append('task_image', this.taskImage);
        taskForm.append('task_manual_old', this.taskManualOld);
        taskForm.append('task_manual', this.taskManual);
        taskForm.append('task_video_old', this.taskVideoOld);
        taskForm.append('task_video', this.taskVideo);
        taskForm.append('user_login_id', this.loginId);
        this.masterService.saveTask(taskForm).subscribe((res: any) => {
          if (res.is_error) {
            this.commonService.toastdata(res.message, 'error');
          } else {
            this.commonService.toastdata('Task Saved Successfully', 'success');
            
            this.taskCard = false;
            this.getTaskLists();
            $('#task_type').attr('disabled', null);
            $('.nav-link').removeClass('active');
            $('#task_div').addClass('active');
            $('.tab-pane').removeClass('show active');
            $('#task_detail').addClass('show active');
            this.taskId = '';
            this.createdOn = "";
            this.createdBy = "";
            this.modifiedOn = "";
            this.modifiedBy = "";
            this.serviceId = '';
            this.taskName = '';
            this.taskDescription = '';
            this.taskMinValue = '';
            this.taskMaxValue = '';
            $('#task_type').val('').trigger('chosen:updated');
            $('#task_uom').val('').trigger('chosen:updated');
            $('#task_condition').val('').trigger('chosen:updated');
            $('#task_image').val('');
            $('#task_image_name').text('Choose File');
            this.taskImage = "";
            this.taskImageOld = "placeholder.jpg";
            this.taskImageFile = "assets/images/placeholder.jpg";
            $('#task_video').val('');
            $('#task_video_name').text('Choose File');
            this.taskVideo = "";
            this.taskVideoOld = "dummy.mp4";
            this.taskVideoFile = "assets/images/dummy.mp4";
            $('#task_manual').val('');
            $('#task_manual_name').text('Choose File');
            this.taskManual = "";
            this.taskManualOld = "dummy.pdf";
            this.taskManualFile = "assets/images/dummy.pdf";
          }
        });
      }
    }
  }

  editTask(list: any) {
    this.taskCard = true;
    this.taskId = list.task_id;
    this.serviceId = list.service_id;
    this.taskType = list.task_type;
    this.taskName = list.task_name;
    this.taskDescription = list.task_description;
    this.taskCondition = list.condition;
    this.taskMinValue = list.value;
    this.uomId = list.uom_id;
    this.taskMaxValue = list.max_value
    this.taskImageOld = list.task_image;
    this.taskImageFile = list.task_image_url;
    this.taskVideoOld = list.task_video;
    this.taskVideoFile = list.task_video_url;
    this.taskManualOld = list.task_manual;
    this.taskManualFile = list.task_manual_url;
    this.createdOn = this.datePipe.transform(list.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.createdBy = list.created_user;
    this.modifiedOn = this.datePipe.transform(list.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedBy = list.modified_user;
    $("#task_image_name").html(list.task_image);
    $("#task_video_name").html(list.task_video);
    $("#task_manual_name").html(list.task_manual);
    $('#task_video_file').attr('src', this.taskVideoFile)
    $('#task_manual_file').attr('src', this.taskManualFile)

    $('#task_type').attr('disabled', true);
    $('#task_type').val(this.taskType).trigger('chosen:updated');

    this.taskTypeChange(this.taskType);
    if (this.taskType == "Monitoring") {
      $('#task_condition').val(this.taskCondition).trigger('chosen:updated');
      $('#task_uom').val(this.uomId).trigger('chosen:updated');
      this.taskConditionChange();
    }
  }

  statusTask(task_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('task_id', task_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change the Task status?");
    } else {
      var boolean = confirm("Do you want to delete this Task?");
    }

    if (boolean) {
      this.masterService.changeStatusTask(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.getTaskLists();
        }
      })
    }
  }

  cancel() {
    this.taskCard = false;
    this.getTaskLists();
    $('.nav-link').removeClass('active');
    $('#task_div').addClass('active');
    $('.tab-pane').removeClass('show active');
    $('#task_detail').addClass('show active');
    $('#task_type').attr('disabled', null);
    this.taskId = "";
    this.createdOn = "";
    this.createdBy = "";
    this.modifiedOn = "";
    this.modifiedBy = "";
    this.serviceId = '';
    this.taskName = '';
    this.taskDescription = '';
    this.taskMinValue = '';
    this.taskMaxValue = '';
    $('#task_type').val('').trigger('chosen:updated');
    $('#task_uom').val('').trigger('chosen:updated');
    $('#task_condition').val('').trigger('chosen:updated');
    $('#task_image').val('');
    $('#task_image_name').text('Choose File');
    this.taskImage = "";
    this.taskImageOld = "placeholder.jpg";
    this.taskImageFile = "assets/images/placeholder.jpg";
    $('#task_video').val('');
    $('#task_video_name').text('Choose File');
    this.taskVideo = "";
    this.taskVideoOld = "dummy.mp4";
    this.taskVideoFile = "assets/images/dummy.mp4";
    $('#task_manual').val('');
    $('#task_manual_name').text('Choose File');
    this.taskManual = "";
    this.taskManualOld = "dummy.pdf";
    this.taskManualFile = "assets/images/dummy.pdf";
  }
}
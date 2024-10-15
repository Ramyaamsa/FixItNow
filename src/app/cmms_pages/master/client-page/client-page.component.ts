import { Component } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css']
})
export class ClientPageComponent {
  
  constructor(private router: Router) { }
  ngOnInit() {
    $('.select2').chosen();
  }
}

import { Component, NgZone } from '@angular/core';
import { AutoLogOutService } from 'src/app/cmms_pages/shared_services/auto-log-out.service';
import { IframeCommunicationService } from 'src/app/cmms_pages/shared_services/iframe-communication.service';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css']
})
export class IframeComponent {
  constructor(private _iframeCom: IframeCommunicationService,private ngZone: NgZone,private autoLogOut: AutoLogOutService) { }
  ngOnInit() {
    this._iframeCom.getIframe().subscribe((iframeVariable: any) => {
      if (iframeVariable.tabOpen === 1) {
        window.parent.postMessage(iframeVariable, '*');
      }
    });
  }
}

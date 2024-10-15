import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IframeCommunicationService {

  constructor() { }

  private _iframeVariables = new BehaviorSubject<any>({
    tabName: '',
    tabUrl: '',
    tabOpen: 0
  });
  private _iframeVariables$ =  this._iframeVariables.asObservable();

  getIframe(): Observable<any> {
    return this._iframeVariables$;
  }

  setIframe(latestTab: any) {
    return this._iframeVariables.next(latestTab);
  }

}

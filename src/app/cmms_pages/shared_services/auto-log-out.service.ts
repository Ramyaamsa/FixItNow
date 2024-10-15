import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLogOutService {
  constructor(private router: Router, private ngZone: NgZone) {
    this.lastAction(Date.now());
    this.check();
    this.initListener();
    this.initInterval();
  }

  /**
   * last action
   */
  getLastAction() {
    return localStorage.getItem('lastAction');
  }

  /**
   * set last action
   * @param value
   */
  lastAction(value: any) {
    localStorage.setItem('lastAction', JSON.stringify(value))
  }

  /**
   * start event listener
   */
  initListener() {
    this.ngZone.runOutsideAngular(() => {
      document.body.addEventListener('click', () => this.reset());
    });
  }

  /**
   * time interval
   */
  initInterval() {
    this.ngZone.runOutsideAngular(() => {
      setInterval(() => {
        this.check();
      }, 30000)
    })
  }

  /**
   * reset timer
   */
  reset() {
    this.lastAction(Date.now());
  }

  /**
   * check timer
   */
  check() {
    const now = Date.now();
    const timeLeft = Number(this.getLastAction()) + (120) * 60 * 1000;
    const diff = timeLeft - now;
    const isTimeout = diff < 0;
    this.ngZone.run(() => {
      if (isTimeout) {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['auth']);
      }
    });
  }
}
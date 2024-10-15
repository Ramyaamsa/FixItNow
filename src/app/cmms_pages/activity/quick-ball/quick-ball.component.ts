import { Component } from '@angular/core';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-quick-ball',
  templateUrl: './quick-ball.component.html',
  styleUrls: ['./quick-ball.component.css']
})
export class QuickBallComponent {

  ngOnInit() {
    $(document).ready(() => {
      const nav = $(".quick");
      const quickBall = $(".quick-ball");

      quickBall.on('click', function () {
        nav.toggleClass("open-ball");
      });
    });
  }
}

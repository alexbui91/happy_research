import { Component, OnInit } from '@angular/core';
import {Globals} from '../globals'
@Component({
  templateUrl: 'home.html',
})

export class Home implements OnInit {

  constructor(private globals: Globals) {
    this.globals.isShowingHeader = false
  }

  ngOnInit() {
    
  }
}

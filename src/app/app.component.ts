import { Component } from '@angular/core';

import {Globals} from './globals'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { LoginModal } from './components/login_modal'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'happyresearch';
    
  constructor(private globals: Globals, private rmodal: NgbModal){
    // this.globals.isShowingHeader = true
  }
  goToTop(){
      window.scrollTo(0,0)
  }
  openLoginModal(){
      let rref = this.rmodal.open(LoginModal)
  }
}

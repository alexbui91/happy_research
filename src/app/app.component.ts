import { Component } from '@angular/core';

import {Globals} from './globals'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { LoginModal } from './components/login_modal'
import { Services } from './app.services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'happyresearch';
    conferences: Array<object> = []
  constructor(private globals: Globals, private rmodal: NgbModal, private services: Services){
    this.services.getConferences().subscribe(
        res => {
            let obj = res["confs"]
            for(let x in obj){
                obj[x]["count_down"] = this.countDown(obj[x]["submit_date"])
            }
            this.conferences = obj
            setInterval(() => {
                for(let x in this.conferences){
                    this.conferences[x]["count_down"] = this.countDown(this.conferences[x]["submit_date"])
                }
            }, 1000)
        }
    )
  }
  goToTop(){
      window.scrollTo(0,0)
  }
  openLoginModal(){
      let rref = this.rmodal.open(LoginModal)
  }

  // convert submit date to countdown clock
  countDown(d: string){
    //   console.log(d)
    //   03 months 22h 28m 10s
    let res = ""
    let now = new Date()
    let date = new Date(d)
    let off = (date.getTime() - now.getTime()) / 1000
    if(off <= 0){
        res = "It's over"
    }else{
        let d = off / 86400
        let d_i = Math.floor(d)
        let d_ = ""
        let h = 0
        if(d_i > 0){
            d_ = d_i < 10 ? "0" + d_i : "" + d_i
            h = (d - d_i) * 24
        }else{
            h = off / 3600
        }
        
        let h_i = Math.floor(h)
        let h_ = ""
        if(h_i > 0){
            h_ = h_i < 10 ? "0" + h_i : "" + h_i
            // minutes & seconds remaining
            off = (h - h_i) * 3600
        }

        // minutes         
        let mi = off / 60
        let mi_i = Math.floor(mi)
        let mi_ = ""
        if(mi_i > 0){
            mi_ = mi_i < 10 ? "0" + mi_i : "" + mi_i
            // seconds
            off = (mi - mi_i) * 60
        }
        
        let s = Math.floor(off)
        let s_ = s < 10 ? "0" + s : "" + s

        d_ = d == 1 ? d_ + " day" : d_ + "days"
        res = d_ + " " + h_ + "h " + mi_ + "m " + s_ + "s"
    }
    return res
  }
}

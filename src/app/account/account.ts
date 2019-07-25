import {Component, ViewChild, AfterViewInit} from "@angular/core"
import { Services } from '../app.services'
import { Globals } from '../globals'
import { User } from '../models/user';
import {NgbDatepickerConfig} from '@ng-bootstrap/ng-bootstrap'

@Component({
    templateUrl: "account.html",
})

export class Account{
    
    user: User = new User()
    constructor(private services: Services, private globals: Globals, config: NgbDatepickerConfig){
        this.globals.page_type = 2
        this.getUserInfo()
        window.scrollTo(0,0)
        config.minDate = {year: 1950, month: 1, day: 1}
        config.maxDate = {year: 2050, month: 12, day: 31}
    }
    getUserInfo(){
        this.services.getUserInfo(this.globals.userId).subscribe(
            res => {
                if(res["researcher"]){
                    for(let x in this.user){
                        this.user[x] = res["researcher"][x]
                    }
                    console.log(this.user)
                }
            }
        )
    }
}

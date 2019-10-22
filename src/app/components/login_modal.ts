import { Component, Input} from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { Services } from '../app.services';
import { LoginNoti } from '../models/loginNoti'
import { Globals } from '../globals'

@Component({
    selector: 'login-modal',
    templateUrl: 'login.html'
})
export class LoginModal{
    user: object = {
        username: "",
        password: ""
    }
    loginNoti: LoginNoti = new LoginNoti()

    constructor(public loginModal: NgbActiveModal, private services: Services, private globals: Globals){

    }

    // validate paper submission form
    validatePaper() {
        let b = false
        if(!this.user["username"]){
            this.loginNoti.username = "Please enter your username"
            b = true
        }
        if(!this.user["password"]){
            this.loginNoti.password =  "Please enter your password"
            b = true
        }

        return b
    }

    login(){
        if(!this.validatePaper()){
            this.services.login(this.user).subscribe(
                res => {
                    if(res["token"]){
                        this.globals.token = res["token"]
                        this.globals.userId = res["id"]
                        this.globals.duration = res["duration"]
                        this.globals.fullname = res["fullname"]
                        this.globals.saveToken()
                        this.loginModal.close()
                    }
                },
                error => {
                    alert("Sorry! We cannot verify this user at the moment. Please login later!")
                }
            )
        }
    }
    checkKey(e: any){
        if(e.keyCode == 13){
            this.login()
        }
    }
}
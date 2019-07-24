import {Injectable} from '@angular/core'

@Injectable()
export class Globals{
    isShowingHeader: Boolean = true
    page: string = ''
    userId: string = ''
    token: string = ''
    fullname: string = ""
    duration: number = 600
    key_search_display: String = new String("")
    saveToken(){
        localStorage.setItem("token", this.token)
        localStorage.setItem("userId", this.userId)
        localStorage.setItem("fullname", this.fullname)
        localStorage.setItem("duration", this.duration + "")
    }
    loadToken(){
        this.token = localStorage.getItem("token")
        this.userId = localStorage.getItem("userId")
        this.fullname = localStorage.getItem("fullname")
        this.duration = parseInt(localStorage.getItem("duration"))
    }
}
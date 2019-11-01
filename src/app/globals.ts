import {Injectable} from '@angular/core'

@Injectable()
export class Globals{
    isShowingHeader: Boolean = true
    page: string = ''
    userId: string = ''
    token: string = ''
    username: string = ''
    fullname: string = ""
    duration: number = 600
    page_type: number = 1
    page_class_style : string = ""
    
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

    strimParagraph(para: string){
        let a = para.split(" ")
        let l = a.length > 18 ? 18 : a.length
        a = a.slice(0, l)
        return a.join(" ")
    }
    getPasteText(e: any){
        e.preventDefault()
        let text = e.clipboardData.getData('text/plain')
        document.execCommand("insertHTML", false, text);
    }
}
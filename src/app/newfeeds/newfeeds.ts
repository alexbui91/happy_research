import {Component, OnInit, Input} from "@angular/core"
import { Services } from '../app.services'
import {Paper} from '../models/paper'
import {PaperNotification} from '../models/paper.noti'
import {ResearchModal} from '../components/research'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'

@Component({
    selector: "newfeeds",
    templateUrl: "newfeeds.html",
})

export class NewFeeds{
    viewId: string = ""
    auto: boolean = true
    paper: Paper = new Paper()
    papers: Array<any> = []
    researches: Array<any> = []
    paperNoti: PaperNotification = new PaperNotification()
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals){
        if(this.auto){
            this.getPapers()
        }
        this.services.getResearches().subscribe(
            res => {
                if(res["researches"]){
                    this.researches = res["researches"]
                }
            }
        )
    }

    getPapers(){
        this.services.getNewFeeds(this.viewId).subscribe(
            res => {
                if(res["papers"]){
                    let obj = res["papers"]
                    for(let x in obj){
                        obj[x]["showing_abstract"] = this.strimParagraph(obj[x])
                    }
                    this.papers = obj
                }
            }
        )
    }
    // validate paper submission form
    validatePaper() {
        let b = false
        if(!this.globals.userId || !this.globals.token){
            b = true
        }
        if(!this.paper.title){
            this.paperNoti.title = "Title must not be empty"
            b = true
        }
        if(!this.paper.authors){
            this.paperNoti.authors =  "Authors must not be empty"
            b = true
        }

        if(!this.paper.conference){
            this.paperNoti.conference =  "Conference must not be empty"
            b = true
        }
            
        if(!this.paper.year){
            this.paperNoti.year = "Year of publication must not be empty"
            b = true
        }
            
        let now = new Date().getFullYear()
        if(isNaN(parseInt(this.paper.year + ""))|| this.paper.year < 1960 || this.paper.year > now){
            this.paperNoti.year =  "Year of publication must be from 1960 to now"
            b = true
        }
        if(!this.paper.abstract){
            this.paperNoti.abstract = "Abstract must not be empty"
            b = true
        }
            
        if(this.paper.abstract.length > 10000){
            this.paperNoti.abstract = "Abstract must not exceed 10.000 characters"
            b = true
        }
            
        return b
    }

    // submit summarization
    savePaper(){
        if(!this.validatePaper()){
            this.paper.read_by = this.globals.userId
            let obj = JSON.parse(JSON.stringify(this.paper))
            this.paperNoti = new PaperNotification()
            this.services.submitPaper(obj).subscribe(
                res => {
                    if(res["num_row"] == '1'){
                        this.synchronizeLocalPaper(this.paper)
                        this.paper = new Paper()
                    }
                }
            )
        }
    }

    synchronizeLocalPaper(p: Paper){
        this.getPapers()
    }
    // strim shorter paragraph to display
    showMore(p: any){
        p["showing_abstract"] = this.strimParagraph(p)
        p["active"] = !p["active"]
    }
    strimParagraph(p: any){
        if(!p["strim_abstract"]){
            let para = p["abstract"]
            let a = para.split(" ")
            let l = a.length > 18 ? 18 : a.length
            a = a.slice(0, l)
            p["strim_abstract"] = a.join(" ")
        }
        if(!p["active"])
            return p["strim_abstract"]
        return p["abstract"]
    }

    openResearchModal(){
        const modalRef = this.rmodal.open(ResearchModal)
    }
    // load more papers
    loadMore(){

    }
    removePaper(idx: number, p: any){
        let read_by = p["read_by"]
        let id = p["id"]
        let uid = p["read_by"]
        if(!p["clicked_delete"] && read_by == parseInt(this.globals.userId)){
            p["clicked_delete"] = true
            this.services.removePaper(id, uid).subscribe(
                res => {
                    if(!res["error"]){
                        this.papers.splice(idx, 1)
                    }else{
                        p["clicked_delete"] = false
                    }
                },
                error => {
                    p["clicked_delete"] = false
                }
            )
        }
    }

    editPaper(idx: number, p: any, read_by: string){
        if(read_by == this.globals.userId){
        }
    }

    viewMoreComments(p: any){
        this.services.loadComments(p.id
            ).subscribe(
            res => {
                if(res["comments"]){
                    p.list_comments = res["comments"]
                }
            }
        )
    }
    commentKeyDown(p: any, e: any){
        if(!e.shiftKey && e.keyCode == 13){
            e.preventDefault()
            this.createComment(p)
        }else if(e.shiftKey && e.keyCode == 13){
            console.log("shift enter")
        }
    }
    createComment(p: any){
        if(p.newComment){
            let d = new Date()
            this.services.createComment(this.globals.userId, p.id, p.newComment).subscribe(
                res => {
                    if(res["id"]){
                        let obj = {
                            id: res["id"],
                            comment: p.newComment,
                            researcher_id: this.globals.userId,
                            fullname: this.globals.fullname,
                            paper_id: p.id
                        }
                        if(!p["list_comments"]){
                            p["list_comments"] = [obj]
                        }else{
                            p["list_comments"].splice(0,0,obj)
                        }
                        p.newComment = ""
                    }
                }
            )
        }
    }
    editComment(c: any){
        if(this.globals.userId == c.researcher_id){
            c.is_edit = true
        }
    }
    editCommentAction(e: any, c: any){
        if(!e.shiftKey && e.keyCode == 13){
            e.preventDefault()
            this.services.updateComment(this.globals.userId, c.paper_id, c.id, c.comment).subscribe(
                res => {
                    if(res["id"])
                        c.is_edit = false
                }
            )
        }
    }
    removeComment(i: number, p: any, c: any){
        if(this.globals.userId == c.researcher_id){
            this.services.removeComment(this.globals.userId, c.paper_id, c.id).subscribe(
                res => {
                    if(res["num_row"] )
                        p["list_comments"].splice(i, 1)
                }
            )
        }
    }
}
import {Component, OnInit, Input, ViewChild, ElementRef, Inject} from "@angular/core"
import { Services } from '../app.services'
import {Paper} from '../models/paper'
import {PaperNotification} from '../models/paper.noti'
import {ResearchModal} from '../components/research'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'
import { DOCUMENT } from '@angular/common';

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
    abstract_display: String = new String("")
    comment_display: String = new String("")
    conferences: Array<object> = []
    paperNoti: PaperNotification = new PaperNotification()
    @ViewChild("title", {static: false}) title: ElementRef;
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals){
        if(this.auto){
            this.getPapers()
        }
        this.services.getResearches().subscribe(
            res => {
                if(res[0]["researches"]){
                    this.researches = res[0]["researches"]
                }
            }
        )
        window.scrollTo(0,0)
    }
    autoCompleteConf(e: any){
        this.services.autoCompleteConf(e.target.value).subscribe(
            res => {
                this.conferences = res["confs"]
            }
        )
    }
    // get papers with user id or get all papers
    getPapers(){
        this.services.getNewFeeds(this.viewId).subscribe(
            res => {
                if(res["papers"]){
                    let obj = res["papers"]
                    for(let x in obj){
                        obj[x]["strim_abstract"] = this.globals.strimParagraph(obj[x]["abstract"])
                        obj[x]["showing_abstract"] = obj[x]["strim_abstract"]
                    }
                    this.papers = obj
                }
            }
        )
    }
    setPapers(papers: Array<any>){
        this.papers = papers
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
            if(obj.id){
                this.services.updatePaper(obj).subscribe(
                    res => {
                        if(res["id"]){
                            this.synchronizeLocalPaper(this.paper)
                            this.paper = new Paper()
                            this.abstract_display = new String("")
                            this.comment_display = new String("")
                        }
                    }
                )
            }else{
                this.services.submitPaper(obj).subscribe(
                    res => {
                        if(res["id"]){
                            this.synchronizeLocalPaper(this.paper)
                            this.paper = new Paper()
                            this.abstract_display = new String("")
                            this.comment_display = new String("")
                        }
                    }
                )
            }
            
        }
    }

    synchronizeLocalPaper(p: Paper){
        this.getPapers()
    }

    openResearchModal(){
        const modalRef = this.rmodal.open(ResearchModal)
    }

    editPaper(idx: number, p: any){
        if(p.read_by == this.globals.userId){
            for(let x in this.paper){
                this.paper[x] = p[x]
                this.abstract_display = p["abstract"]
                this.comment_display = p["comments"]
                this.title.nativeElement.focus()
            }
        }
    }

    cancelEditPaper(){
        this.paper = new Paper()
        this.abstract_display = new String("")
        this.comment_display = new String("")
    }
    // strim shorter paragraph to display
    // showMore(p: any){
    //     p["showing_abstract"] = this.strimParagraph(p)
    //     p["active"] = !p["active"]
    // }
    
    // strimParagraph(p: any){
    //     if(!p["strim_abstract"]){
    //         let para = p["abstract"]
    //         let a = para.split(" ")
    //         let l = a.length > 18 ? 18 : a.length
    //         a = a.slice(0, l)
    //         p["strim_abstract"] = a.join(" ")
    //     }
    //     if(!p["active"])
    //         return p["strim_abstract"]
    //     return p["abstract"]
    // }
    
    // removePaper(idx: number, p: any){
    //     let read_by = p["read_by"]
    //     let id = p["id"]
    //     let uid = p["read_by"]
    //     if(!p["clicked_delete"] && read_by == parseInt(this.globals.userId)){
    //         p["clicked_delete"] = true
    //         this.services.removePaper(id, uid).subscribe(
    //             res => {
    //                 if(!res["error"]){
    //                     this.papers.splice(idx, 1)
    //                 }else{
    //                     p["clicked_delete"] = false
    //                 }
    //             },
    //             error => {
    //                 p["clicked_delete"] = false
    //             }
    //         )
    //     }
    // }

    // comment part

    // viewMoreComments(p: any){
    //     this.services.loadComments(p.id
    //         ).subscribe(
    //         res => {
    //             if(res["comments"]){
    //                 let obj = res["comments"]
    //                 for(let x in obj){
    //                     obj[x]["calculated_time"] = this.calculate_time(obj[x]["contribution_date"])
    //                 }
    //                 p.list_comments = obj
    //             }
    //         }
    //     )
    // }

    // calculate_time(time: string){
    //     let now = new Date()
    //     let d = new Date(time)
    //     // get seconds offset
    //     let off = (now.getTime() - d.getTime()) / 1000
    //     let tmp = Math.floor(off / 60)
    //     let res = ""
    //     if(tmp < 60)
    //         res = "min"
    //     else{
    //         tmp = Math.floor(off / 3600)
    //         if(tmp < 24)
    //             res = "hour"
    //         else{
    //             res = ""
    //         }
    //     }
    //     if(!res){
    //         // larger than 24h
    //         res = time
    //     }else{
    //         res = tmp + " " + res
    //         if(tmp > 1)
    //             res += "s"
    //     }
    //     return res
    // }

    // calculate_datetime(time: Date){

    // }

    // commentKeyDown(p: any, e: any){
    //     if(!e.shiftKey && e.keyCode == 13){
    //         e.preventDefault()
    //         this.createComment(p)
    //     }else if(e.shiftKey && e.keyCode == 13){
    //         console.log("shift enter")
    //     }
    // }
    // createComment(p: any){
    //     if(p.newComment){
    //         let d = new Date()
    //         this.services.createComment(this.globals.userId, p.id, p.newComment).subscribe(
    //             res => {
    //                 if(res["id"]){
    //                     let obj = {
    //                         id: res["id"],
    //                         comment: p.newComment,
    //                         researcher_id: this.globals.userId,
    //                         fullname: this.globals.fullname,
    //                         paper_id: p.id
    //                     }
    //                     if(!p["list_comments"]){
    //                         p["list_comments"] = [obj]
    //                     }else{
    //                         p["list_comments"].splice(0,0,obj)
    //                     }
    //                     p.newComment = ""
    //                     p.comment = new String("")
    //                 }
    //             }
    //         )
    //     }
    // }
    // editComment(paper_id: string, c: any){
    //     if(this.globals.userId == c.researcher_id){
    //         c.is_edit = true
    //         c.edited_comment = c.comment
    //         setTimeout(
    //             ()=>{
    //                 document.getElementById("comment_" + paper_id + "_" + c.id).focus()
    //             }
    //             ,100)
    //     }
    // }
    // editCommentAction(i: number, e: any, c: any, p: any){
    //     if(!e.shiftKey && e.keyCode == 13){
    //         e.preventDefault()
    //         if(!c.edited_comment){
    //             this.removeComment(i, p, c)
    //         }else{
    //             console.log(c.edited_comment)
    //             c.comment = c.edited_comment
    //             c.edited_comment = ""
    //             this.services.updateComment(this.globals.userId, c.paper_id, c.id, c.comment).subscribe(
    //                 res => {
    //                     if(res["id"])
    //                         c.is_edit = false
    //                 }
    //             )
    //         }
    //     }
    // }
    // removeComment(i: number, p: any, c: any){
    //     if(this.globals.userId == c.researcher_id){
    //         this.services.removeComment(this.globals.userId, c.paper_id, c.id).subscribe(
    //             res => {
    //                 if(res["num_row"] )
    //                     p["list_comments"].splice(i, 1)
    //             }
    //         )
    //     }
    // }
}
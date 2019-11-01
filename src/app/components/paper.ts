import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Paper } from '../models/paper';
import { Globals } from '../globals';
import { Services } from '../app.services';
import { Router } from '@angular/router';
@Component({
    selector: 'paper',
    templateUrl: 'paper.html'
})
export class PaperComponent {
    @Input() info : Paper;
    @Input() papers: any;
    @Input("showmore") is_showmore: boolean = true
    @Output() onEdit: EventEmitter<any> = new EventEmitter()

    constructor(private globals: Globals, private services: Services, private route: Router){
    }

    // strim shorter paragraph to display
    showMore(p: any){
        p["active"] = !p["active"]
        p["showing_abstract"] = this.strimParagraph(p)
    }
    strimParagraph(p: any){
        if(!p["active"])
            return p["strim_abstract"]
        return p["abstract"]
    }

    editPaper(i: number, info: Paper){
        this.onEdit.emit([i, info])
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
                        if(this.papers)
                            this.papers.splice(idx, 1)
                        else
                            this.route.navigate(["/newfeeds"])
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

    viewMoreComments(p: any){
        this.services.loadComments(p.id
            ).subscribe(
            res => {
                if(res["comments"]){
                    let obj = res["comments"]
                    for(let x in obj){
                        obj[x]["calculated_time"] = this.calculate_time(obj[x]["contribution_date"])
                    }
                    p.list_comments = obj
                }
            }
        )
    }

    calculate_time(time: string){
        let now = new Date()
        let d = new Date(time)
        // get seconds offset
        let off = (now.getTime() - d.getTime()) / 1000
        let tmp = Math.floor(off / 60)
        let res = ""
        if(tmp < 60)
            res = "min"
        else{
            tmp = Math.floor(off / 3600)
            if(tmp < 24)
                res = "hour"
            else{
                res = ""
            }
        }
        if(!res){
            // larger than 24h
            res = time
        }else{
            res = tmp + " " + res
            if(tmp > 1)
                res += "s"
        }
        return res
    }

    calculate_datetime(time: Date){

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
                        p.comment = new String("")
                    }
                }
            )
        }
    }
    editComment(paper_id: string, c: any){
        if(this.globals.userId == c.researcher_id){
            c.is_edit = true
            c.edited_comment = c.comment
            setTimeout(
                ()=>{
                    document.getElementById("comment_" + paper_id + "_" + c.id).focus()
                }
                ,100)
        }
    }
    editCommentAction(i: number, e: any, c: any, p: any){
        if(!e.shiftKey && e.keyCode == 13){
            e.preventDefault()
            if(!c.edited_comment){
                this.removeComment(i, p, c)
            }else{
                console.log(c.edited_comment)
                c.comment = c.edited_comment
                c.edited_comment = ""
                this.services.updateComment(this.globals.userId, c.paper_id, c.id, c.comment).subscribe(
                    res => {
                        if(res["id"])
                            c.is_edit = false
                    }
                )
            }
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
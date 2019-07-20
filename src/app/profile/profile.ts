import {Component, OnInit} from "@angular/core"
import { Services } from '../app.services'
import {Paper} from '../models/paper'
import {PaperNotification} from '../models/paper.noti'
import {ResearchModal} from '../components/research'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    templateUrl: "profile.html",
})

export class Profile implements OnInit{
    
    view_id : string = ""
    papers: Array<any> = []
    paperNoti: PaperNotification = new PaperNotification()
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals, private route: ActivatedRoute){
        this.route.params.subscribe((params: Params) => {
            this.view_id = params["id"]
            this.services.getProfileFeeds(this.view_id).subscribe(
                res => {
                    if(res["papers"]){
                        this.papers = res["papers"]
                    }
                }
            )
        })
    }
    ngOnInit(){
    }

    // strim shorter paragraph to display
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
}
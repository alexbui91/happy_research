import {Component, OnInit} from "@angular/core"
import { Services } from '../app.services'
import {Paper} from '../models/paper'
import {PaperNotification} from '../models/paper.noti'
import {ResearchModal} from '../components/research'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'

@Component({
    templateUrl: "newfeeds.html",
})

export class NewFeeds implements OnInit{
    
    paper: Paper = new Paper()
    papers: Array<any> = []
    researches: Array<any> = []
    paperNoti: PaperNotification = new PaperNotification()
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals){
        this.services.getNewFeeds().subscribe(
            res => {
                if(res["papers"]){
                    this.papers = res["papers"]
                }
            }
        )
        this.services.getResearches().subscribe(
            res => {
                if(res["researches"]){
                    this.researches = res["researches"]
                }
            }
        )
    }
    ngOnInit(){
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
        let obj = JSON.parse(JSON.stringify(this.paper))
        if(!this.validatePaper()){
            this.paper.read_by = this.globals.userId
            this.paperNoti = new PaperNotification()
            this.services.submitPaper(obj).subscribe(
                res => {
                    if(res["success"] == 'true'){
                        this.paper = new Paper()
                    }
                }
            )
        }
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
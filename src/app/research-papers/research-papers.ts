import {Component, ViewChild, AfterViewInit} from "@angular/core"
import { Services } from '../app.services'
import {PaperNotification} from '../models/paper.noti'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'
import { ActivatedRoute, Params } from '@angular/router'
import { NewFeeds } from '../newfeeds/index'
import { Research } from '../models/research';

@Component({
    templateUrl: "research-papers.html",
})

// show papers by research
export class ResearchPapers implements AfterViewInit{
    
    view_id : string = "" // research_id
    research: Research = new Research()
    @ViewChild(NewFeeds, {static: false}) newfeeds: NewFeeds
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals, private route: ActivatedRoute){
        this.route.params.subscribe((params: Params) => {
            this.view_id = params["id"]
        })
        window.scrollTo(0,0)
    }

    ngAfterViewInit(){
        this.newfeeds.auto = false
        this.newfeeds.viewId = this.view_id
        this.services.getResearchPapers(this.view_id).subscribe(
            res => {
                if(res){
                    this.newfeeds.setPapers(res[1]["papers"])
                    let obj = res[0]["researches"][0]
                    for(let x in obj){
                        this.research[x] = obj[x]
                    }
                    
                    this.newfeeds.paper.research_id = parseInt(this.view_id)
                }
            }
        )
    }

}
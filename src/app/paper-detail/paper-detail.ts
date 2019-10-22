import {Component, ViewChild, AfterViewInit} from "@angular/core"
import { Services } from '../app.services'
import { Globals } from '../globals'
import { ActivatedRoute, Params } from '@angular/router'
import { NewFeeds } from '../newfeeds/index'
import { Paper } from '../models/paper';

@Component({
    templateUrl: "paper-detail.html",
})

export class PaperDetail implements AfterViewInit{
    
    paper_id : string = ""
    paper:  Paper = new Paper()
    @ViewChild(NewFeeds, {static: false}) newfeeds: NewFeeds
    constructor(private services: Services, private globals: Globals, private route: ActivatedRoute){
        this.route.params.subscribe((params: Params) => {
            this.paper_id = params["id"]
        })
        window.scrollTo(0,0)
    }

    ngAfterViewInit(){
        this.services.getPaperById(this.paper_id).subscribe(
            res => {
                if(res["paper"]){
                    let obj = res["paper"]
                    for(let x in obj){
                        this.paper[x] = obj[x]
                    }
                    this.paper["active"] = true
                    this.paper["showing_abstract"] = this.paper.abstract
                }
            }
        )
    }

}
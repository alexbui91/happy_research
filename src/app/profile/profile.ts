import {Component, ViewChild, AfterViewInit} from "@angular/core"
import { Services } from '../app.services'
import {PaperNotification} from '../models/paper.noti'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import { Globals } from '../globals'
import { ActivatedRoute, Params } from '@angular/router'
import { NewFeeds } from '../newfeeds/index'

@Component({
    templateUrl: "profile.html",
})

export class Profile implements AfterViewInit{
    
    view_id : string = ""
    user: object = {}
    @ViewChild(NewFeeds, {static: false}) newfeeds: NewFeeds
    constructor(private services: Services, private rmodal: NgbModal, private globals: Globals, private route: ActivatedRoute){
        this.route.params.subscribe((params: Params) => {
            this.view_id = params["id"]
            this.services.getUserInfo(this.view_id).subscribe(
                res => {
                    this.user["id"] = res["researcher"]["id"]
                    this.user["fullname"] = res["researcher"]["fullname"]
                }
            )
        })
        window.scrollTo(0,0)
    }

    ngAfterViewInit(){
        this.newfeeds.auto = false
        this.newfeeds.viewId = this.view_id
        this.newfeeds.getPapers()
    }

}
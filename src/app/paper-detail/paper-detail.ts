import {Component, ViewChildren, AfterViewInit, QueryList} from "@angular/core"
import { Services } from '../app.services'
import { Globals } from '../globals'
import { ActivatedRoute, Params } from '@angular/router'
import { Paper } from '../models/paper';
import { PaperForm } from '../components/form-paper'

@Component({
    templateUrl: "paper-detail.html",
})

export class PaperDetail implements AfterViewInit{
    
    paper_id : string = ""
    paper:  Paper = new Paper()
    @ViewChildren(PaperForm) paper_form: QueryList<PaperForm> 
    
    isShowEditForm: Boolean = false


    constructor(private services: Services, private globals: Globals, private route: ActivatedRoute){
        this.route.params.subscribe((params: Params) => {
            this.paper_id = params["id"]
        })
        window.scrollTo(0,0)
        this.globals.page_class_style = "paper-detail"
    }

    editPaper(x, y){
        this.isShowEditForm = true
        setTimeout(() => {
            if(this.paper_form){
                this.paper_form.last.title.nativeElement.focus()
            }
        }, 500);
        this.paper = y
    }

    ngAfterViewInit(){
        this.paper_form.changes.subscribe((obj: QueryList<PaperForm>) => {
            setTimeout(() => {
                obj.last.abstract_display = obj.last.paper.abstract
                obj.last.comment_display = obj.last.paper.comments      
            }, 100);
        })
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
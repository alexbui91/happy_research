import {Component} from "@angular/core"
import { Services } from '../app.services'
import { Globals } from '../globals'
import { NgbModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { ResearchModal } from '../components/research';
import { Research } from '../models/research';
import { NgModel } from '@angular/forms';

@Component({
    templateUrl: "researches.html",
})

export class Researches{
    
    researches : Array<any> = new Array<any>()
    constructor(private services: Services, private globals: Globals, private rmodal: NgbModal){
        this.globals.page_type = 2
        this.loadResearches()
    }
    loadResearches(){
        this.services.getResearches().subscribe(
            res => {
                this.researches = res[0]["researches"]
                console.log(this.researches)
            }
        )
    }
    edit(i: number, created_by: string){
        if(this.globals.userId != created_by)
            return
        const modal = this.rmodal.open(ResearchModal)
        modal.componentInstance.edit_index = i
        let res = new Research()
        for(let x in this.researches[i]){
            res[x] = this.researches[i][x]
        }
        if(res["start_date"]){
            let sd = new Date(res["start_date"])
            let start_date = new NgbDate(sd.getFullYear(), sd.getMonth()+1, sd.getDate())
            modal.componentInstance.startDate = start_date
        }
        
        if(res["end_date_plan"]){
            let ed = new Date(res["end_date_plan"])
            let end_date = new NgbDate(ed.getFullYear(), ed.getMonth()+1, ed.getDate())
            modal.componentInstance.endDate = end_date
        }
        modal.componentInstance.research = res
        modal.result.then((data)=>{
            this.researches[data["index"]] = data["obj"]
            console.log(this.researches[data["index"]])
        },()=>{})
    }

    delete(i: number, id: number, created_by: string){
        if(this.globals.userId != created_by)
            return
        this.services.removeResearch(id, this.globals.userId).subscribe(
            res => {
                if(res["num_row"]){
                    this.researches.splice(i, 1)
                }
            }
        )
    }

    create(){
        const modal = this.rmodal.open(ResearchModal)
        modal.result.then((data) => {
            console.log(data)
            this.researches.splice(0,0,data["obj"])
        }, ()=>{

        })
    }
}
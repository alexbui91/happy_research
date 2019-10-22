import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Research } from '../models/research'
import { ResearchNoti } from '../models/research.noti';
import { Services } from '../app.services';
import { Globals } from '../globals';
@Component({
    selector: 'ngbd-modal-content',
    templateUrl: 'research_modal.html'
})
export class ResearchModal {
    // @Input() name;
    research: Research = new Research()
    startDate: NgbDateStruct
    endDate: NgbDateStruct
    researchNoti: ResearchNoti = new ResearchNoti()
    edit_index : number = -1
    constructor(public activeModal: NgbActiveModal, private services: Services, private globals: Globals) {

    }

    getBase10(d: number) {
        if (d < 10)
            return "0" + d
        return d + ""
    }
    getDate(d: any) {
        if (!d || !d["year"])
            return ""
        let res = this.getBase10(d["year"]) + "/"
            + this.getBase10(d["month"]) + "/"
            + this.getBase10(d["day"])
        return res
    }
    validatePaper() {
        let b = false
        if (!this.globals.userId || !this.globals.token) {
            b = true
        }
        if (!this.research.name) {
            this.researchNoti.name = "Name must not be empty"
            b = true
        }
        if (!this.research.goals) {
            this.researchNoti.goals = "Goals must not be empty"
            b = true
        }
        
        if (this.startDate && this.endDate) {
            let st = new Date(this.getDate(this.startDate))
            let ed = new Date(this.getDate(this.endDate))
            if (st.getTime() > ed.getTime()) {
                this.researchNoti.start_date = "End date must be larger than start date"
                b = true
            } else {
                this.researchNoti.start_date = ""
            }
        } else {
            this.researchNoti.start_date = ""
        }
        if (!this.startDate) {
            this.researchNoti.start_date = "Start date must not be empty"
            b = true
        }
        return b
    }
    saveResearch() {
        let b = this.validatePaper()
        if (!b) {
            this.research.created_by = this.globals.userId
            this.research.start_date = this.getDate(this.startDate)
            this.research.end_date_plan = this.getDate(this.endDate)
            this.researchNoti = new ResearchNoti()
            let name = JSON.parse(JSON.stringify(this.research))
            if(this.research.id){
                this.services.editResearch(this.research).subscribe(
                    res => {
                        if (res["id"]) {
                            name["id"] = res["id"]
                            this.research = new Research()
                            this.activeModal.close({index: this.edit_index, obj: name})
                        }
                    }
                )
            }else{
                this.services.saveResearch(this.research).subscribe(
                    res => {
                        if (res["id"]) {
                            name["id"] = res["id"]
                            this.research = new Research()
                            this.activeModal.close({obj: name})
                        }
                    }
                )
            }
        }
    }
}
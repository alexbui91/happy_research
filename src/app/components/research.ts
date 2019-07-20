import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Research} from '../models/research'
import { ResearchNoti } from '../models/research.noti';
import { Services } from '../app.services';
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'research_modal.html'
})
export class ResearchModal {
    @Input() name;
    research: Research = new Research()
    startDate: object = {}
    endDate: object = {}
    researchNoti : ResearchNoti = new ResearchNoti()
    constructor(public activeModal: NgbActiveModal, private services: Services) {

    }

    getBase10(d: number){
      if(d < 10)
        return "0" + d
      return d + ""
    }
    getDate(d: any){
      if(!d || !d["year"])
        return ""
      let res = this.getBase10(d["year"]) + "/" 
              + this.getBase10(d["month"]) + "/" 
              + this.getBase10(d["day"])
      return res
    }
    validatePaper() {
      let b = false
      if(!this.research.name){
          this.researchNoti.name = "Name must not be empty"
          b = true
      }
      if(!this.research.goals){
          this.researchNoti.goals =  "Goals must not be empty"
          b = true
      }   
      if(this.startDate && this.endDate){
          let st = new Date(this.getDate(this.startDate))
          let ed = new Date(this.getDate(this.endDate))
          if(st.getTime() > ed.getTime()){
            this.researchNoti.start_date =  "End date must be larger than start date"
            b = true
          }else{
            this.researchNoti.start_date = ""
          }
      }else{
        this.researchNoti.start_date = ""
      }
      return b
  }
    saveResearch(){
      let b = this.validatePaper()
      if(!b){
        this.research.start_date = this.getDate(this.startDate)
        this.research.end_date_plan = this.getDate(this.startDate)
        this.researchNoti = new ResearchNoti()
        this.services.saveResearch(this.research).subscribe(
          res => {
              if(res["success"] == 'true'){
                  this.research = new Research()
              }
          }
        )
      }
    }
}
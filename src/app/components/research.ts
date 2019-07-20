import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Research} from '../models/research'
import { ResearchNoti } from '../models/research.noti';
@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'research_modal.html'
})
export class ResearchModal {
    @Input() name;
    research: Research = new Research()
    researchNoti : ResearchNoti = new ResearchNoti()
    constructor(public activeModal: NgbActiveModal) {

    }
}
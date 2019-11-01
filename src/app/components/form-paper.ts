import { Input, Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Paper } from '../models/paper';
import { Globals } from '../globals';
import { Services } from '../app.services';
import { Router } from '@angular/router';
import { PaperNotification } from '../models/paper.noti';
import {ResearchModal} from '../components/research'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'form-paper',
    templateUrl: 'form-paper.html'
})

export class PaperForm {
    @Input() paper: Paper;
    @Input() papers: any;
    @Output() afterEdit: EventEmitter<any> = new EventEmitter()
    @Output() cancelEdit: EventEmitter<any> = new EventEmitter()

    researches: Array<any> = []
    conferences: Array<object> = []
    isShowConfSearch: boolean = false
    abstract_display: String = new String("")
    comment_display: String = new String("")

    paperNoti: PaperNotification = new PaperNotification()
    
    @ViewChild("title", {static: false}) title: ElementRef;
    
    constructor(private globals: Globals, private rmodal: NgbModal, private services: Services, private route: Router){
        this.services.getResearches().subscribe(
            res => {
                if(res[0]["researches"]){
                    this.researches = res[0]["researches"]
                }
            }
        )
    }

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
    }
    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
    }
    
    openResearchModal(){
        const modalRef = this.rmodal.open(ResearchModal)
        modalRef.result.then((data) => {
            this.researches.splice(0, 0, data["obj"])
        }, ()=>{})
    }

    cancelEditPaper(){
        this.paper = new Paper()
        this.abstract_display = new String("")
        this.comment_display = new String("")
        this.cancelEdit.emit()
    }

    autoCompleteConf(e: any){
        let s = e.target.value.trim().toLowerCase()
        this.services.autoCompleteConf(s).subscribe(
            res => {
                let obj = res["confs"]
                obj = obj as any[]
                if(obj.length > 20){
                    obj.splice(20, obj.length - 20)
                    this.conferences = obj
                }else
                    this.conferences = obj 
            }
        )
    }
    confOut(){
        setTimeout(()=>{
            this.isShowConfSearch = false
        }, 500)
    }
    confIn(){
        this.isShowConfSearch = true
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
        if(!this.validatePaper()){
            this.paper.read_by = this.globals.userId
            let obj = JSON.parse(JSON.stringify(this.paper))
            this.paperNoti = new PaperNotification()
            if(obj.id){
                this.services.updatePaper(obj).subscribe(
                    res => {
                        if(res["id"]){
                            this.afterEdit.emit([0, this.paper])
                            this.paper = new Paper()
                            this.abstract_display = new String("")
                            this.comment_display = new String("")
                        }
                    }
                )
            }else{
                this.services.submitPaper(obj).subscribe(
                    res => {
                        if(res["id"]){
                            this.afterEdit.emit([0, this.paper])
                            this.paper = new Paper()
                            this.abstract_display = new String("")
                            this.comment_display = new String("")
                        }
                    }
                )
            }
            
        }
    }

    toProject(){
        if(this.paper.comments != "" || this.paper.abstract != ""){
            const user_appr = window.confirm("Are you sure to quit?")
            if(user_appr){
                this.route.navigate(["/researches"])
            }
        }else{
            this.route.navigate(["/researches"])
        }
    }
}
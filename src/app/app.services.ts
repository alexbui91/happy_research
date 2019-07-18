import {Injectable} from '@angular/core'
import  {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
}

@Injectable({ providedIn: 'root' })
export class Services{
    private url = 'http://147.47.206.14:5000/api/v1'

    constructor(private http: HttpClient){

    }

    submitPaper(data: object){
        return this.http.post(this.url + "/paper" + "/0", data)
    }
    getNewFeeds(){
        return this.http.get(this.url + "/papers")
    }
}
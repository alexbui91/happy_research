import {Injectable} from '@angular/core'
import  {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
}

@Injectable({ providedIn: 'root' })
export class Services{
    private url = 'http://147.46.89.141:38500/api/v1'
    private headers: Headers = new Headers({'Content-Type': 'application/json'});
    constructor(private http: HttpClient){

    }

    submitPaper(data: object){
        return this.http.post(this.url + "/paper/0", data)
    }
    removePaper(id: string, uid: string){
        console.log(uid)
        let params = new HttpParams()
        params = params.append("read_by", uid)
        let options = {params: params, headers: httpOptions.headers}
        return this.http.delete(this.url + "/paper/" + id, options)
    }
    getNewFeeds(id: string){
        let path = this.url + "/papers"
        if(id)
            path += "/" + id
        return this.http.get(path)
    }

    login(data: object){
        let authen = data["username"] + ":" + data["password"];
        httpOptions.headers = new HttpHeaders({'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(authen)});
        return this.http.post(this.url + "/token", data, {"headers": httpOptions.headers})
    }
    checkToken(data: object){
        return this.http.post(this.url + "/token", data)
    }
    logout(data: object){
        return this.http.post(this.url + "/", data)
    }
    
    getConferences(){
        return this.http.get(this.url + "/conf")
    }

    saveResearch(data: object){
        return this.http.post(this.url + "/research/0", data)
    }
    getResearches(){
        return this.http.get(this.url + "/research/0")
    }
    getUserInfo(id: string){
        return this.http.get(this.url + "/researcher/" + id)
    }
}
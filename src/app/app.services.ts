import {Injectable} from '@angular/core'
import  {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http'

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json', "username": 'duclv', 'password': '123456'})
}

@Injectable({ providedIn: 'root' })
export class Services{
    private url = 'http://147.46.89.141:38500/api/v1'
    private headers: Headers = new Headers({'Content-Type': 'application/json'});
    constructor(private http: HttpClient){

    }

    submitPaper(data: object){
        return this.http.post(this.url + "/paper" + "/0", data)
    }
    getNewFeeds(){
        return this.http.get(this.url + "/papers")
    }

    getProfileFeeds(id: string){
        return this.http.get(this.url + "/papers/" + id)
    }
    login(data: object){
        // let params = new HttpParams();
        // params = params.append('username', "duclv");
        // params = params.append('password', "123456");
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
}
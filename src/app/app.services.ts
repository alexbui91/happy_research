import {Injectable} from '@angular/core'
import  {HttpClient, HttpHeaders, HttpParams, HttpRequest} from '@angular/common/http'
import { encode } from 'punycode';

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
}

@Injectable({ providedIn: 'root' })
export class Services{
    private url = 'http://147.47.206.14:38500/api/v1'
    private headers: Headers = new Headers({'Content-Type': 'application/json'});
    constructor(private http: HttpClient){

    }

    submitPaper(data: object){
        return this.http.post(this.url + "/paper/0", data)
    }
    updatePaper(data: object){
        return this.http.post(this.url + "/paper/" + data["id"], data)
    }
    removePaper(id: string, uid: string){
        let options = {body: {read_by: parseInt(uid)}, headers: httpOptions.headers}
        return this.http.delete(this.url + "/paper/" + id, options)
    }
    getNewFeeds(id: string){
        let path = this.url + "/papers"
        if(id)
            path += "/" + id
        return this.http.get(path)
    }
    getPaperById(id: string){
        return this.http.get(this.url + "/paper/" + id)
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

    removeResearch(id: number, uid: string){
        let options = {body: {id: id, created_by: uid}, headers: httpOptions.headers}
        return this.http.delete(this.url + "/research/" + id, options)
    }

    editResearch(data: object){
        return this.http.post(this.url + "/research/" + data["id"], data)
    }

    getResearches(){
        return this.http.get(this.url + "/research/0")
    }
    getUserInfo(id: string){
        return this.http.get(this.url + "/researcher/" + id)
    }
    loadComments(id: string){
        return this.http.get(this.url + "/comment/" + id)
    }
    createComment(user_id: string, paper_id: string, comment: string){
        return this.http.post(this.url + "/comment/0", {paper_id: paper_id, user_id: user_id, comment: comment})
    }
    updateComment(user_id: string, paper_id: string, comment_id: string, comment: string){
        return this.http.post(this.url + "/comment/0", {paper_id: paper_id, user_id: user_id, comment: comment, comment_id: comment_id})
    }
    removeComment(user_id: string, paper_id: string, comment_id: string){
        let options = {body: {comment_id: comment_id, paper_id: paper_id, user_id: user_id}, headers: httpOptions.headers}
        return this.http.delete(this.url + "/comment/0", options)
    }
    // autocomplete conference name by key words
    autoCompleteConf(key: string){
        return this.http.get(this.url + "/conf/search/"+encodeURI(key))
    }
    // overall search by key words
    search(key: string){
        return this.http.get(this.url + "/paper/search/" + encodeURI(key))
    }
    // get all papers by research
    getResearchPapers(id: string){
        return this.http.get(this.url + "/research/" + id)
    }
}
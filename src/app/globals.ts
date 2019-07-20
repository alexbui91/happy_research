import {Injectable} from '@angular/core'

@Injectable()
export class Globals{
    isShowingHeader: Boolean = true
    page: string = ''
    userId: string = ''
    token: string = ''
    duration: number = 600
}
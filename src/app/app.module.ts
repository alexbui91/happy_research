import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap'

import {Home} from './home/index'
import {NewFeeds} from './newfeeds/index'
import { Globals } from './globals';

import { PaperForm } from './components/form-paper'
import {ResearchModal} from './components/research'
import {LoginModal} from './components/login_modal'
import { Profile } from './profile';
import { ResearchPapers } from './research-papers';
import { PaperDetail } from './paper-detail';
import { PaperComponent } from './components/paper';
import { Account } from './account';
import { Researches } from './researches';


@NgModule({
  declarations: [
    AppComponent,
    Home,
    NewFeeds,
    Profile,
    ResearchPapers,
    PaperComponent,
    PaperDetail,
    Account,
    Researches,
    ResearchModal,
    LoginModal,
    PaperForm
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent],
  entryComponents: [ResearchModal, LoginModal, PaperForm]
})
export class AppModule { }

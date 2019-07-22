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

import {ResearchModal} from './components/research'
import {LoginModal} from './components/login_modal'
import { Profile } from './profile';

@NgModule({
  declarations: [
    AppComponent,
    Home,
    NewFeeds,
    Profile,
    ResearchModal,
    LoginModal
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
  entryComponents: [ResearchModal, LoginModal]
})
export class AppModule { }

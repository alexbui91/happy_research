import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {Home} from './home/index'
import {NewFeeds} from './newfeeds/index'
import { Globals } from './globals';

@NgModule({
  declarations: [
    AppComponent,
    Home,
    NewFeeds
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent]
})
export class AppModule { }

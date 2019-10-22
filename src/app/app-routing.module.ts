import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {Home}  from './home/index';
import { NewFeeds } from './newfeeds/index';
import { Profile } from './profile/index';
import { ResearchPapers } from './research-papers';
import { PaperDetail } from './paper-detail';
import { Account } from './account';
import { Researches } from './researches';

const routes: Routes = [
    // {path: '', component: Home, pathMatch: 'full'},
    {path: '', component: NewFeeds, pathMatch: 'full'},
    {path: 'newfeeds', component: NewFeeds},
    {path: 'profile/:id', component: Profile,},
    {path: 'research-papers/:id', component: ResearchPapers,},
    {path: 'account-setting', component: Account},
    {path: 'paper-detail/:id', component: PaperDetail},
    {path: 'researches', component: Researches}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

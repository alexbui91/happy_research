import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {Home}  from './home/index';
import { NewFeeds } from './newfeeds/index';

const routes: Routes = [
    {path: '', component: Home, pathMatch: 'full'},
    {path: 'newfeeds', component: NewFeeds},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

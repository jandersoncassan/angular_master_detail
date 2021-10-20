import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import{HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import{InMemoryDataBase } from './../in-memory-database'



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataBase)
  ],
  exports:[
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule
  ]
})
export class CoreModule { }

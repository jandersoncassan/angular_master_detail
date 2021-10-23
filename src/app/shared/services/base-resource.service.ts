import {BaseResourceModel} from '../models/base-resource.model'

import { HttpClient } from '@angular/common/http'
import { Injector } from '@angular/core';

import { Observable, throwError } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

export abstract class BaseResourceService<T extends BaseResourceModel> {
    
    protected http: HttpClient;

    constructor(
      protected apiPath: string, 
      protected injector: Injector,
      protected jsonDataToResourceFn: (jsonData: any) => T
      ){
        this.http = injector.get(HttpClient);
    }

    //qdo passamos uma função como parametro e precisarmos usar o 'this' precisamos fazer o abaixo ou 1 ou outro .. não dá para chamar direto map(metodo)
    getAll(): Observable<T[]> {
        return this.http.get(this.apiPath)
          .pipe(
           // map((jsonData: Array<any>)=> this.jsonDataToResources(jsonData)), //OU ABAIXO
            map(this.jsonDataToResources.bind(this)),
            catchError(this.handlerError)
          );
      }
    
      getById(id: number): Observable<T> {
        const url = `${this.apiPath}/${id}`;
        return this.http.get(url)
          .pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handlerError)
          );
      }
    
      create(resource: T): Observable<T> {
        return this.http.post(this.apiPath, resource)
          .pipe(
            map(this.jsonDataToResource.bind(this)),
            catchError(this.handlerError)
          );
      }
    
      update(resource: T): Observable<T> {
        const url = `${this.apiPath}/${resource.id}`;
        return this.http.put(url, resource)
          .pipe(
            map(() => resource),
            catchError(this.handlerError)
          );
      }
    
      delete(id: number): Observable<any>{
        const url = `${this.apiPath}/${id}`;
        return this.http.delete(url)
        .pipe(
          map(() => null),
          catchError(this.handlerError)
          )
      }

     
    protected jsonDataToResources(jsonData: any[]): T[] {
        const resources: T[] = [];
        jsonData.forEach(element => resources.push(this.jsonDataToResourceFn(element)));
        return resources;
    }

    protected jsonDataToResource(jsonData: any): T {
        return this.jsonDataToResourceFn(jsonData);
    }
    
    protected handlerError(error: any): Observable<any> {
        console.log("Erro na requisição => ", error);
        return throwError(error);
    }
}
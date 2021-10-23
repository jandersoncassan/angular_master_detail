import { Injectable, Injector} from '@angular/core';

import { BaseResourceService } from '../../../shared/services/base-resource.service';
import { Observable } from 'rxjs'
import { map, flatMap, catchError } from 'rxjs/operators'

import { Entry } from './entry.model';
import {CategoryService} from '../../categories/shared/category.service';

@Injectable({
  providedIn: 'root'
})
export class EntryService extends BaseResourceService<Entry>{

  constructor(private categoryService: CategoryService, protected injector: Injector ) { 
    super('api/entries', injector, Entry.fromJson);
  }

  create(entry: Entry): Observable<Entry> {
   return this.saveOrUpdate(entry, super.create.bind(this));  //precisamos passar o this por causa do contexto
  }

  update(entry: Entry): Observable<Entry> {
    return this.saveOrUpdate(entry, super.update.bind(this)); //mesmo esquema do baseResource
  }

 // private saveOrUpdate(entry: Entry, saveOrUpdate: any): Observable<Entry>{
  private saveOrUpdate(entry: Entry, saveOrUpdateFn: (entry: Entry) => Observable<Entry>){
    return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return saveOrUpdateFn(entry);
      }),
      catchError(this.handlerError)
  );
  }
}

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
    super('api/entries', injector);
  }

  create(entry: Entry): Observable<Entry> {
   return this.categoryService.getById(entry.categoryId).pipe(
        flatMap(category => {
          entry.category = category;
          return super.create(entry);
        })
    );
  }

  update(entry: Entry): Observable<Entry> {
     return this.categoryService.getById(entry.categoryId).pipe(
      flatMap(category => {
        entry.category = category;
        return super.update(entry);
      })
  );

  
  }
  //private methods
  protected jsonDataToResources(jsonData: any[]): Entry[] {
    const entries: Entry[] = [];
    //jsonData.forEach(element => entries.push(element as Entry)); se tiver metodo não conseuimos chamar 
    jsonData.forEach(element => {
      const entry = Object.assign(new Entry(), element); //ao inves de cats 'as Entry' para poder executar os metodos precisamos de object
      entries.push(entry);
    });
    return entries;
  }

  protected jsonDataToResource(jsonData: any): Entry {
    const entries: Entry[] = [];
    return jsonData as Entry;
  }
}

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
}

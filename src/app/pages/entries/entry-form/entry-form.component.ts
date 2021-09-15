import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';

import { switchMap } from  "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentyAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();

  constructor(private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.setCurrentyAction();
    this.buildEntryForm();
    this.loadEntry();
  }
  
  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentyAction == 'new'){
      this.createEntry();
    }else{ ///edit
      this.updateEntry();
    }
  }
  //private methods
  private setCurrentyAction(): void{
    let isNew = this.route.snapshot.url[0].path == 'new';
    this.currentyAction = isNew ?'new' :'edit';
  }

  private buildEntryForm(){
    this.entryForm = this.formBuilder.group({
      id:[null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: [null, [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [null, [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  private loadEntry(){
    if(this.currentyAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get('id'))) //+ transforma em numero
      )
      .subscribe(
        (entry) => {
          this.entry = entry;
          this.entryForm.patchValue(this.entry); //binds load entry data to entryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente novamente mais tarde')
      )
    }
  }

  private setPageTitle(): void {
    if(this.currentyAction == 'new')
      this.pageTitle = 'Cadastro de novo lançamento';
    else{
      const entryName = this.entry.name || '';
      this.pageTitle = `Editando o lançamento: ${entryName}`;
    }
  }

  private createEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value); //pega os valores do form e joga em object novo
    this.entryService.create(entry)
    .subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForError(error)
    )
  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value); //pega os valores do form e joga em object novo
    this.entryService.update(entry)
    .subscribe(
      (entry) => this.actionsForSuccess(entry),
      (error) => this.actionsForError(error)
    )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success('Solicitação processada com sucesso !');
    //carregamos a lista na categorias e voltamos para edição, redirect component page
    this.router.navigateByUrl('entries', {skipLocationChange: true})
    .then(
      () => this.router.navigate(['entries', entry.id, 'edit'])
    )
  }

  private actionsForError(error){
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');
    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors;
    }else{
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente novamente mais tarde']
    }
  }
}

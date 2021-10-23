import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import {FormBuilder,FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from  "rxjs/operators";

import toastr from "toastr";

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentyAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
        protected injector: Injector,
        public resource: T,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData: any) => T
    ) { 
        this.route = this.injector.get(ActivatedRoute);
        this.router = this.injector.get(Router);
        this.formBuilder = this.injector.get(FormBuilder);
    }
  
  ngOnInit() {
    this.setCurrentyAction();
    this.buildResourceForm();
    this.loadResource();
  }
  
  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;
    if(this.currentyAction == 'new'){
      this.createResource();
    }else{ ///edit
      this.updateResource();
    }
  }
  //private methods
  protected setCurrentyAction(): void{
    let isNew = this.route.snapshot.url[0].path == 'new';
    this.currentyAction = isNew ?'new' :'edit';
  }

  protected loadResource(){
    if(this.currentyAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get('id'))) //+ transforma em numero
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(this.resource); //binds load category data to categoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente novamente mais tarde')
      )
    }
  }

  protected setPageTitle(): void {
    if(this.currentyAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else{
        this.pageTitle = this.editionPageTitle();
    }
  }

  protected createResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value); //pega os valores do form e joga em object novo
    this.resourceService.create(resource)
    .subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForError(error)
    )
  }

  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value); //pega os valores do form e joga em object novo
    this.resourceService.update(resource)
    .subscribe(
      (resource) => this.actionsForSuccess(resource),
      (error) => this.actionsForError(error)
    )
  }

  protected actionsForSuccess(resource: T){
    toastr.success('Solicitação processada com sucesso !');

    //buscamos o path 'parent' [pai] do path nesse caso ou [categories, entries]
    const baserComponentPath: string = this.route.snapshot.parent.url[0].path;
    this.router.navigateByUrl(baserComponentPath, {skipLocationChange: true}) //redirect / reload page edit
    .then(
      () => this.router.navigate(['categories', resource.id, 'edit'])
    )
  }

  protected actionsForError(error){
    toastr.error('Ocorreu um erro ao processar a sua solicitação!');
    this.submittingForm = false;

    if(error.status === 422){
      this.serverErrorMessages = JSON.parse(error._body).errors;
    }else{
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor tente novamente mais tarde']
    }
  }

  protected abstract buildResourceForm(): void;

  protected abstract creationPageTitle(): string;

  protected abstract editionPageTitle(): string ;


}

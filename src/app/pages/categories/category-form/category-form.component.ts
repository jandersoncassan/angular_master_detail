import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from  "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentyAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.setCurrentyAction();
    this.buildCategoryForm();
    this.loadCategory();
  }
  
  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true;

    if(this.currentyAction == 'new'){
      this.createCategory();
    }else{ ///edit
      this.updateCategory();
    }
  }
  //private methods
  private setCurrentyAction(): void{
    let isNew = this.route.snapshot.url[0].path == 'new';
    this.currentyAction = isNew ?'new' :'edit';
  }

  private buildCategoryForm(){
    this.categoryForm = this.formBuilder.group({
      id:[null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory(){
    if(this.currentyAction == 'edit'){
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get('id'))) //+ transforma em numero
      )
      .subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(this.category); //binds load category data to categoryForm
        },
        (error) => alert('Ocorreu um erro no servidor, tente novamente mais tarde')
      )
    }
  }

  private setPageTitle(): void {
    if(this.currentyAction == 'new')
      this.pageTitle = 'Cadastro de nova categoria';
    else{
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando a categoria: ${categoryName}`;
    }
  }

  private createCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value); //pega os valores e joga em ibject novo
    this.categoryService.create(category)
    .subscribe(
      (category) => this.actionsForSuccess(category),
      (error) => this.actionsForError(error)
    )
  }

  private updateCategory(){

  }

  private actionsForSuccess(category: Category){
    toastr.success('Solicitação processada com sucesso !');
    //carregamos a lista na categorias e voltamos para edição, redirect component page
    this.router.navigateByUrl('categories', {skipLocationChange: true})
    .then(
      () => this.router.navigate(['categories', category.id, 'edit'])
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

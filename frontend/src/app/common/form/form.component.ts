import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { ReceptiInputDirective } from '../input/input.directive';
import { ReceptiSelectDirective } from '../select/select.directive';
import { ReceptiFormDirective } from './form.directive';

export type FormVariant = 'login' | 'signup' | 'recipe' | 'rating';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validators?: any[];
}

@Component({
  selector: 'app-form',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    ButtonComponent, 
    ReceptiInputDirective, 
    ReceptiSelectDirective,
    ReceptiFormDirective
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  @Input() variant: FormVariant = 'login';
  @Input() customFields: FormField[] = [];
  @Input() submitButtonText: string = 'Potvrdi';
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<any>();

  form!: FormGroup;
  formTitle: string = '';
  formFields: FormField[] = [];
  selectedRating: number = 0;
  hoveredRating: number = 0;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.setupFormByVariant();
    this.buildForm();
  }

  private setupFormByVariant() {
    switch (this.variant) {
      case 'login':
        this.formTitle = 'Prijava';
        this.formFields = [
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Unesite vaš email',
            required: true,
            validators: [Validators.required, Validators.email]
          },
          {
            name: 'password',
            label: 'Lozinka',
            type: 'password',
            placeholder: 'Unesite vašu lozinku',
            required: true,
            validators: [Validators.required, Validators.minLength(6)]
          }
        ];
        break;

      case 'signup':
        this.formTitle = 'Registracija';
        this.formFields = [
          {
            name: 'name',
            label: 'Ime i prezime',
            type: 'text',
            placeholder: 'Unesite vaše ime i prezime',
            required: true,
            validators: [Validators.required, Validators.minLength(2)]
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Unesite vaš email',
            required: true,
            validators: [Validators.required, Validators.email]
          },
          {
            name: 'password',
            label: 'Lozinka',
            type: 'password',
            placeholder: 'Unesite lozinku',
            required: true,
            validators: [Validators.required, Validators.minLength(6)]
          },
          {
            name: 'confirmPassword',
            label: 'Potvrdite lozinku',
            type: 'password',
            placeholder: 'Potvrdite vašu lozinku',
            required: true,
            validators: [Validators.required]
          }
        ];
        break;

      case 'recipe':
        this.formTitle = 'Dodaj recept';
        this.formFields = [
          {
            name: 'title',
            label: 'Naziv recepta',
            type: 'text',
            placeholder: 'Unesite naziv recepta',
            required: true,
            validators: [Validators.required, Validators.minLength(3)]
          },
          {
            name: 'ukus',
            label: 'Ukus',
            type: 'select',
            required: true,
            options: [
              { value: 'slatko', label: 'Slatko' },
              { value: 'slano', label: 'Slano' },
              { value: 'ljuto', label: 'Ljuto' },
              { value: 'kiselo', label: 'Kiselo' }
            ],
            validators: [Validators.required]
          },
          {
            name: 'tipMesa',
            label: 'Tip mesa',
            type: 'select',
            required: false,
            options: [
              { value: '', label: 'Bez mesa' },
              { value: 'piletina', label: 'Piletina' },
              { value: 'curetina', label: 'Ćuretina' },
              { value: 'svinjetina', label: 'Svinjetina' },
              { value: 'govedina', label: 'Govedina' },
              { value: 'jagnjetina', label: 'Jagnjetina' },
              { value: 'teletina', label: 'Teletina' },
              { value: 'riba', label: 'Riba' },
              { value: 'morski-plodovi', label: 'Morski plodovi' }
            ],
            validators: []
          },
          {
            name: 'nacinPripreme',
            label: 'Način pripreme',
            type: 'select',
            required: true,
            options: [
              { value: 'przeno', label: 'Prženo' },
              { value: 'peceno', label: 'Pečeno' },
              { value: 'kuvano', label: 'Kuvano' },
              { value: 'grilovano', label: 'Grilovano' },
              { value: 'dimljeno', label: 'Dimljeno' },
              { value: 'dinstano', label: 'Dinstano' },
              { value: 'marinado', label: 'Marinado' },
              { value: 'bareno', label: 'Bareno' }
            ],
            validators: [Validators.required]
          },
          {
            name: 'poreklo',
            label: 'Poreklo',
            type: 'select',
            required: true,
            options: [
              { value: 'srbija', label: 'Srbija' },
              { value: 'kina', label: 'Kina' },
              { value: 'italija', label: 'Italija' },
              { value: 'francuska', label: 'Francuska' },
              { value: 'grcka', label: 'Grčka' },
              { value: 'turska', label: 'Turska' },
              { value: 'spanija', label: 'Španija' },
              { value: 'indija', label: 'Indija' },
              { value: 'japan', label: 'Japan' },
              { value: 'meksiko', label: 'Meksiko' }
            ],
            validators: [Validators.required]
          },
          {
            name: 'prilika',
            label: 'Prilika',
            type: 'select',
            required: true,
            options: [
              { value: 'dorucak', label: 'Doručak' },
              { value: 'rucak', label: 'Ručak' },
              { value: 'vecera', label: 'Večera' },
              { value: 'predjelo', label: 'Predjelo' },
              { value: 'uzina', label: 'Užina' }
            ],
            validators: [Validators.required]
          },
          {
            name: 'cookingTime',
            label: 'Vreme kuvanja (minuti)',
            type: 'number',
            placeholder: 'Unesite vreme kuvanja',
            required: true,
            validators: [Validators.required, Validators.min(1)]
          },
          {
            name: 'tezinaSastojaka',
            label: 'Težina sastojaka (kg)',
            type: 'number',
            placeholder: 'Unesite ukupnu težinu sastojaka',
            required: true,
            validators: [Validators.required, Validators.min(0.1)]
          },
          {
            name: 'ingredients',
            label: 'Sastojci',
            type: 'textarea',
            placeholder: 'Navedite sastojke (jedan po liniji)',
            required: true,
            validators: [Validators.required]
          },
          {
            name: 'instructions',
            label: 'Uputstvo za pripremu',
            type: 'textarea',
            placeholder: 'Unesite uputstvo za pripremu',
            required: true,
            validators: [Validators.required]
          }
        ];
        break;

      case 'rating':
        this.formTitle = 'Ocenite recept';
        this.formFields = [
          {
            name: 'rating',
            label: 'Ocena',
            type: 'text',
            required: true,
            validators: [Validators.required]
          },
          {
            name: 'comment',
            label: 'Komentar',
            type: 'textarea',
            placeholder: 'Ostavite vaš komentar o receptu (opciono)',
            required: false,
            validators: []
          }
        ];
        break;
    }

    
    if (this.customFields.length > 0) {
      this.formFields = this.customFields;
    }
  }

  private buildForm() {
    const formControls: { [key: string]: any } = {};

    this.formFields.forEach(field => {
      const validators = field.validators || [];
      formControls[field.name] = ['', validators];
    });

    this.form = this.fb.group(formControls);
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      if (this.variant === 'rating') {
        formData.rating = this.selectedRating;
      }
      this.formSubmit.emit(formData);
    } else {
      this.form.markAllAsTouched();
    }
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    if (this.form.get('rating')) {
      this.form.get('rating')?.setValue(rating.toString());
    }
  }

  setHoveredRating(rating: number): void {
    this.hoveredRating = rating;
  }

  clearHoveredRating(): void {
    this.hoveredRating = 0;
  }

  getStarClass(starIndex: number): string {
    const rating = this.hoveredRating || this.selectedRating;
    return starIndex <= rating ? 'text-yellow-400' : 'text-gray-300';
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} se mora upisati.`;
      if (field.errors['email']) return 'Molimo unesite valjan email';
      if (field.errors['minlength']) return `Minimalna dužina je ${field.errors['minlength'].requiredLength}`;
      if (field.errors['min']) return `Minimalna vrednost je ${field.errors['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const field = this.formFields.find(f => f.name === fieldName);
    return field ? field.label : fieldName;
  }
}

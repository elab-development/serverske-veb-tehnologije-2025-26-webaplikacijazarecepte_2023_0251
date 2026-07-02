import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit, AfterViewInit, DoCheck, forwardRef, Optional, Self } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor, OnInit, AfterViewInit, DoCheck {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() maxlength: number | null = null;
  @Input() minlength: number | null = null;
  @Input() required: boolean = false;
  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  private _value: string = '';
  private onChange = (value: string) => {};
  private onTouched = () => {};

  
  private defaultClasses = [
    'px-4',
    'py-1',
    'rounded-full',
    'bg-dark/30',
    'text-light',
    'border-[2px]',
    'border-so2',
    'focus:ring-0',
    'focus:border-separator',
    'transition-colors',
    'duration-500',
    'outline-none',
    'placeholder-light/90',
    'placeholder:text-light/90'
  ];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Optional() @Self() private control: NgControl
  ) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
  }

  
  updateClasses = () => {
    if (!this.control) return;
    
    const touched = this.control.touched;
    const valid = this.control.valid;
    const inputElement = this.el.nativeElement.querySelector('input');
    
    if (!inputElement) return;

    this.renderer.removeClass(inputElement, 'border-so2');
    this.renderer.removeClass(inputElement, 'border-dark/50');

    if (touched && !valid) {
      this.renderer.addClass(inputElement, 'border-so2');
    } else {
      this.renderer.addClass(inputElement, 'border-dark/50');
    }
  };

  ngOnInit() {
    const inputElement = this.el.nativeElement.querySelector('input');
    if (!inputElement) return;

    
    this.defaultClasses.forEach((cls) => {
      this.renderer.addClass(inputElement, cls);
    });

    this.updateClasses();

    
    if (this.control) {
      this.control.statusChanges?.subscribe(() => {
        this.updateClasses();
      });
    }

    
    this.renderer.listen(inputElement, 'blur', () => {
      this.updateClasses();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateClasses();
    });
  }

  ngDoCheck() {
    this.updateClasses();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.inputChange.emit(this.value);
  }

  onFocus(): void {
    this.onTouched();
    this.inputFocus.emit();
  }

  onBlur(): void {
    this.inputBlur.emit();
    this.updateClasses();
  }

  
  writeValue(value: string): void {
    this._value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
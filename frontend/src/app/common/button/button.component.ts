import { Component, Input, Output, EventEmitter, ElementRef, Renderer2, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceptiButtonDirective } from './button.directive';

@Component({
  selector: 'app-button',
  imports: [CommonModule, ReceptiButtonDirective],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent implements OnInit {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() loading: boolean = false;
  @Output() buttonClick = new EventEmitter<Event>();

  private defaultClasses = [
    
    'outline-none',
  ];

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const buttonElement = this.el.nativeElement.querySelector('button');
    if (!buttonElement) return;

    
    this.defaultClasses.forEach((cls) => {
      this.renderer.addClass(buttonElement, cls);
    });

    
    this.applyVariantClasses(buttonElement);
    
    
    this.applySizeClasses(buttonElement);
  }

  private applyVariantClasses(buttonElement: HTMLElement) {
    switch (this.variant) {
      case 'secondary':
        this.renderer.removeClass(buttonElement, 'bg-so2');
        this.renderer.removeClass(buttonElement, 'text-light');
        this.renderer.removeClass(buttonElement, 'hover:bg-light');
        this.renderer.removeClass(buttonElement, 'hover:text-so2');
        this.renderer.addClass(buttonElement, 'bg-so1');
        this.renderer.addClass(buttonElement, 'text-so2');
        this.renderer.addClass(buttonElement, 'hover:bg-light');
        break;
      case 'outline':
        this.renderer.removeClass(buttonElement, 'bg-so2');
        this.renderer.removeClass(buttonElement, 'text-light');
        this.renderer.removeClass(buttonElement, 'hover:bg-light');
        this.renderer.removeClass(buttonElement, 'hover:text-so2');
        this.renderer.addClass(buttonElement, 'bg-light');
        this.renderer.addClass(buttonElement, 'border-2');
        this.renderer.addClass(buttonElement, 'border-so2');
        this.renderer.addClass(buttonElement, 'text-so2');
        this.renderer.addClass(buttonElement, 'hover:bg-so2');
        this.renderer.addClass(buttonElement, 'hover:text-light');
        break;
      default: 
        break;
    }
  }

  private applySizeClasses(buttonElement: HTMLElement) {
    switch (this.size) {
      case 'sm':
        this.renderer.removeClass(buttonElement, 'px-4');
        this.renderer.removeClass(buttonElement, 'py-1');
        this.renderer.addClass(buttonElement, 'px-3');
        this.renderer.addClass(buttonElement, 'py-0.5');
        this.renderer.addClass(buttonElement, 'text-sm');
        break;
      case 'lg':
        this.renderer.removeClass(buttonElement, 'px-4');
        this.renderer.removeClass(buttonElement, 'py-1');
        this.renderer.addClass(buttonElement, 'px-6');
        this.renderer.addClass(buttonElement, 'py-2');
        this.renderer.addClass(buttonElement, 'text-lg');
        break;
      default: 
        break;
    }
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}

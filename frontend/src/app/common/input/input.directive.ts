import { Directive, ElementRef, Renderer2, OnInit, DoCheck } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[receptiInput]',
})
export class ReceptiInputDirective implements OnInit, DoCheck {
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
        private control: NgControl
    ) {}
    
    updateClasses = () => {
        const touched = this.control.touched;
        const valid = this.control.valid;
        this.renderer.removeClass(this.el.nativeElement, 'border-so2');
        this.renderer.removeClass(
            this.el.nativeElement,
            'border-dark/50'
        );

        if (touched && !valid) {
            this.renderer.addClass(this.el.nativeElement, 'border-so2');
        } else {
            this.renderer.addClass(
                this.el.nativeElement,
                'border-dark/50'
            );
        }
    };
    
    ngDoCheck() {
        this.updateClasses();
    }
    
    ngOnInit() {
        if (!this.control) return;

        this.defaultClasses.forEach((cls) => {
            this.renderer.addClass(this.el.nativeElement, cls);
        });

        this.updateClasses();

        this.control.statusChanges?.subscribe(() => {
            this.updateClasses();
        });
        
        this.renderer.listen(this.el.nativeElement, 'blur', () => {
            this.updateClasses();
        });
    }
}

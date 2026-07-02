import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[receptiSelect]',
})
export class ReceptiSelectDirective implements OnInit {
    private defaultClasses = [
        'px-4',
        'py-1',
        'rounded-full',
        'bg-dark/30',
        'text-light',
        'border-[2px]',
        'border-separator',
        'focus:ring-0',
        'focus:border-so2',
        'transition-colors',
        'duration-500',
        'outline-none',
        'appearance-none',
        'cursor-pointer',
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
            'border-separator'
        );

        if (touched && !valid) {
            this.renderer.addClass(this.el.nativeElement, 'border-so2');
        } else {
            this.renderer.addClass(
                this.el.nativeElement,
                'border-separator'
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

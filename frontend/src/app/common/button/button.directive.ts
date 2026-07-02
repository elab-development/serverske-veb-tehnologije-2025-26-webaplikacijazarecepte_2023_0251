import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[receptiButton]',
})
export class ReceptiButtonDirective {
    constructor(private el: ElementRef, private renderer: Renderer2) {
        const classes = [
            
            'flex',
            'items-center',
            'justify-center',
            'mx-auto',
            
            'px-4',
            'py-1',
            'rounded-full',
            
            'text-md',
            'text-light',
            'text-md',
            
            'bg-so2',
            'hover:bg-light',
            'hover:text-so2',
            
            'shadow-[1px_4px_4px_rgba(0,0,0,0.2)]',
            'outline-none',
            'transition-all',
            'duration-200',
            'cursor-pointer',
            
            'disabled:opacity-50',
            'disabled:cursor-not-allowed'
        ];

        classes.forEach((cls) => {
            this.renderer.addClass(this.el.nativeElement, cls);
        });
    }
}

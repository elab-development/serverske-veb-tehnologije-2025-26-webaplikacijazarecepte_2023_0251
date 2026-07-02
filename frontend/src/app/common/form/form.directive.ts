import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
    selector: '[receptiForm]',
})
export class ReceptiFormDirective implements OnInit {
    private defaultClasses = [
        'bg-so1',
        'border-[2px]',
        'border-so2',
        'text-so2',
        'rounded-xl',
        'p-6',
        'shadow-lg',
        'w-full',
        'max-w-md',
        'mx-auto',
        'flex',
        'flex-col',
        'items-center',
        'space-y-4',
    ];

    constructor(
        private el: ElementRef,
        private renderer: Renderer2
    ) {}

    ngOnInit() {
        this.defaultClasses.forEach((cls) => {
            this.renderer.addClass(this.el.nativeElement, cls);
        });
    }
}

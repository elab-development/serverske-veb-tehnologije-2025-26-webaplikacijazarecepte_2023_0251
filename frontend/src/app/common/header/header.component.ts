import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent {
    dropdownOpen = false;

    constructor(private authService: AuthService, private router: Router) {}

    toggleDropdown() {
        this.dropdownOpen = !this.dropdownOpen;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
        this.dropdownOpen = false; 
    }
}

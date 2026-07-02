import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../common/auth.service';
import { FormComponent } from '../../common/form/form.component';

@Component({
    selector: 'app-login',
    imports: [FormComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    constructor(private authService: AuthService, private router: Router) {}

    onFormSubmit(formData: any) {
        console.log('Login form submitted:', formData);
        
        if (formData.email && formData.password) {
            this.authService
                .login(formData.email, formData.password)
                .subscribe({
                    next: (token) => {
                        console.log('Login successful, token:', token);
                        this.router.navigate(['/profile']);
                    },
                    error: (error) => {
                        console.error('Login error:', error);
                        alert('Invalid email or password. Please try again.');
                    },
                });
        }
    }
}

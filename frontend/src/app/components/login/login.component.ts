import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/auth.service';
import { FormComponent } from '../../common/form/form.component';
import { EnvConfigService } from '../../common/env-config.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    forgotPasswordMode = false;
    forgotPasswordMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private http: HttpClient,
        private envConfig: EnvConfigService
    ) {}

    onFormSubmit(formData: any) {
        if (this.forgotPasswordMode) {
            this.onForgotPasswordSubmit(formData);
            return;
        }

        if (formData.email && formData.password) {
            this.authService.login(formData.email, formData.password).subscribe({
                next: () => this.router.navigate(['/profile']),
                error: () => alert('Pogresan email ili lozinka.'),
            });
        }
    }

    toggleForgotPassword() {
        this.forgotPasswordMode = !this.forgotPasswordMode;
        this.forgotPasswordMessage = '';
    }

    onForgotPasswordSubmit(formData: any) {
        if (!formData.email) return;

        const apiUrl = this.envConfig.apiUrl;
        this.http
            .post<{ resetToken: string; message: string }>(
                `${apiUrl}/auth/forgot-password`,
                { email: formData.email }
            )
            .subscribe({
                next: (response) => {
                    this.forgotPasswordMessage =
                        'Link za reset lozinke je poslat na vasu email adresu.';
                },
                error: () => {
                    this.forgotPasswordMessage =
                        'Korisnik sa tom email adresom nije pronadjen.';
                },
            });
    }
}

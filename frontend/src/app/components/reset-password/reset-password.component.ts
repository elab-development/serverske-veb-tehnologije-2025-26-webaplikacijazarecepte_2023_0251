import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../common/form/form.component';
import { EnvConfigService } from '../../common/env-config.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormComponent],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent {
  token = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private envConfig: EnvConfigService
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onFormSubmit(formData: any) {
    if (!formData.newPassword || !this.token) return;

    const apiUrl = this.envConfig.apiUrl;
    this.http
      .post<{ message: string }>(`${apiUrl}/auth/reset-password`, {
        token: this.token,
        newPassword: formData.newPassword,
      })
      .subscribe({
        next: (response) => {
          this.message = 'Lozinka uspesno promenjena. Mozete se prijaviti.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: () => {
          this.message = 'Token je nevazeci ili je istekao.';
        },
      });
  }
}

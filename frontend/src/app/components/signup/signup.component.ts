import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormComponent } from '../../common/form/form.component';
import { AuthService } from '../../common/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  constructor(private authService: AuthService, private router: Router) {}

  onFormSubmit(formData: any) {
    console.log('Signup form submitted:', formData);
    
    if (formData.username && formData.email && formData.password) {
      this.authService
        .register(formData.username, formData.email, formData.password)
        .subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.router.navigate(['/profile']);
          },
          error: (error) => {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
          },
        });
    }
  }
}

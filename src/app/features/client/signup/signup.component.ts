import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { SignupService } from './signup.service';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null; // Add success message property

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private signupService: SignupService
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.signupForm.setValidators(this.passwordMatchValidator);
  }

  passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { username, password, email } = this.signupForm.value;

      this.signupService.register({ username, password, email }).subscribe({
// In the signup component's onSubmit method
next: (response) => {
  this.isLoading = false;
  this.successMessage = "Inscription réussie! Un email de vérification a été envoyé à votre adresse email.";
},
        error: (error) => {
          this.isLoading = false;

          // Ensure error is in JSON format before parsing
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Échec de l\'inscription. Veuillez réessayer.';
          }

          if (error.status === 409) {
            this.errorMessage = 'Cet utilisateur existe déjà.';
          }
        }
      });
    }
  }


}

import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { SignupService } from './signup.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private signupService: SignupService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    this.signupForm.setValidators(this.passwordMatchValidator);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const darkMode = localStorage.getItem('darkMode');
      this.isDarkMode = darkMode === 'enabled';
      document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-mode', this.isDarkMode);
      localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
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

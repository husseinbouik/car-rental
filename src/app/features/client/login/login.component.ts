import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  successMessage: string = '';
  showPassword: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Store token with the correct key that AuthService expects
        localStorage.setItem('access_token', response.token);

        this.successMessage = 'Connexion réussie ! Redirection en cours...';

        // Determine where to redirect based on role
        if (this.loginService.hasRole('ROLE_CLIENT')) { // Corrected role check
          setTimeout(() => {
            this.router.navigate(['/vehicles']); // Client interface route
          }, 2000);
        } else if (this.loginService.hasRole('ROLE_ADMIN')) {
            setTimeout(() => {
                this.router.navigate(['/admin/dashboard']);
            }, 2000);
        }
        else {
          // Default redirection or error handling if no recognized role
          setTimeout(() => {
            this.router.navigate(['/default']); // Or show an error message
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'Échec de la connexion, veuillez réessayer.';
      },
    });
  }
}

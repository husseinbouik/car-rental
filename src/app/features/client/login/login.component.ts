import { Component } from '@angular/core';
import { LoginService } from './login.service'; // Import the login service
import { Router } from '@angular/router'; // To navigate after successful login

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = ''; // Use 'username' instead of 'email'
  password: string = '';
  errorMessage: string = ''; // For displaying error messages
  isLoading: boolean = false; // To show loading indicator
  successMessage: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Store the JWT token
        localStorage.setItem('authToken', response.token);

        // Show success message
        this.successMessage = 'Connexion réussie ! Redirection en cours...';

        // Delay navigation for 2 seconds
        setTimeout(() => {
          this.router.navigate(['/admin/dashboard']); // Replace with your actual route
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Échec de la connexion, veuillez réessayer.';
      }
    });
  }

}

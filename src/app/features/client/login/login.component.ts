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

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = ''; // Reset any previous error messages

    // Call the login service
    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Assuming the token is returned in response.token
        localStorage.setItem('authToken', response.token); // Store the JWT token
        this.router.navigate(['/dashboard']); // Redirect to dashboard or another protected route
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed, please try again.'; // Show error message
      }
    });
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import the Router
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Reactive Forms modules

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
    fullName = '';
    email = '';
    password = '';
    confirmPassword = '';

    signupForm: FormGroup; // Using Reactive Forms for validation

    constructor(private router: Router, private fb: FormBuilder) { // Inject Router and FormBuilder
        this.signupForm = this.fb.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]], // Example password validation
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator }); // Custom validator for password matching
    }


    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
           ? null : { 'mismatch': true };
     }


    onSubmit() {
        if (this.signupForm.valid) {

            this.router.navigate(['/login']); 
        }

    }
}

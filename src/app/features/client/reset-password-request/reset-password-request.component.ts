// reset-password-request.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password-request',
  standalone: false,
  templateUrl: './reset-password-request.component.html',
  styleUrls: ['./reset-password-request.component.css']
})
export class ResetPasswordRequestComponent {
  resetForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const email = this.resetForm.get('email')?.value;

      this.authService.requestPasswordReset(email).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = this.translate.instant('reset_password_request.success');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || this.translate.instant('common.error_general');
        }
      });
    }
  }
}

// verify-email.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  message = 'Vérification de votre email en cours...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.authService.verifyEmail(token).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = 'Votre email a été vérifié avec succès!';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.isSuccess = false;
          this.message = error.error?.message ||
            'La vérification a échoué. Le lien peut être invalide ou expiré.';
        }
      });
    } else {
      this.isLoading = false;
      this.isSuccess = false;
      this.message = 'Token de vérification manquant.';
    }
  }
}

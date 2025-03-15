import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './features/admin/login/login.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TranslateModule,   FormsModule],

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'car-rental';

  // constructor(private translate: TranslateService) {
  //   this.translate.setDefaultLang('en');  // Default language
  //   this.translate.use('en');  // Use English initially
  // }
  //  // Function to switch language
  //  switchLanguage(event: Event) {
  //   const target = event.target as HTMLSelectElement;
  //   const lang = target.value;
  //   this.translate.use(lang);
  // }
}

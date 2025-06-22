import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslateModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'car-rental';

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    // Set default language
    this.translate.setDefaultLang('en');

    // Configure available languages
    this.translate.addLangs(['en', 'fr']);

    // Add debugging
    console.log('AppComponent constructor - Translation service initialized');
    console.log('Available languages:', this.translate.getLangs());
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Get saved language preference or detect browser language
      const savedLang = localStorage.getItem('language');
      const browserLang = this.translate.getBrowserLang();

      // Determine which language to use
      let langToUse = 'en'; // default

      if (savedLang && this.translate.getLangs().includes(savedLang)) {
        langToUse = savedLang;
      } else if (browserLang && this.translate.getLangs().includes(browserLang)) {
        langToUse = browserLang;
      }

      // Set the language
      this.translate.use(langToUse);

      // Save the language preference
      localStorage.setItem('language', langToUse);

      // Add debugging
      console.log('AppComponent ngOnInit - Language set to:', langToUse);
      console.log('Saved language:', savedLang);
      console.log('Browser language:', browserLang);

      // Test translation
      this.translate.get('brand').subscribe((value: string) => {
        console.log('Translation test for "brand":', value);
      });
    } else {
      // Server-side rendering - use default language
      this.translate.use('en');
      console.log('AppComponent ngOnInit - Server-side rendering, using default language');
    }
  }

  // Function to switch language
  switchLanguage(lang: string) {
    this.translate.use(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('language', lang);
    }
    console.log('Language switched to:', lang);
  }
}

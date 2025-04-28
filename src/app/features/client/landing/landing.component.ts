// src/app/landing/landing.component.ts
import { Component, OnInit, HostListener, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Voiture } from '../../admin/vehicles/vehicle.model'; // Adjust path as needed
import { VehicleService } from '../../admin/vehicles/vehicle.service'; // Adjust path as needed
import { catchError, of } from 'rxjs'; // Import catchError and of

interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface RentalData {
  pickupDate: string;
  returnDate: string;
  insurance: string;
}


@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  // --- PROPERTIES ---
  isDarkMode = false;
  mobileMenuOpen = false;
  currentLang = 'en';
  activeSection = 'home';

  showRentalModal = false;
  selectedVehicle: Voiture | null = null;
  rentalData: RentalData = { pickupDate: '', returnDate: '', insurance: 'basic' };

  newsletterEmail = '';
  currentYear = new Date().getFullYear();

  navItems = [
    { link: '#home', title: 'nav.home' },
    { link: '#vehicles', title: 'nav.vehicles' },
    { link: '#services', title: 'nav.services' },
    { link: '#testimonials', title: 'nav.testimonials' },
    { link: '#faq', title: 'nav.faq' },
  ];
  stats: { value: string | number; label: string }[] = [
      { value: '50+', label: 'stats.locations' },
      { value: '500+', label: 'stats.vehicles' },
      { value: '10k+', label: 'stats.happy_customers' },
      { value: '24/7', label: 'stats.support' }
  ];
  features: Feature[] = [
     { title: 'features.wide_selection', description: 'features.wide_selection_desc', icon: 'fa-car-side', color: 'blue' },
     { title: 'features.easy_booking', description: 'features.easy_booking_desc', icon: 'fa-calendar-check', color: 'green' },
     { title: 'features.affordable_prices', description: 'features.affordable_prices_desc', icon: 'fa-dollar-sign', color: 'teal' },
     { title: 'features.24_7_support', description: 'features.24_7_support_desc', icon: 'fa-headset', color: 'indigo' },
     { title: 'features.multiple_locations', description: 'features.multiple_locations_desc', icon: 'fa-map-marker-alt', color: 'orange' },
     { title: 'features.flexible_options', description: 'features.flexible_options_desc', icon: 'fa-sliders-h', color: 'pink' }
  ];
  steps: { number: number; title: string; description: string }[] = [
    { number: 1, title: 'how.step1_title', description: 'how.step1_desc' },
    { number: 2, title: 'how.step2_title', description: 'how.step2_desc' },
    { number: 3, title: 'how.step3_title', description: 'how.step3_desc' }
  ];
   testimonials: { avatar: string; name: string; rating: number; text: string }[] = [
    { avatar: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'testimonial.name1', rating: 5, text: 'testimonial.text1' },
    { avatar: 'https://randomuser.me/api/portraits/men/76.jpg', name: 'testimonial.name2', rating: 4.5, text: 'testimonial.text2' },
    { avatar: 'https://randomuser.me/api/portraits/women/84.jpg', name: 'testimonial.name3', rating: 5, text: 'testimonial.text3' }
   ];
  faqs: { id: number; question: string; answer: string; open: boolean }[] = [
    { id: 1, question: 'faq.q1', answer: 'faq.a1', open: false },
    { id: 2, question: 'faq.q2', answer: 'faq.a2', open: false },
    { id: 3, question: 'faq.q3', answer: 'faq.a3', open: false }
  ];
  // Removed locations as it's no longer used for search input, but could be used elsewhere
  // locations = ['location.city1', 'location.city2', 'location.city3'];

  socialLinks: { link: string; icon: string }[] = [
    { link: 'https://facebook.com', icon: 'fa-facebook' },
    { link: 'https://twitter.com', icon: 'fa-twitter' },
    { link: 'https://instagram.com', icon: 'fa-instagram' }
  ];
  footerLinks: { title: string; link: string }[] = [
    { title: 'footer.link1', link: '#home' },
    { title: 'footer.link2', link: '#vehicles' },
    { title: 'footer.link3', link: '#services' },
    { title: 'footer.link4', link: '#faq' }
  ];
  legalLinks: { title: string; link: string }[] = [
     { title: 'footer.privacy_policy', link: '/privacy-policy' },
     { title: 'footer.terms_of_service', link: '/terms-of-service' }
  ];
  newsletterMessage: string | null = null;
  newsletterError = false;

   // --- NEW PROPERTIES FOR VEHICLE DATA & SEARCH ---
   vehicles: Voiture[] = []; // Holds the full list fetched from the service
   filteredVehicles: Voiture[] = []; // Holds the list currently displayed (filtered)
   loadingVehicles = true;
   vehicleError: string | null = null;

   searchVehicleName: string = ''; // Property to hold the vehicle name search term


  private sectionOffsets: Map<string, { top: number, bottom: number }> = new Map();
  private offsetsCalculated = false;


  // --- CONSTRUCTOR & LIFECYCLE ---
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDarkMode();
      this.initializeLanguage();
      this.fetchVehicles(); // Fetch vehicles on init
    }
    this.initRentalDates();
  }

   // Fetch vehicles from the service
   fetchVehicles(): void {
      this.loadingVehicles = true;
      this.vehicleError = null;
      this.vehicleService.getVehicles().pipe(
         catchError(error => {
           console.error('Error fetching vehicles:', error);
           this.vehicleError = this.translate.instant('vehicles.error_fetching');
           this.loadingVehicles = false;
           return of([]);
         })
      ).subscribe((data: Voiture[]) => {
         this.vehicles = data;
         this.filteredVehicles = [...this.vehicles]; // Initialize filtered list with all vehicles
         console.log('Vehicles fetched:', this.vehicles);
         this.loadingVehicles = false;

          if (isPlatformBrowser(this.platformId)) {
              setTimeout(() => {
                  this.calculateSectionOffsets();
                  window.dispatchEvent(new Event('scroll'));
               }, 100);
          }
      });
   }

   // Method to perform the search filtering
   performSearch(event?: Event): void {
       if (event) {
           event.preventDefault(); // Prevent default form submission page reload
       }

       const searchTerm = this.searchVehicleName.trim().toLowerCase();

       if (!searchTerm) {
           // If search term is empty, show all vehicles
           this.filteredVehicles = [...this.vehicles];
       } else {
           // Filter vehicles where vname includes the search term (case-insensitive)
           this.filteredVehicles = this.vehicles.filter(vehicle =>
               vehicle.vname?.toLowerCase().includes(searchTerm)
           );
       }
        // Optional: Scroll to the vehicles section after searching
       // if (this.filteredVehicles.length > 0 || searchTerm) {
       //      this.scrollToSection('#vehicles');
       // }
   }


  // Initialize dark mode based on localStorage, apply to body
  initializeDarkMode(): void {
      if (isPlatformBrowser(this.platformId)) {
          const darkMode = localStorage.getItem('darkMode');
          if (darkMode === 'enabled') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark'); // Keep for Tailwind dark variants
          } else {
            this.isDarkMode = false;
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark'); // Keep for Tailwind dark variants
          }
      }
  }

  // Toggle dark mode, apply to body
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        document.documentElement.classList.add('dark'); // Keep for Tailwind dark variants
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        document.documentElement.classList.remove('dark'); // Keep for Tailwind dark variants
      }
    }
  }


  initializeLanguage(): void {
      if (isPlatformBrowser(this.platformId)) {
           const savedLang = localStorage.getItem('language');
          const availableLangs = this.translate.getLangs();
          if (savedLang && availableLangs.includes(savedLang)) {
            this.currentLang = savedLang;
          } else {
            const browserLang = this.translate.getBrowserLang();
            this.currentLang = browserLang && availableLangs.includes(browserLang) ? browserLang : 'en';
          }
          this.translate.use(this.currentLang);
      }
  }

  switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    this.translate.use(lang);
  }


  initRentalDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (num: number) => num.toString().padStart(2, '0');
    const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    this.rentalData.pickupDate = formatDate(today);
    this.rentalData.returnDate = formatDate(tomorrow);
  }

  // --- UI INTERACTIONS ---
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // --- SCROLL HANDLING & NAVIGATION ---
   @HostListener('window:scroll', ['$event'])
   onWindowScroll() {
     if (isPlatformBrowser(this.platformId)) {
       // Recalculate offsets if filteredVehicles list changes significantly the first time it's populated
        if (!this.offsetsCalculated && this.filteredVehicles.length > 0 && this.navItems.length > 0) {
           this.calculateSectionOffsets();
        }

       const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
       const offsetMargin = window.innerHeight * 0.3;

       let currentSectionId = 'home';

       this.sectionOffsets.forEach((offsets, sectionId) => {
          if (scrollPosition + offsetMargin >= offsets.top && scrollPosition < offsets.bottom - offsetMargin) {
             currentSectionId = sectionId;
          }
       });

       const scrollHeight = document.documentElement.scrollHeight;
       const clientHeight = document.documentElement.clientHeight;
       if (scrollPosition + clientHeight >= scrollHeight - 100) {
            const lastNavItemId = this.navItems[this.navItems.length - 1]?.link.substring(1);
            if (lastNavItemId && this.sectionOffsets.has(lastNavItemId)) {
                 currentSectionId = lastNavItemId;
            } else {
               let lastReachedSection = 'home';
               let maxTop = -1;
               this.sectionOffsets.forEach((offsets, sectionId) => {
                  if (scrollPosition >= offsets.top) {
                     if (offsets.top > maxTop) {
                        maxTop = offsets.top;
                        lastReachedSection = sectionId;
                     }
                  }
               });
                currentSectionId = lastReachedSection;
            }
       }

       if (this.activeSection !== currentSectionId) {
         this.activeSection = currentSectionId;
       }
     }
   }

   calculateSectionOffsets(): void {
      if (isPlatformBrowser(this.platformId)) {
         this.sectionOffsets.clear();
         this.navItems.forEach(item => {
           const sectionId = item.link.substring(1);
           const element = document.getElementById(sectionId);
           if (element) {
             const headerHeight = document.querySelector('header')?.offsetHeight || 80;
             const top = element.offsetTop - headerHeight - 1;
             const bottom = top + element.offsetHeight;
             this.sectionOffsets.set(sectionId, { top, bottom });
           }
         });
         this.offsetsCalculated = true;
        console.log("Section offsets calculated:", this.sectionOffsets);
      }
   }

   scrollToSection(link: string, event?: Event): void {
      const sectionId = link.substring(1);
       if (event && link.startsWith('#')) {
          event.preventDefault();
          const element = document.getElementById(sectionId);
          if(element) {
               if (isPlatformBrowser(this.platformId)) {
                 const headerHeight = document.querySelector('header')?.offsetHeight || 80;
                 const targetTop = element.offsetTop - headerHeight;

                 window.scrollTo({
                    top: targetTop,
                     behavior: 'smooth'
                 });
              }
              if(this.mobileMenuOpen) {
                this.mobileMenuOpen = false;
             }
              this.activeSection = sectionId;
               if (isPlatformBrowser(this.platformId)) {
                 setTimeout(() => {
                     const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                     const elementTop = element.offsetTop - (document.querySelector('header')?.offsetHeight || 80);
                     if (Math.abs(currentScroll - elementTop) < 20) {
                          history.replaceState(null, '', link);
                     }
                 }, 600);
              }
          }
     } else if (this.mobileMenuOpen) {
         this.mobileMenuOpen = false;
     }
   }


  // --- MODAL HANDLING ---
  openRentalModal(vehicle: Voiture): void {
    this.selectedVehicle = vehicle;
    this.initRentalDates();
    this.showRentalModal = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
    this.selectedVehicle = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  submitRentalRequest(): void {
    if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
      alert(this.translate.instant('modal.validation.date_required'));
      return;
    }
    if (new Date(this.rentalData.returnDate) <= new Date(this.rentalData.pickupDate)) {
      alert(this.translate.instant('modal.validation.return_date_after'));
      return;
    }

     const rentalDetailsToSend = {
         vehicleId: this.selectedVehicle?.id,
         pickupDate: this.rentalData.pickupDate,
         returnDate: this.rentalData.returnDate,
         insuranceOption: this.rentalData.insurance,
     };

     console.log('Rental Request Data:', rentalDetailsToSend);
     alert(this.translate.instant('modal.rental_submitted'));
     this.closeRentalModal();
  }

  getTransmissionText(isAutomate: boolean | undefined): string {
      if (isAutomate === true) {
          return this.translate.instant('modal.transmission_auto');
      } else if (isAutomate === false) {
          return this.translate.instant('modal.transmission_manual');
      }
      return this.translate.instant('modal.transmission_unknown');
  }

  // --- FAQ ---
  toggleFaq(id: number): void {
    this.faqs = this.faqs.map(faq => {
      if (faq.id === id) {
        return { ...faq, open: !faq.open };
      }
      return faq;
    });
  }

  // --- NEWSLETTER ---
  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    this.newsletterMessage = null;
    this.newsletterError = false;

    if (!this.newsletterEmail || !/\S+@\S+\.\S+/.test(this.newsletterEmail)) {
       this.newsletterError = true;
       this.newsletterMessage = this.translate.instant('footer.newsletter_invalid_email');
       return;
    }

    console.log('Subscribing newsletter for:', this.newsletterEmail);
    setTimeout(() => {
        this.newsletterMessage = this.translate.instant('footer.newsletter_success', { email: this.newsletterEmail });
        this.newsletterError = false;
        this.newsletterEmail = '';
         setTimeout(() => this.newsletterMessage = null, 5000);
    }, 1000);
  }
}

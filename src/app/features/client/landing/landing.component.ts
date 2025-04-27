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

// Define a type for the rental modal data structure
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
  activeSection = 'home'; // Default active section

  showRentalModal = false;
  selectedVehicle: Voiture | null = null; // Use Voiture type
  rentalData: RentalData = { pickupDate: '', returnDate: '', insurance: 'basic' }; // Use RentalData type

  newsletterEmail = '';
  currentYear = new Date().getFullYear();

  // Assuming these are static or populated elsewhere
  navItems = [
    { link: '#home', title: 'nav.home' },
    { link: '#vehicles', title: 'nav.vehicles' }, // Link to vehicles section
    { link: '#services', title: 'nav.services' }, // Renamed from 'about' to match id 'services'
    { link: '#testimonials', title: 'nav.testimonials' },
    { link: '#faq', title: 'nav.faq' },
    // Add a contact link if you have a contact section or modal
    // { link: '#contact', title: 'nav.contact' }
  ];
  stats: { value: string | number; label: string }[] = [
      { value: '50+', label: 'stats.locations' },
      { value: '500+', label: 'stats.vehicles' },
      { value: '10k+', label: 'stats.happy_customers' },
      { value: '24/7', label: 'stats.support' }
  ];
  // vehicles: Voiture[] = []; // This will be populated from the service

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
  locations = ['location.city1', 'location.city2', 'location.city3']; // Example locations - consider fetching these
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
    // Add more footer links as needed
  ];
  legalLinks: { title: string; link: string }[] = [
     { title: 'footer.privacy_policy', link: '/privacy-policy' }, // Assuming a privacy policy page/route
     { title: 'footer.terms_of_service', link: '/terms-of-service' } // Assuming terms page/route
  ];
  newsletterMessage: string | null = null;
  newsletterError = false;

   // --- NEW PROPERTIES FOR VEHICLE DATA ---
   vehicles: Voiture[] = []; // Property to hold vehicles fetched from the service
   loadingVehicles = true; // Loading state
   vehicleError: string | null = null; // Error message state

  private sectionOffsets: Map<string, { top: number, bottom: number }> = new Map();
  private offsetsCalculated = false;


  // --- CONSTRUCTOR & LIFECYCLE ---
  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private vehicleService: VehicleService // Inject the VehicleService
  ) {
     // Default language already set in your code
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDarkMode();
      this.initializeLanguage();
      this.fetchVehicles(); // Fetch vehicles on init
      // Calculate offsets after view init or on first scroll
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
           this.vehicleError = this.translate.instant('vehicles.error_fetching'); // Use a translation key for error message
           this.loadingVehicles = false;
           return of([]); // Return an empty array to prevent the app from breaking
         })
      ).subscribe((data: Voiture[]) => {
         this.vehicles = data;
         console.log('Vehicles fetched:', this.vehicles); // Log fetched data
         this.loadingVehicles = false;
          // Recalculate offsets if vehicles section content changes significantly
          // Or trigger a scroll event to recalculate offsets after vehicles are loaded
          if (isPlatformBrowser(this.platformId)) {
              setTimeout(() => { // Allow DOM to update before calculating
                  this.calculateSectionOffsets();
                  // Trigger a dummy scroll event to update active section if needed
                   window.dispatchEvent(new Event('scroll'));
               }, 100);
          }
      });
   }


  // Separate initialization for clarity
  initializeDarkMode(): void {
      if (isPlatformBrowser(this.platformId)) {
          const darkMode = localStorage.getItem('darkMode');
          if (darkMode === 'enabled') {
            this.isDarkMode = true;
            document.documentElement.classList.add('dark');
          } else {
            this.isDarkMode = false;
            document.documentElement.classList.remove('dark');
          }
      }
  }

  initializeLanguage(): void {
      if (isPlatformBrowser(this.platformId)) {
           const savedLang = localStorage.getItem('language');
          if (savedLang && this.translate.getLangs().includes(savedLang)) { // Validate against available langs
            this.currentLang = savedLang;
          } else {
            // Fallback to browser language or default 'en'
            const browserLang = this.translate.getBrowserLang();
            this.currentLang = browserLang && this.translate.getLangs().includes(browserLang) ? browserLang : 'en';
          }
          this.translate.use(this.currentLang);
      }
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
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', this.isDarkMode ? 'enabled' : 'disabled'); // Store user preference
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  switchLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    const lang = target.value;
    this.translate.use(lang);
  }

  // --- SCROLL HANDLING & NAVIGATION ---
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Calculate offsets lazily on the first scroll after potential data load
      if (!this.offsetsCalculated && this.vehicles.length > 0) { // Wait for vehicles to potentially load
         this.calculateSectionOffsets();
      }

      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const offsetMargin = window.innerHeight * 0.3; // Adjust margin for active section detection

      let currentSectionId = 'home'; // Default to home

      // Determine which section is currently visible
      this.sectionOffsets.forEach((offsets, sectionId) => {
         // Check if the section is significantly visible
         if (scrollPosition + offsetMargin >= offsets.top && scrollPosition < offsets.bottom - offsetMargin) {
            currentSectionId = sectionId;
         }
      });

      // Special case for reaching the very bottom
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      // Check if near bottom (within 100px)
      if (scrollPosition + clientHeight >= scrollHeight - 100) {
           // Find the id of the last section that has an entry in sectionOffsets
           const lastNavItemId = this.navItems[this.navItems.length - 1]?.link.substring(1);
           if (lastNavItemId && this.sectionOffsets.has(lastNavItemId)) {
                currentSectionId = lastNavItemId;
           } else {
             // Fallback if the last nav item link doesn't match an existing element ID
             // Find the section with the highest 'top' value that's fully above the current scroll position
              let lastReachedSection = 'home';
              let maxTop = -1;
              this.sectionOffsets.forEach((offsets, sectionId) => {
                 if (scrollPosition >= offsets.top && offsets.top > maxTop) {
                    maxTop = offsets.top;
                    lastReachedSection = sectionId;
                 }
              });
               currentSectionId = lastReachedSection;
           }
      }


      if (this.activeSection !== currentSectionId) {
        this.activeSection = currentSectionId;
         // Manually trigger change detection if needed (usually not required with default settings)
         // this.cdr.detectChanges();
      }
    }
  }

  // Calculate section offsets (call this after view is initialized or on first scroll)
  calculateSectionOffsets(): void {
     if (isPlatformBrowser(this.platformId)) {
        this.sectionOffsets.clear();
        this.navItems.forEach(item => {
          const sectionId = item.link.substring(1);
          const element = document.getElementById(sectionId);
          if (element) {
            // Adjust offset for the fixed header height
            const top = element.offsetTop - 80; // Assuming header is ~80px tall
            const bottom = top + element.offsetHeight;
            this.sectionOffsets.set(sectionId, { top, bottom });
          }
        });
        this.offsetsCalculated = true;
       // console.log("Section offsets calculated:", this.sectionOffsets);
     }
  }

  // Helper for smooth scrolling when clicking nav links (optional, if using JS scrolling instead of default browser anchor behavior)
  // If using default browser anchor links (#section), remove this method and the (click) handler from nav links.
  // Keep the (click) handler for mobile menu closing.
  scrollToSection(sectionId: string, event?: Event): void {
     // Only prevent default if it's a same-page link click, not an external route
      if (event && sectionId.startsWith('#')) {
         event.preventDefault(); // Prevent default anchor jump
         const element = document.getElementById(sectionId.substring(1)); // Get element by ID without '#'
         if(element) {
              if (isPlatformBrowser(this.platformId)) {
                // Use smooth scroll behavior
                 window.scrollTo({
                   top: element.offsetTop - 70, // Adjust for fixed header height
                    behavior: 'smooth'
                });
             }
             // Close mobile menu after clicking a link
             if(this.mobileMenuOpen) {
               this.mobileMenuOpen = false;
            }
             // Manually set active section immediately for better UX
             this.activeSection = sectionId.substring(1);
             // Optionally update URL hash without jumping
             // if (isPlatformBrowser(this.platformId)) {
             //    history.pushState(null, '', sectionId);
             // }
         }
     } else if (this.mobileMenuOpen) {
        // If it's not a section link but mobile menu is open, just close it
         this.mobileMenuOpen = false;
     }
  }


  // --- MODAL HANDLING ---
  openRentalModal(vehicle: Voiture): void { // Use Voiture type
    this.selectedVehicle = vehicle;
    this.initRentalDates(); // Reset dates each time modal opens
    this.showRentalModal = true;
    // Prevent body scroll when modal is open
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
    this.selectedVehicle = null;
     // Restore body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  submitRentalRequest(): void {
     // Basic validation
    if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
       // Use a translated alert or display an error message in the modal
      alert(this.translate.instant('modal.validation.date_required'));
      return;
    }
    if (new Date(this.rentalData.returnDate) <= new Date(this.rentalData.pickupDate)) {
       // Use a translated alert
        alert(this.translate.instant('modal.validation.return_date_after'));
       return;
    }

     // --- Rental Request Logic ---
     // In a real app, you would gather all necessary info (user ID, vehicle ID, dates, insurance)
     // and send it to your backend service using HttpClient.
     const rentalDetailsToSend = {
         vehicleId: this.selectedVehicle?.id,
         pickupDate: this.rentalData.pickupDate,
         returnDate: this.rentalData.returnDate,
         insuranceOption: this.rentalData.insurance,
         // Add userId if applicable
     };

     console.log('Rental Request Data:', rentalDetailsToSend);

     // Example service call (replace with your actual rental service method)
     // this.rentalService.createRental(rentalDetailsToSend).subscribe({
     //   next: (response) => {
     //      console.log('Rental successful', response);
     //      alert(this.translate.instant('modal.rental_success')); // Translated success message
     //      this.closeRentalModal();
     //   },
     //   error: (err) => {
     //      console.error('Rental failed', err);
     //      alert(this.translate.instant('modal.rental_error')); // Translated error message
     //   }
     // });

     // Placeholder success feedback
    alert(this.translate.instant('modal.rental_submitted')); // Translated placeholder
    this.closeRentalModal();
  }

  // Helper to display transmission type based on boolean
  getTransmissionText(isAutomate: boolean | undefined): string {
      if (isAutomate === undefined) {
          return this.translate.instant('modal.transmission_unknown'); // Or handle missing data
      }
      return isAutomate ? this.translate.instant('modal.transmission_auto') : this.translate.instant('modal.transmission_manual');
  }

  // --- FAQ ---
  toggleFaq(id: number): void {
    this.faqs = this.faqs.map(faq => {
      if (faq.id === id) {
        return { ...faq, open: !faq.open };
      }
       // Optional: close other FAQs when one is opened
       // return { ...faq, open: false };
      return faq; // Keep others as they are
    });
  }

  // --- NEWSLETTER ---
  subscribeNewsletter(event: Event): void {
    event.preventDefault(); // Prevent page reload
    this.newsletterMessage = null; // Clear previous messages
    this.newsletterError = false;

    if (!this.newsletterEmail || !/\S+@\S+\.\S+/.test(this.newsletterEmail)) {
       this.newsletterError = true;
       this.newsletterMessage = this.translate.instant('footer.newsletter_invalid_email'); // Translated message
       return;
    }

    console.log('Subscribing newsletter for:', this.newsletterEmail);
    // Simulate API call
    // In a real app, call a service: this.newsletterService.subscribe(this.newsletterEmail).subscribe(...)
    // Assuming success
    setTimeout(() => {
        this.newsletterMessage = this.translate.instant('footer.newsletter_success', { email: this.newsletterEmail }); // Translated success message with interpolation
        this.newsletterError = false;
        this.newsletterEmail = ''; // Clear the input field on success
        // Auto-hide message after a few seconds
         setTimeout(() => this.newsletterMessage = null, 5000);
    }, 1000);

    // Example error handling (uncomment and adapt if needed)
    // setTimeout(() => {
    //     this.newsletterError = true;
    //     this.newsletterMessage = this.translate.instant('footer.newsletter_error'); // Translated error message
    //     setTimeout(() => this.newsletterMessage = null, 5000);
    // }, 1000);
  }
}

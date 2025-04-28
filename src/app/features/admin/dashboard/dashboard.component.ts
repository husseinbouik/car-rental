import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData, ChartType, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subject, takeUntil } from 'rxjs';

// Import Services
import { DashboardService } from './dashboard.service'; // Adjust the path if needed
import { VehicleService } from '../vehicles/vehicle.service'; // <--- ADJUST PATH HERE
import { Voiture } from '../vehicles/vehicle.model'; // <--- ADJUST PATH HERE

@Component({
  selector: 'app-dashboard',
  standalone: false, // Based on your snippet
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'], // You can add Tailwind directives here or in global styles
  // imports: [CommonModule, FormsModule, BaseChartDirective] // For standalone
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // --- Data Properties ---
  tauxDisponibilite: number | null = null;
  tauxAnnulation: number | null = null;
  totalRevenu: number | null = null;
  dureeMoyenneReservations: number | null = null;
  revenuMoyenParVoiture: number | null = null;
  nombreReservationsParVoiture: number | null = null;

  // --- Input Properties ---
  startDate: string;
  endDate: string;
  voitureId: number | null = null; // This will now be bound to the select

  // --- Vehicle List for Select ---
  vehicles: Voiture[] = []; // <--- Add this property
  isLoadingVehicles = false; // <--- Add loading state for vehicles

  // --- Loading States ---
  isLoadingAvailability = false;
  isLoadingRevenuePeriod = false;
  isLoadingAverageRevenueCar = false;
  isLoadingReservationsCar = false;
  isLoadingOverallMetrics = false;


  // --- Chart Properties (Revenu par Période) ---
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public revenuParPeriodeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Revenue (€)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue by Period'
      }
    }
  };
  public revenuParPeriodeChartData: ChartData<'line'> = {
    datasets: [
      {
        data: [],
        label: 'Revenue',
        tension: 0.3,
        fill: 'origin',
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ],
    labels: []
  };
  public revenuParPeriodeChartType: 'line' = 'line';


  // Inject both services
  constructor(
    private dashboardService: DashboardService,
    private vehicleService: VehicleService // <--- Inject VehicleService
  ) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.fetchOverallMetrics();
    this.fetchTauxDisponibilite();
    this.fetchRevenuParPeriode();
    this.fetchVehicles(); // <--- Fetch vehicles on init
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Data Fetching Methods ---

  fetchOverallMetrics(): void {
    this.isLoadingOverallMetrics = true;

    this.dashboardService.getCancellationRate()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.tauxAnnulation = data,
        error: (err) => this.handleComponentError(err)
      });

    this.dashboardService.getTotalRevenue()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.totalRevenu = data,
         error: (err) => this.handleComponentError(err)
      });

    this.dashboardService.getAverageReservationDuration()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.dureeMoyenneReservations = data,
        error: (err) => this.handleComponentError(err),
        complete: () => this.isLoadingOverallMetrics = false
      });
  }


  fetchTauxDisponibilite(): void {
    if (!this.startDate || !this.endDate) {
      console.warn('Start and End dates are required for Availability Rate.');
      this.tauxDisponibilite = null;
      return;
    }
    this.isLoadingAvailability = true;

    this.dashboardService.getAvailabilityRate(this.startDate, this.endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.tauxDisponibilite = data,
        error: (err) => {
           this.handleComponentError(err);
           this.tauxDisponibilite = null;
        },
        complete: () => this.isLoadingAvailability = false
      });
  }

  fetchRevenuParPeriode(): void {
     if (!this.startDate || !this.endDate) {
      console.warn('Start and End dates are required for Revenue by Period.');
       this.revenuParPeriodeChartData = {
         ...this.revenuParPeriodeChartData,
         datasets: [{ ...this.revenuParPeriodeChartData.datasets[0], data: [] }]
       };
       if (this.chart) {
         this.chart.chart?.update();
       }
      return;
    }
    this.isLoadingRevenuePeriod = true;

    this.dashboardService.getRevenueByPeriod(this.startDate, this.endDate)
       .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.revenuParPeriodeChartData = {
             ...this.revenuParPeriodeChartData,
             datasets: [{
               ...this.revenuParPeriodeChartData.datasets[0],
               data: data.map(item => ({ x: item.date, y: item.revenue }))
             }]
           };
           if (this.chart) {
             this.chart.chart?.update();
           }
        },
        error: (err) => {
          this.handleComponentError(err);
           this.revenuParPeriodeChartData = {
             ...this.revenuParPeriodeChartData,
             datasets: [{ ...this.revenuParPeriodeChartData.datasets[0], data: [] }]
           };
            if (this.chart) {
             this.chart.chart?.update();
           }
        },
        complete: () => this.isLoadingRevenuePeriod = false
      });
  }

   // <--- Add fetchVehicles method
  fetchVehicles(): void {
    this.isLoadingVehicles = true;
    this.vehicleService.getVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.vehicles = data;
           // Optional: If you want to select the first vehicle by default
           // if (this.vehicles.length > 0 && this.voitureId === null) {
           //    this.voitureId = this.vehicles[0].id;
           //    this.onVoitureIdChange(); // Trigger fetch for the default car
           // }
        },
        error: (err) => {
          this.handleComponentError(err);
          this.vehicles = []; // Clear list on error
        },
        complete: () => this.isLoadingVehicles = false
      });
  }


  fetchRevenuMoyenParVoiture(): void {
    if (this.voitureId === null || this.voitureId === undefined) {
      console.warn('Voiture ID is required for Average Revenue per Car.');
      this.revenuMoyenParVoiture = null; // Clear data
      return;
    }
    this.isLoadingAverageRevenueCar = true;

    this.dashboardService.getAverageRevenuePerCar(this.voitureId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.revenuMoyenParVoiture = data,
        error: (err) => {
           this.handleComponentError(err);
           this.revenuMoyenParVoiture = null;
        },
        complete: () => this.isLoadingAverageRevenueCar = false
      });
  }

  fetchNombreReservationsParVoiture(): void {
     if (this.voitureId === null || this.voitureId === undefined) {
      console.warn('Voiture ID is required for Number of Reservations per Car.');
       this.nombreReservationsParVoiture = null; // Clear data
      return;
    }
    this.isLoadingReservationsCar = true;

    this.dashboardService.getReservationsPerCar(this.voitureId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.nombreReservationsParVoiture = data,
        error: (err) => {
           this.handleComponentError(err);
           this.nombreReservationsParVoiture = null;
        },
        complete: () => this.isLoadingReservationsCar = false
      });
  }

  // --- Component-Specific Error Handling ---
  private handleComponentError(error: any): void {
      console.error('Component received error:', error);
      // Implement UI feedback for errors here if needed
  }


  // --- UI Actions ---

  onDateRangeChange(): void {
    console.log('Date range changed:', this.startDate, this.endDate);
    this.fetchTauxDisponibilite();
    this.fetchRevenuParPeriode();
  }

  // This method is now triggered when the vehicle select changes
  onVoitureIdChange(): void {
    console.log('Voiture ID changed:', this.voitureId);
    // The ngModel bound to the select automatically updates this.voitureId
    if (this.voitureId !== null && this.voitureId !== undefined) { // Check if a vehicle is actually selected
        this.fetchRevenuMoyenParVoiture();
        this.fetchNombreReservationsParVoiture();
    } else {
         // Clear car-specific data if "Select a vehicle" or null is chosen
         this.revenuMoyenParVoiture = null;
         this.nombreReservationsParVoiture = null;
         console.warn('No Voiture selected. Clearing car-specific data.');
    }
  }

  // Helper to format numbers
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' €';
  }

   formatPercentage(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return (value * 100).toFixed(2) + ' %';
  }

   formatDuration(value: number | null): string {
     if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' days'; // Assuming duration is in days
   }

    // Helper to display vehicle name in the select
    getVehicleDisplayName(voiture: Voiture): string {
      // Adjust based on your Voiture model properties
      return `${voiture.marque} ${voiture.modele} (${voiture.matricule || 'N/A'})`;
    }
}

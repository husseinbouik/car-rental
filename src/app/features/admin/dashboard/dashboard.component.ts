import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData, ChartType, ChartOptions, Chart } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { Subject, takeUntil, interval } from 'rxjs';
import { registerables } from 'chart.js';

// Import Services
import { DashboardService } from './dashboard.service'; // Adjust the path if needed
import { VehicleService } from '../vehicles/vehicle.service'; // <--- ADJUST PATH HERE
import { Voiture } from '../vehicles/vehicle.model'; // <--- ADJUST PATH HERE

// Register Chart.js components
Chart.register(...registerables);

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

  // --- Additional Statistics Properties ---
  totalVehicles: number | null = null;
  totalReservations: number | null = null;
  totalClients: number | null = null;
  avgRentalDuration: number | null = null;
  monthlyGrowth: number | null = null;

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
  isLoadingRecentReservations = false;

  // --- Real-time Properties ---
  currentTime: Date = new Date();

  // --- Recent Activity Properties ---
  recentReservations: any[] = [];
  systemAlerts: Array<{
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: Date;
  }> = [
    {
      type: 'info',
      title: 'System Update',
      message: 'Dashboard has been updated with new features',
      timestamp: new Date()
    },
    {
      type: 'warning',
      title: 'Low Vehicle Availability',
      message: 'Some vehicles are running low on availability',
      timestamp: new Date(Date.now() - 3600000)
    }
  ];

  // --- Chart Properties (Revenu par Période) ---
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  public revenuParPeriodeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Revenue (€)',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-color)'
        }
      },
      title: {
        display: true,
        text: 'Revenue by Period',
        color: 'var(--text-color)'
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

  // --- Additional Chart Properties for Template ---
  public revenueChartData: ChartData<'line'> = {
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
  public revenueChartType: 'line' = 'line';
  public revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Revenue (€)',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-color)'
        }
      },
      title: {
        display: true,
        text: 'Revenue by Period',
        color: 'var(--text-color)'
      }
    }
  };

  public reservationsChartData: ChartData<'line'> = {
    datasets: [
      {
        data: [],
        label: 'Reservations',
        tension: 0.3,
        fill: 'origin',
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
      }
    ],
    labels: []
  };
  public reservationsChartType: 'line' = 'line';
  public reservationsChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Reservations',
          color: 'var(--text-color)'
        },
        ticks: {
          color: 'var(--text-color-muted)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-color)'
        }
      },
      title: {
        display: true,
        text: 'Reservations by Period',
        color: 'var(--text-color)'
      }
    }
  };

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
    this.fetchAdditionalStats(); // Fetch additional statistics

    // Start real-time clock
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- New Methods ---

  refreshAllData(): void {
    this.fetchOverallMetrics();
    this.fetchTauxDisponibilite();
    this.fetchRevenuParPeriode();
    this.fetchVehicles();
    this.fetchAdditionalStats();
    if (this.voitureId) {
      this.fetchRevenuMoyenParVoiture();
      this.fetchNombreReservationsParVoiture();
    }
  }

  getSelectedVehicleName(): string {
    if (!this.voitureId) return '';
    const vehicle = this.vehicles.find(v => v.id === this.voitureId);
    return vehicle ? this.getVehicleDisplayName(vehicle) : '';
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

  // --- Additional Statistics Fetching ---
  fetchAdditionalStats(): void {
    // Fetch total vehicles
    this.vehicleService.getVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicles) => this.totalVehicles = vehicles.length,
        error: (err) => this.handleComponentError(err)
      });

    // Fetch total reservations (you may need to add this method to your service)
    // this.dashboardService.getTotalReservations()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => this.totalReservations = data,
    //     error: (err) => this.handleComponentError(err)
    //   });

    // Fetch total clients (you may need to add this method to your service)
    // this.dashboardService.getTotalClients()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (data) => this.totalClients = data,
    //     error: (err) => this.handleComponentError(err)
    //   });

    // For now, set mock values
    this.totalReservations = 150;
    this.totalClients = 75;
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
          // Check if data is an array
          if (!Array.isArray(data)) {
            console.error('Expected array data for revenue by period, got:', typeof data, data);
            this.handleComponentError(new Error('Invalid data format received from API'));
            return;
          }

          // Create labels for the x-axis (dates)
          const labels = data.map(item => new Date(item.date).toLocaleDateString());

          // Create data points for revenue
          const revenueData = data.map(item => item.revenue);

          // Create data points for reservations (mock data for now)
          const reservationData = data.map(item => Math.floor(Math.random() * 20) + 5);

          this.revenuParPeriodeChartData = {
            labels: labels,
            datasets: [{
              ...this.revenuParPeriodeChartData.datasets[0],
              data: revenueData
            }]
          };

          // Also update the template chart data
          this.revenueChartData = {
            labels: labels,
            datasets: [{
              ...this.revenueChartData.datasets[0],
              data: revenueData
            }]
          };

          // Update reservations chart
          this.reservationsChartData = {
            labels: labels,
            datasets: [{
              ...this.reservationsChartData.datasets[0],
              data: reservationData
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
          this.revenueChartData = {
            ...this.revenueChartData,
            datasets: [{ ...this.revenueChartData.datasets[0], data: [] }]
          };
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

  onDateChange(): void {
    console.log('Date changed:', this.startDate, this.endDate);
    this.fetchTauxDisponibilite();
    this.fetchRevenuParPeriode();
  }

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
      if (voiture.vname) {
        return voiture.vname;
      } else if (voiture.marque && voiture.modele) {
        return `${voiture.marque} ${voiture.modele}`;
      } else if (voiture.marque) {
        return voiture.marque;
      } else {
        return `Vehicle ${voiture.id}`;
      }
    }

    getAlertClass(type: 'info' | 'warning' | 'error' | 'success'): string {
      switch (type) {
        case 'info':
          return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
        case 'warning':
          return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
        case 'error':
          return 'border-red-500 bg-red-50 dark:bg-red-900/20';
        case 'success':
          return 'border-green-500 bg-green-50 dark:bg-green-900/20';
        default:
          return 'border-gray-500 bg-gray-50 dark:bg-gray-800';
      }
    }

    getAlertIcon(type: 'info' | 'warning' | 'error' | 'success'): string {
      switch (type) {
        case 'info':
          return 'fas fa-info-circle text-blue-500';
        case 'warning':
          return 'fas fa-exclamation-triangle text-yellow-500';
        case 'error':
          return 'fas fa-times-circle text-red-500';
        case 'success':
          return 'fas fa-check-circle text-green-500';
        default:
          return 'fas fa-info-circle text-gray-500';
      }
    }
}

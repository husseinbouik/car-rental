import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'app-client-create',
  standalone:false,
  templateUrl: './client-create.component.html',
  styleUrls: ['./client-create.component.css']
})
export class ClientCreateComponent {
  client: Client = {
    id: 0, // Will be auto-generated
    cin_delivre_le: '',
    permis_delivre_au: '',
    permis_delivre_le: '',
    adresse: '',
    adresse_etranger: '',
    cin: '',
    cname: '',
    delivre_le_passeport: '',
    nationalite: '',
    passeport: '',
    permis: '',
    tel: ''
  };

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  // Handle form submission
  onSubmit(): void {
    this.clientService.createClient(this.client).subscribe({
      next: (response) => {
        console.log('Client created successfully:', response);
        this.router.navigate(['/admin/clients']); // Navigate back to the clients list
      },
      error: (error) => {
        console.error('Error creating client:', error);
      }
    });
  }
}

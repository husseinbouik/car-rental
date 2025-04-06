import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'app-client-create',
  standalone: false,
  templateUrl: './client-create.component.html',
  styleUrls: ['./client-create.component.css']
})
export class ClientCreateComponent implements OnInit {
  client: Client = {
    id: 0,
    cinDelivreLe: '',
    permisDelivreAu: '',
    permisDelivreLe: '',
    adresse: '',
    adresseEtranger: '',
    cin: '',
    cname: '',
    delivreLePasseport: '',
    nationalite: '',
    passeport: '',
    permis: '',
    tel: ''
  };

  isEditMode: boolean = false;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');

    if (clientId) {
      this.isEditMode = true;
      this.clientService.getClientById(+clientId).subscribe({
        next: (data) => {
          this.client = data;
        },
        error: (err) => {
          console.error('Error fetching client:', err);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.clientService.updateClient(this.client).subscribe({
        next: () => {
          console.log('Client updated successfully');
          this.router.navigate(['/admin/clients']);
        },
        error: (err) => {
          console.error('Error updating client:', err);
        }
      });

    } else {
      this.clientService.createClient(this.client).subscribe({
        next: () => {
          console.log('Client created successfully');
          this.router.navigate(['/admin/clients']);
        },
        error: (err) => {
          console.error('Error creating client:', err);
        }
      });
    }
  }
}

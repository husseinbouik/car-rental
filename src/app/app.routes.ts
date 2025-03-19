import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './core/layout/client-layout/client-layout.component';

export const routes: Routes = [
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
      },
    ],
  },

  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule),
      },
    ],
  },

  // Handle 404
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

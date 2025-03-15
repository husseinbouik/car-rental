import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from './user.model';
import { MOCK_USERS } from './mock-users';

@Injectable({
  providedIn: 'root'
})
export class UserSeUserManagementServicervice {
  constructor() {}

  getUsers(): Observable<User[]> {
    return of(MOCK_USERS);
  }

  getUserById(id: number): Observable<User | undefined> {
    const user = MOCK_USERS.find(u => u.id === id);
    return of(user);
  }

  createUser(user: User): Observable<User> {
    const newId = Math.max(...MOCK_USERS.map(u => u.id)) + 1;
    const newUser = { ...user, id: newId };
    MOCK_USERS.push(newUser);
    return of(newUser);
  }

  updateUser(user: User): Observable<User> {
    const index = MOCK_USERS.findIndex(u => u.id === user.id);
    if (index !== -1) {
      MOCK_USERS[index] = user;
    }
    return of(user);
  }

  deleteUser(id: number): Observable<void> {
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index !== -1) {
      MOCK_USERS.splice(index, 1);
    }
    return of(undefined);
  }
}

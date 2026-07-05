import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Observable, of, throwError, catchError, tap, map, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { EnvConfigService } from './env-config.service';

export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    liked: number[];
    role?: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private currentUser: User | null = null;
    private apiUrl: string;
    public userSubject = new BehaviorSubject<User | null>(null);

    constructor(
        public localStorageService: LocalStorageService,
        private http: HttpClient,
        private envConfig: EnvConfigService
    ) {
        this.apiUrl = this.envConfig.apiUrl;
    }

    // M15: Check HTTP-only cookie session via backend /me endpoint
    checkSession(): void {
        this.http.get<User>(`${this.apiUrl}/auth/me`, { withCredentials: true }).subscribe({
            next: (user) => {
                this.currentUser = user;
                this.userSubject.next(user);
            },
            error: () => {
                this.currentUser = null;
                this.userSubject.next(null);
            },
        });
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    getToken(): string | null {
        return null;
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(() => {
        });
        this.currentUser = null;
        this.userSubject.next(null);
    }

    login(email: string, password: string): Observable<{message: string, user: User}> {
        return this.http.post<{message: string, user: User}>(
            `${this.apiUrl}/auth/login`,
            { username: email, password },
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                if (response.user) {
                    if (!response.user.liked) {
                        response.user.liked = [];
                    }
                    this.currentUser = response.user;
                    this.userSubject.next(response.user);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Login error:', error);
                return this.loginFromLocalJSON(email, password);
            })
        );
    }

    register(username: string, email: string, password: string): Observable<{message: string, user: User}> {
        return this.http.post<{message: string, user: User}>(
            `${this.apiUrl}/auth/register`,
            { username, email, password },
            { withCredentials: true }
        ).pipe(
            tap((response) => {
                if (response.user) {
                    if (!response.user.liked) {
                        response.user.liked = [];
                    }
                    this.currentUser = response.user;
                    this.userSubject.next(response.user);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error('Register error:', error);
                throw error;
            })
        );
    }

    private loginFromLocalJSON(email: string, password: string): Observable<{message: string, user: User}> {
        return new Observable<{message: string, user: User}>((observer: any) => {
            this.http.get<{users: User[]}>('/assets/data.json').subscribe({
                next: (data) => {
                    const user = data.users.find((u: User) => 
                        (u.username === email || u.email === email) && u.password === password
                    );
                    if (user) {
                        if (!user.liked) {
                            user.liked = [];
                        }
                        this.currentUser = user;
                        this.userSubject.next(user);
                        observer.next({ message: 'Uspesna prijava (lokalno)', user: user });
                        observer.complete();
                    } else {
                        observer.error('Invalid username or password');
                    }
                },
                error: (error: HttpErrorResponse) => {
                    observer.error('Failed to load user data');
                }
            });
        });
    }

    updateCurrentUser(user: User): void {
        if (!user.liked) {
            user.liked = [];
        }
        this.currentUser = user;
        this.userSubject.next(user);
    }
    
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('Error fetching users from API:', error);
                return this.getUsersFromLocalJSON();
            })
        );
    }
    
        private getUsersFromLocalJSON(): Observable<User[]> {
        return this.http.get<{users: User[]}>('/assets/data.json').pipe(
            tap((data: {users: User[]}) => console.log('Using local JSON data for users as fallback')),
            catchError((error: HttpErrorResponse) => {
                console.error('Error loading local JSON data:', error);
                return of([]);
            }),
            map((data: {users: User[]}) => data.users || [])
        );
    }
    
    getUserByUsername(username: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${username}`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error(`Error fetching user ${username} from API:`, error);
                return this.getUserFromLocalJSON(username);
            })
        );
    }

    // M19: Check if current user is admin
    isAdmin(): boolean {
        return this.currentUser?.role === 'admin';
    }
    
    private getUserFromLocalJSON(username: string): Observable<User> {
        return this.http.get<{users: User[]}>('/assets/data.json').pipe(
            tap((data) => console.log('Using local JSON data for user as fallback')),
            catchError((error: HttpErrorResponse) => {
                console.error('Error loading local JSON data:', error);
                return of({ users: [] });
            }),
            map((data) => {
                const user = data.users.find((u: User) => u.username === username);
                if (!user) {
                    throw new Error('User not found');
                }
                return user;
            })
        );
    }
}

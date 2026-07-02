import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true,
                },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(authService).toBeTruthy();
    });

    it('should add Authorization header when token exists', () => {
        authService.getToken.and.returnValue('test-token');

        httpClient.get('/test').subscribe();

        const httpRequest = httpMock.expectOne('/test');
        expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add Authorization header when token does not exist', () => {
        authService.getToken.and.returnValue(null);

        httpClient.get('/test').subscribe();

        const httpRequest = httpMock.expectOne('/test');
        expect(httpRequest.request.headers.get('Authorization')).toBeNull();
    });

    it('should logout and redirect on 401 error', () => {
        authService.getToken.and.returnValue('test-token');

        httpClient.get('/test').subscribe({
            error: () => {
                expect(authService.logout).toHaveBeenCalled();
                expect(router.navigate).toHaveBeenCalledWith(['/login']);
            }
        });

        const httpRequest = httpMock.expectOne('/test');
        httpRequest.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
});

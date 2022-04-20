import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpParams
} from '@angular/common/http';
import { take, exhaustMap, tap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  webbridge: string = '';
  token: string = '';

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(
        (user) => { 
            this.webbridge = user.webbridge;
            this.token = user.token;
        }
      )
   
  }


    intercept(request: HttpRequest<any>, next: HttpHandler) {
        
        const isApiUrl = request.url.startsWith(this.webbridge);
        
        if (this.token && isApiUrl) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${this.token}` }
            });
        }
        return next.handle(request);
    }
}

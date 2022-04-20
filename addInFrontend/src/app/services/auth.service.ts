import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { ErrmessagesService } from './errmessages.service';



export interface AuthResponseData {
  jwt: string
  idToken: string
}

@Injectable()
export class AuthService {

  BACKENDURL = '<Hostname>'
  private nullUser: User = { email: '', token: '', webbridge: '' }
  private usersubject = new BehaviorSubject<User>(this.nullUser);
  user$: Observable<User> = this.usersubject.asObservable();

  // private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errmessagesService: ErrmessagesService,
  ) {
    const userData = localStorage.getItem('userData');
    if (userData) {
      let userparsed: User = this.nullUser
      try {
        userparsed = JSON.parse(userData);
        if (userparsed) {
          this.usersubject.next(userparsed);
        } else {
          console.log("NO USER")
        }
      } catch (e) {
        alert(e); // error in the above string (in this case, yes)!
      }

    }
  }


  login(email: string, password: string, webbridge: string) {
    return this.http
      .post<AuthResponseData>(
        this.BACKENDURL + '/login/',
        {
          username: email,
          password: password,
          webBridgeURL: webbridge
        },
      )
      .pipe(
        catchError(
          err => {
            this.errmessagesService.showError(err.error.detail);
            console.log(err.error.detail);
            return throwError(() => { });
          }
        ),
        tap(resData => {
          this.handleAuthentication(
            email,
            resData.jwt,
            webbridge
          );
        }),
        shareReplay()
      );
  }




  logout() {
    this.usersubject.next(this.nullUser);
    this.router.navigate(['/']);
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('invitation');

    //TODO add delete session from CMS?

  }


  private handleAuthentication(
    email: string,
    jwt: string,
    webbridge: string
  ) {

    const user: User = {
      email: email,
      token: jwt,
      webbridge: webbridge
    };

    this.usersubject.next(user);
    localStorage.setItem('userData', JSON.stringify(user));
  }

}

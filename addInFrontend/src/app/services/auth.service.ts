import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { AuthResponseData, User } from '../models/user.model';
import { ErrmessagesService } from './errmessages.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthService {

  BACKENDURL = environment.backendurl
  private nullUser: User = { email: '', token: '', webbridge: '' }
  private usersubject = new BehaviorSubject<User>(this.nullUser);
  private tokenisexpired = new BehaviorSubject<Boolean>(false);
  user$: Observable<User> = this.usersubject.asObservable();
  tokenisexpired$: Observable<Boolean> = this.tokenisexpired.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private errmessagesService: ErrmessagesService,
  ) {
    this.page_navigator()
  }



  private page_navigator() {
    this.check_login()
    const user = this.usersubject.getValue()
    if (user.token) {
      this.validate().subscribe(
        {
          error: () => {
            this.router.navigate(["login", { 'webbridge': user.webbridge }])
            this.tokenisexpired.next(true)
          },
          complete: () => {
            this.router.navigateByUrl("preferences")
          }
        }
      )
    }
  }

  private validate() {
    const userData = this.usersubject.getValue()
    return this.http
      .post(
        this.BACKENDURL + '/validate',
        {
          webBridgeURL: userData.webbridge,
          authToken: userData.token,
          username: userData.email,
        },
      )
      .pipe(
        catchError(
          err => {
            console.log(err.error.detail);
            this.errmessagesService.showError("Token has been expired. Please login again.");
            return throwError(() => { });
          }
        ),
        shareReplay()
      )
  }

  private check_login() {
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
            if (err.error.detail) {
              this.errmessagesService.showError(err.error.detail);
            }
            else if (err.message) {
              this.errmessagesService.showError(err.message)
            }
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
    this.tokenisexpired.next(false);
    this.router.navigate(['/']);
    localStorage.removeItem('userData');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('invitation');
    this.errmessagesService.showError("");
    this.errmessagesService.showMesssage("");
    //TODO add delete session from CMS?
  }

  handleAuthentication(
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

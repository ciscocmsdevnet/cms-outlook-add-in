import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { AccessMethod, AccessMethodResponse, InvitationResponse, Preferences, Space } from '../models/prefernces.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { ErrmessagesService } from './errmessages.service';

@Injectable()
export class CmsapiService {

  user: User | undefined;

  private errorsubject = new BehaviorSubject<string>('');
  error$: Observable<String> = this.errorsubject.asObservable();

  private defspacesubject = new BehaviorSubject<Space[]>([]);
  defspaces$: Observable<Space[]> = this.defspacesubject.asObservable();

  private defaccesssubject = new BehaviorSubject<AccessMethod[]>([]);
  defaccess$: Observable<AccessMethod[]> = this.defaccesssubject.asObservable();

  private userprefsubject = new BehaviorSubject<Preferences|null>(null);
  userpref$: Observable<Preferences|null> = this.userprefsubject.asObservable();

  private invitationsubject = new BehaviorSubject<InvitationResponse|null>(null);
  private prev_invitation: InvitationResponse|null = null;
  invitation$: Observable<InvitationResponse|null> = this.invitationsubject.asObservable();

  constructor( private http: HttpClient, 
               private authService: AuthService,
               private errmessagesService: ErrmessagesService) {
    
    this.authService.user$.subscribe( (user) => { this.user = user})
    this.getCurrentUserPref()
    this.getCurrentInvitation()    
  }

  private getCurrentUserPref(){
    const userPref = localStorage.getItem('userPreferences');
    if (userPref) {
        let userprefparsed: Preferences;
      try {
        userprefparsed = JSON.parse(userPref);
        if (userprefparsed) { 
          this.userprefsubject.next(userprefparsed);
        } 
      } catch(e) {
        this.errmessagesService.showError('Failed to get stored');
        console.log(e); 
      }
    }
  }


  private getCurrentInvitation() {
    const invitation = localStorage.getItem('invitation');
    if (invitation) {
        let invitationparsed: InvitationResponse;
      try {
        invitationparsed = JSON.parse(invitation);
        if (invitationparsed) { 
          this.invitationsubject.next(invitationparsed);
        } 
      } catch(e) {
          this.errmessagesService.showError('Failed to get stored Invitation');
          console.log(e);
      }
    }
  }

  
  validate() {
    return this.http
    .post(
      this.authService.BACKENDURL+'/validate',
      {
        webBridgeURL: this.user!.webbridge,
        authToken: this.user!.token,
        username: this.user!.email,
      },
    )
    .pipe(
      catchError(
        err => {
          console.log(err.error.detail);
          this.errmessagesService.showError("Token has been expired. Please login again.");
          return throwError(() => {});
        }
      ),
      shareReplay()
      )
  }

  getUserSpaces() {
    this.errmessagesService.showMesssage('');
    return this.http
    .post(
      this.authService.BACKENDURL+'/getUserSpaces/',
      {
        authToken: this.user!.token,
        webBridgeURL: this.user!.webbridge
      },
    )
    .pipe(
      catchError(
        e => {
          console.log(e)
          this.errmessagesService.showError('Failed to get spaces')
          return throwError(() => {});
        },
      ),
        map((data: any) => {
          return data.spaces;
        }),
        tap(
          (resData: any[]) => {
            let defaultspaces: Space[] = [];
            if (resData.length > 0) {
              resData.forEach((space: Space) => {
                defaultspaces.push({guid: space.guid, name: space.name, uri: space.uri})
              });
            } else {
              defaultspaces.push({guid: '', name: 'No spaces on CMS', uri: ''})
            }
            defaultspaces.unshift({guid: '', name: '', uri:''})
            this.defspacesubject.next(defaultspaces)
          },
        ),
        shareReplay()
        )
  }

  getSpaceAccessMethods(selectedSpace: Space) {
    this.defaccesssubject.next([])
    this.errmessagesService.showMesssage('');
    return this.http
    .post<AccessMethodResponse>(
      this.authService.BACKENDURL+'/getSpaceAccessMethods/',
      {
        spaceGUID: selectedSpace.guid,
        authToken: this.user?.token,
        webBridgeURL: this.user?.webbridge
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
          return throwError(() => {});
        }
      ),
        tap((resData)=> {
            let defaultaccessmethod: AccessMethod[] = [];
            if (resData.accessMethods) {
              resData.accessMethods.forEach((accessMethod: AccessMethod) => {
              defaultaccessmethod.push({guid: accessMethod.guid, name: accessMethod.name, 'uri': accessMethod.uri})
              });
              }
            defaultaccessmethod.unshift({guid: '', name: '', uri:''})
            this.defaccesssubject.next(defaultaccessmethod)
        }),
        shareReplay()
        )

  }

  getMeetingInformation(selectedSpace: Space, selectedAccess: AccessMethod) {
    this.invitationsubject.next(null)
    this.errmessagesService.showMesssage('');
    return this.http
    .post<InvitationResponse>(
      this.authService.BACKENDURL+'/getMeetingInformation/',
      {
        spaceGUID: selectedSpace.guid,
        authToken: this.user?.token,
        webBridgeURL: this.user?.webbridge,
        accessMethodGUID: selectedAccess.guid
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
          return throwError(() => {});
        }
      ),
        tap((invitation: InvitationResponse)=> {
            this.invitationsubject.next(invitation)
            this.errmessagesService.showMesssage("A new meeting invitation is available." )
        }),
        shareReplay()
        )
  }

  updateInvitation(index: number) {
    if (index==1) {
      if (this.invitationsubject.value) {
        this.prev_invitation = this.invitationsubject.value
        this.invitationsubject.next(null)
      }
    }else{
      if (this.prev_invitation) {
        this.invitationsubject.next(this.prev_invitation)
      } else {
        let inv = localStorage.getItem('invitation')
        if (inv) {
          this.invitationsubject.next(JSON.parse(inv))
        }
      }
    }
  }

  clearInvitationSubj(){
    this.prev_invitation = null
    this.invitationsubject.next(null)
  }


  getPredefinedSites() {
    return this.http
    .get<string[]>(
      this.authService.BACKENDURL+'/getPredefinedSites/'
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
          return throwError(() => {});
        }
      ),
      tap(
        (m) => {
          return m.push('Enter your own site')
        }
      ),
      shareReplay()
    )
  }


  savepreferences(userPreferences: Preferences, selectedSpace: Space, selectedAccess: AccessMethod){
    userPreferences.defaultspace = selectedSpace
    userPreferences.defaultaccessmethod = selectedAccess
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('invitation', JSON.stringify(this.invitationsubject.getValue()));
  }


}

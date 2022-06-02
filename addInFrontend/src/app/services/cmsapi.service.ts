import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { AccessMethod, AccessMethodResponse, InvitationResponse, NewSpaceResponse, Preferences, Space, SpaceTemplate } from '../models/prefernces.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { ErrmessagesService } from './errmessages.service';

@Injectable()
export class CmsapiService {

  user: User | undefined;

  private spaces_subject = new BehaviorSubject<Space[]>([]);
  private accessmethods_subject = new BehaviorSubject<AccessMethod[]>([]);
  private userprefsubject = new BehaviorSubject<Preferences|null>(null);
  private invitationsubject = new BehaviorSubject<InvitationResponse|null>(null);

  spaces$: Observable<Space[]> = this.spaces_subject.asObservable();
  accessmethods$: Observable<AccessMethod[]> = this.accessmethods_subject.asObservable();
  userpref$: Observable<Preferences|null> = this.userprefsubject.asObservable();
  invitation$: Observable<InvitationResponse|null> = this.invitationsubject.asObservable();

  private prev_invitation: InvitationResponse|null = null;

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

  
  
  getUserSpaces() {
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
            let userspaces: Space[] = [];
            if (resData.length > 0) {
              resData.forEach((space: Space) => {
                userspaces.push({guid: space.guid, name: space.name})
              });
            } else {
              userspaces.push({guid: '', name: 'No spaces on CMS'})
            }
            userspaces.unshift({guid: '', name: ''})
            this.spaces_subject.next(userspaces)
          },
        ),
        shareReplay()
        )
  }

  getSpaceAccessMethods(selectedSpaceGuid: string) {
    this.accessmethods_subject.next([])
    return this.http
    .post<AccessMethodResponse>(
      this.authService.BACKENDURL+'/getSpaceAccessMethods/',
      {
        spaceGUID: selectedSpaceGuid,
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
            this.accessmethods_subject.next(defaultaccessmethod)
        }),
        shareReplay()
        )

  }

  getMeetingInformation(selectedSpaceGUID: string, selectedAccessGUID: string) {
    this.invitationsubject.next(null)
    this.errmessagesService.showMesssage('');
    return this.http
    .post<InvitationResponse>(
      this.authService.BACKENDURL+'/getMeetingInformation/',
      {
        spaceGUID: selectedSpaceGUID,
        authToken: this.user?.token,
        webBridgeURL: this.user?.webbridge,
        accessMethodGUID: selectedAccessGUID
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


  getPredefinedSites(): Observable<string[]> {
    return this.http
    .post<string>(
      this.authService.BACKENDURL+'/getWebBridges/',
      {}
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
      map(
        (m) => {
          const lm: string[] = JSON.parse(m)['webbridges']
          lm.push('Enter your own site')
          return lm
        }
      ),
      shareReplay()
    )
  }

  getUserSpaceTemplates() {
    return this.http
    .post<any>(
      this.authService.BACKENDURL+'/getSpaceTemplates',
      {
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
      map(
        (m) => {
          const lm: SpaceTemplate[] = m['coSpaceTemplates']
          // if (lm.length == 0) {
          //   return [{"name":"No templates", "id": ""}]
          // }
          return lm
        }
      ),
      shareReplay()
    )
  }

  // private saveDefaultSpaceAndMethodOnBackend(selectedSpaceGuid: string, selectedAccessGiud: string) {
  //   return this.http
  //   .post<any>(
  //     this.authService.BACKENDURL+'/defaultSpace/',
  //     {
  //       spaceGUID: selectedSpaceGuid,
  //       authToken: this.user?.token,
  //       webBridgeURL: this.user?.webbridge,
  //       accessMethodGUID: selectedAccessGiud
  //     },
  //   )
  //   .pipe(
  //     catchError(
  //       err => {
  //         if (err.error.detail) {
  //           this.errmessagesService.showError(err.error.detail);
  //         } 
  //         else if (err.message) {
  //           this.errmessagesService.showError(err.message)
  //         }          
  //         return throwError(() => {});
  //       }
  //     ),
  //     shareReplay()
  //   )
  // }

  createSpaceFromTemplate(space_name: string, template_id: string) {
    // console.log("created SpaceFromTemplate", space_name, template_id)
    // return of("created SpaceFromTemplate")
    return this.http
    .post<NewSpaceResponse>(
      this.authService.BACKENDURL+'/createSpace',
      {
        authToken: this.user?.token,
        webBridgeURL: this.user?.webbridge,
        templateid: template_id,
        spacename: space_name
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
      tap(
         space => {

         }
      ),
      shareReplay()
    )
  }


  savepreferences(userPreferences: Preferences){
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('invitation', JSON.stringify(this.invitationsubject.getValue()));
    // this.saveDefaultSpaceAndMethodOnBackend(userPreferences.defaultspaceGUID, userPreferences.defaultaccessmethodGUID).subscribe()
  }


}

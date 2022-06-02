import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AccessMethod, InvitationResponse, Preferences, Space } from 'src/app/models/prefernces.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { OutlookService } from 'src/app/services/outlook.service';

@Component({
  selector: 'app-select-space',
  templateUrl: './select-space.component.html',
  styleUrls: ['./select-space.component.css']
})
export class SelectSpaceComponent implements OnInit {
  public tabIndex = 0;
  public selectedSpaceGUID: string = '';
  public selectedAccessGUID: string = '';
  userPreferences: Preferences = { 'defaultspaceGUID': this.selectedSpaceGUID, 'defaultaccessmethodGUID': this.selectedAccessGUID };
  
  @Input()
  cmsapiServce!: CmsapiService;
  @Input()
  errmessageService!: ErrmessagesService
  @Input()
  createdSpaceId!: string


  defspaces$: Observable<Space[]> | undefined;
  defaccess$: Observable<AccessMethod[]> | undefined;
  userprefs$: Observable<Preferences | null> | undefined;
  invitation$: Observable<InvitationResponse | null> | undefined;
  constructor(
    private outlookService: OutlookService
  ) { }

  ngOnInit(): void {
    this.defspaces$ = this.cmsapiServce.spaces$;
    this.defaccess$ = this.cmsapiServce.accessmethods$;
    this.invitation$ = this.cmsapiServce.invitation$;
    this.getStoredInformation()
    this.cmsapiServce.getUserSpaces().subscribe();
    if (this.createdSpaceId) {
      this.selectedSpaceGUID = this.createdSpaceId
      this.cmsapiServce.getSpaceAccessMethods(this.selectedSpaceGUID).subscribe()
    } 
  }

  savePreferences(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.userPreferences.defaultspaceGUID = this.selectedSpaceGUID
    this.userPreferences.defaultaccessmethodGUID = this.selectedAccessGUID
    this.cmsapiServce.savepreferences(this.userPreferences)
    this.errmessageService.showMesssage('Preferences saved!');
  }

  changeDefSpace() {
    this.selectedAccessGUID = '';
    this.cmsapiServce.clearInvitationSubj()
    if (this.selectedSpaceGUID != '') {
      this.cmsapiServce.getSpaceAccessMethods(this.selectedSpaceGUID).subscribe()
    }
  }

  changeDefAccess() {
    if (this.selectedSpaceGUID != '' && this.selectedAccessGUID != '') {
      this.cmsapiServce.getMeetingInformation(this.selectedSpaceGUID, this.selectedAccessGUID).subscribe()
    } else {
      this.cmsapiServce.clearInvitationSubj()
    }
  }

  getMeetinglink() {
    this.errmessageService.showMesssage('');
    this.outlookService.run_command()
  }

  getStoredInformation() {
    this.userprefs$ = this.cmsapiServce.userpref$;
    this.userprefs$.subscribe(
      {
        next: (userpref) => {
          if (userpref) {
            this.userPreferences = userpref;
            this.selectedSpaceGUID = userpref.defaultspaceGUID;
            
            if (userpref.defaultaccessmethodGUID != '') {
              this.cmsapiServce.getSpaceAccessMethods(this.selectedSpaceGUID).subscribe(
                {
                  next: ()=>{
                    this.selectedAccessGUID = userpref.defaultaccessmethodGUID;
                  }
                }
              )
            }
          } 
        }
      }
    )
  }

}

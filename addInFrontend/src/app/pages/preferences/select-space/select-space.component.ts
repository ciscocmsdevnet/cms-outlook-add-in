import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AccessMethod, InvitationResponse, Preferences, Space } from 'src/app/models/prefernces.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';

@Component({
  selector: 'app-select-space',
  templateUrl: './select-space.component.html',
  styleUrls: ['./select-space.component.css']
})
export class SelectSpaceComponent implements OnInit {
  public tabIndex = 0;
  public selectedDefSpace: Space = { 'name': '', 'guid': '', 'uri': '' };
  public selectedNewSpace: Space = { 'name': '', 'guid': '', 'uri': '' };
  public selectedDefAccess: AccessMethod = { 'name': '', 'guid': '', 'uri': '' };
  public selectedNewAccess: AccessMethod = { 'name': '', 'guid': '', 'uri': '' };
  userPreferences: Preferences = { 'defaultspace': this.selectedDefSpace, 'defaultaccessmethod': this.selectedDefAccess };
  
  @Input()
  cmsapiServce!: CmsapiService;
  @Input()
  errmessageService!: ErrmessagesService
  error: any;
  defspaces$: Observable<Space[]> | undefined;
  newspaces$: Observable<Space[]> | undefined;
  defaccess$: Observable<AccessMethod[]> | undefined;
  newaccess$: Observable<AccessMethod[]> | undefined;
  userprefs$: Observable<Preferences | null> | undefined;
  invitation$: Observable<InvitationResponse | null> | undefined;
  constructor(
  ) { }

  ngOnInit(): void {
    this.defspaces$ = this.cmsapiServce.spaces$;
    this.defaccess$ = this.cmsapiServce.accessmethods$;
    this.invitation$ = this.cmsapiServce.invitation$;
    this.cmsapiServce.getUserSpaces().subscribe();
    this.getStoredInformation()
  }

  savePreferences(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.userPreferences.defaultspace = this.selectedDefSpace
    this.userPreferences.defaultaccessmethod = this.selectedDefAccess
    if (this.selectedNewSpace.guid == '') {
      this.cmsapiServce.savepreferences(this.userPreferences, this.selectedDefSpace, this.selectedDefAccess)
    } else {
      this.cmsapiServce.savepreferences(this.userPreferences, this.selectedNewSpace, this.selectedNewAccess)
    }
    this.errmessageService.showMesssage('Preferences saved!');
  }

  changeDefSpace() {
    this.selectedDefAccess.guid = '';
    this.cmsapiServce.clearInvitationSubj()
    if (this.selectedDefSpace.guid != '') {
      this.cmsapiServce.getSpaceAccessMethods(this.selectedDefSpace).subscribe()
    }
  }

  changeDefAccess() {
    if (this.selectedDefSpace.guid != '' && this.selectedDefAccess.guid != '') {
      this.cmsapiServce.getMeetingInformation(this.userPreferences.defaultspace, this.userPreferences.defaultaccessmethod).subscribe()
    } else {
      this.cmsapiServce.clearInvitationSubj()
    }
  }

  getStoredInformation() {
    this.userprefs$ = this.cmsapiServce.userpref$;
    this.userprefs$.subscribe(
      {
        next: (userpref) => {
          if (userpref) {
            this.userPreferences = userpref;
            this.selectedDefSpace = userpref.defaultspace;
            this.selectedDefAccess = userpref.defaultaccessmethod;
            if (this.selectedDefAccess.guid != '') {
              this.cmsapiServce.getSpaceAccessMethods(this.selectedDefSpace).subscribe()
            }
          } 
        }
      }
    )
  }

}

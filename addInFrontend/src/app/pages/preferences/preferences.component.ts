import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { AccessMethod, InvitationResponse, Preferences, Space } from 'src/app/models/prefernces.model';
import { User } from 'src/app/models/user.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { OutlookService } from 'src/app/services/outlook.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {

  message: string = '';

  public tabIndex = 0;
  public selectedDefSpace: Space = { 'name': '', 'guid': '', 'uri': '' };
  public selectedNewSpace: Space = { 'name': '', 'guid': '', 'uri': '' };
  public selectedDefAccess: AccessMethod = { 'name': '', 'guid': '', 'uri': '' };
  public selectedNewAccess: AccessMethod = { 'name': '', 'guid': '', 'uri': '' };
  userPreferences: Preferences = { 'defaultspace': this.selectedDefSpace, 'defaultaccessmethod': this.selectedDefAccess };
  

  currentUser$!: Observable<User>;
  error: any;

  defspaces$: Observable<Space[]> | undefined;
  newspaces$: Observable<Space[]> | undefined;
  defaccess$: Observable<AccessMethod[]> | undefined;
  newaccess$: Observable<AccessMethod[]> | undefined;
  userprefs$: Observable<Preferences | null> | undefined;
  invitation$: Observable<InvitationResponse | null> | undefined;
  


  constructor(
    private cmsapiServce: CmsapiService,
    private outlookService: OutlookService,
    private errmessageService: ErrmessagesService,
  ) { }


  ngOnInit(): void {
    this.defspaces$ = this.cmsapiServce.defspaces$;
    this.defaccess$ = this.cmsapiServce.defaccess$;
    this.invitation$ = this.cmsapiServce.invitation$;
    this.cmsapiServce.getUserSpaces().subscribe();
    this.getStoredInformation()
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


  getMeetinglink() {
    this.errmessageService.showMesssage('');
    this.outlookService.run_command()
  }

  changeDefSpace() {
    this.message = ''
    this.selectedDefAccess.guid = '';
    if (this.selectedDefSpace.guid != '') {
      this.cmsapiServce.getSpaceAccessMethods(this.selectedDefSpace).subscribe()
    } 
   
  }

  changeDefAccess() {
    this.message = ''
    if (this.selectedDefSpace.guid != '' && this.selectedDefAccess.guid != '') {
      this.cmsapiServce.getMeetingInformation(this.userPreferences.defaultspace, this.userPreferences.defaultaccessmethod).subscribe()
    } 
  }

  


}

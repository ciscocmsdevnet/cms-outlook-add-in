import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AccessMethod, InvitationResponse, Preferences, Space } from 'src/app/models/prefernces.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { OutlookService } from 'src/app/services/outlook.service';
import { SelectedSpaceService } from 'src/app/services/selected-space.service';

@Component({
  selector: 'app-select-space',
  templateUrl: './select-space.component.html',
  styleUrls: ['./select-space.component.css'],
})
export class SelectSpaceComponent implements OnInit {
  @Input()
  cmsapiServce!: CmsapiService;

  public tabIndex = 0;
  public selectedSpaceGUID: string = '';
  public selectedAccessGUID: string = '';
  public selectedSpacesForm!: FormGroup;


  private userPreferences: Preferences = { 'defaultspaceGUID': this.selectedSpaceGUID, 'defaultaccessmethodGUID': this.selectedAccessGUID };

  // Observables
  defspaces$: Observable<Space[]> | undefined;
  defaccess$: Observable<AccessMethod[]> | undefined;
  invitation$: Observable<InvitationResponse | null> | undefined;

  private userpref$: Observable<Preferences | null> | undefined;
  private selectedspaceid$: Observable<string> | undefined;
  private selectedaccessid$: Observable<string> | undefined;

  constructor(
    private outlookService: OutlookService,
    private errmessageService: ErrmessagesService,
    private selectedSpaceService: SelectedSpaceService
  ) { }

  ngOnInit(): void {
    this.defspaces$ = this.cmsapiServce.spaces$;
    this.defaccess$ = this.cmsapiServce.accessmethods$;
    this.invitation$ = this.cmsapiServce.invitation$;
    this.selectedspaceid$ = this.selectedSpaceService.selectedspaceid$
    this.selectedaccessid$ = this.selectedSpaceService.selectedaccessid$
    this.initForm()
    this.getStoredPreferences()
    this.cmsapiServce.getUserSpaces().subscribe();

    this.selectedspaceid$.subscribe(
      {
        next: (spaceid) => {
          this.newSpaceIdAction(spaceid)
        }
      }
    )

    this.selectedaccessid$.subscribe(
      {
        next: (accessid) => {
          this.newAccessIdAction(accessid)
        }
      }
    )

  }
  
  private initForm() {
    this.selectedSpacesForm = new FormGroup({
      'space': new FormControl<string>('',
        [
          Validators.required,
          Validators.minLength(1)

        ]),
      'access': new FormControl<string>('',
        [
          Validators.required,
          Validators.minLength(1)
        ]
      ),
    });
  }

  getMeetinglink() {
    this.errmessageService.showMesssage('');
    this.outlookService.run_command()
  }

  savePreferences() {
    this.userPreferences.defaultspaceGUID = this.selectedSpaceGUID
    this.userPreferences.defaultaccessmethodGUID = this.selectedAccessGUID
    this.cmsapiServce.savepreferences(this.userPreferences)
    this.errmessageService.showMesssage('Preferences Saved, this space will be used as your instant meeting room.');
  }

  changeDefSpace() {
    this.selectedSpaceService.setSelectedSpaceid(this.selectedSpaceGUID)
    this.selectedSpaceService.setSelectedAccessid(this.selectedAccessGUID)
  }

  changeDefAccess() {
    this.selectedSpaceService.setSelectedAccessid(this.selectedAccessGUID)
  }

  private newSpaceIdAction(spaceid: string) {
    this.selectedAccessGUID = '';
    this.selectedSpaceGUID = spaceid
    this.cmsapiServce.getSpaceAccessMethods(this.selectedSpaceGUID).subscribe()
  }

  private newAccessIdAction(accessid: string) {
    this.selectedAccessGUID = accessid
    if (accessid == "") {
      this.cmsapiServce.clearInvitationSubj()
    } else {
      this.cmsapiServce.getMeetingInformation(this.selectedSpaceGUID, this.selectedAccessGUID).subscribe()
    }
  }

  private getStoredPreferences() {
    this.userpref$ = this.cmsapiServce.userpref$;
    this.userpref$.subscribe(
      {
        next: (userpref) => {
          if (userpref) {
            this.userPreferences = userpref;
            this.selectedSpaceService.setSelectedSpaceid(userpref.defaultspaceGUID)
            this.selectedSpaceService.setSelectedAccessid(userpref.defaultaccessmethodGUID)
            this.selectedSpaceGUID = userpref.defaultspaceGUID;
            this.selectedAccessGUID = userpref.defaultaccessmethodGUID;
            this.cmsapiServce.getCurrentInvitation()
          }
        }
      }
    )
  }


}

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  public selectedSpaceGUID: boolean = false;
  private userPreferences: Preferences = { 'defaultspaceGUID': '', 'defaultaccessmethodGUID': ''};

  selectedSpacesForm = this.fb.group({
    space: ['', Validators.required],
    access: ['', Validators.required]
  });

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
    private selectedSpaceService: SelectedSpaceService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.defspaces$ = this.cmsapiServce.spaces$;
    this.defaccess$ = this.cmsapiServce.accessmethods$;
    this.invitation$ = this.cmsapiServce.invitation$;
    this.selectedspaceid$ = this.selectedSpaceService.selectedspaceid$
    this.selectedaccessid$ = this.selectedSpaceService.selectedaccessid$
    this.getStoredPreferences()
    this.cmsapiServce.getUserSpaces().subscribe();

    this.selectedspaceid$.subscribe(
      {
        next: (spaceid) => {
          this.newSpaceIdAction(spaceid)
          if (spaceid == '') {
            this.selectedSpaceGUID = false
          } else {
            this.selectedSpaceGUID = true
          }
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

  getMeetinglink() {
    this.errmessageService.showMesssage('');
    this.outlookService.run_command()
  }

  savePreferences() {
    this.userPreferences.defaultspaceGUID = this.selectedSpacesForm.controls.space.value!
    this.userPreferences.defaultaccessmethodGUID = this.selectedSpacesForm.controls.access.value!
    this.cmsapiServce.savepreferences(this.userPreferences)
    this.errmessageService.showMesssage('Preferences Saved, this space will be used as your instant meeting room.');
  }

  changeDefSpace() {
    this.selectedSpaceService.setSelectedSpaceid(this.selectedSpacesForm.controls.space.value!)
    this.selectedSpaceService.setSelectedAccessid('')
  }

  changeDefAccess() {
    this.selectedSpaceService.setSelectedAccessid(this.selectedSpacesForm.controls.access.value!)
  }

  private newSpaceIdAction(spaceid: string) {
    this.selectedSpacesForm.controls.access.setValue("")
    this.selectedSpacesForm.controls.space.setValue(spaceid)
    if (spaceid != "") {
      this.cmsapiServce.getSpaceAccessMethods(spaceid).subscribe()
    }
  }

  private newAccessIdAction(accessid: string) {
    this.selectedSpacesForm.controls.access.setValue(accessid)
    if (accessid == '') {
      this.cmsapiServce.clearInvitationSubj()
    } else {
      this.cmsapiServce.getMeetingInformation(this.selectedSpacesForm.controls.space.value!, accessid).subscribe()
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
            this.selectedSpacesForm.controls.space.setValue(userpref.defaultspaceGUID)
            this.selectedSpacesForm.controls.access.setValue(userpref.defaultaccessmethodGUID)
            this.cmsapiServce.getCurrentInvitation()
          }
        }
      }
    )
  }


}

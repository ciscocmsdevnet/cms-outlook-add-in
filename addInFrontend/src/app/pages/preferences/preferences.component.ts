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
  public tabIndex = 0;
  public isGetLinkButtonActive = false

  invitation$: Observable<InvitationResponse | null> | undefined;
  
  constructor(
    public cmsapiServce: CmsapiService,
    private outlookService: OutlookService,
    public errmessageService: ErrmessagesService,
  ) { }

  ngOnInit(): void {
    this.invitation$ = this.cmsapiServce.invitation$
  }

  getMeetinglink() {
    this.errmessageService.showMesssage('');
    this.outlookService.run_command()
  }
  
  onTabChange(){
    this.cmsapiServce.updateInvitation(this.tabIndex)  
  }

}

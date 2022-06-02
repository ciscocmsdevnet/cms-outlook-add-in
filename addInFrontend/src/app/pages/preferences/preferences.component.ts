import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {  InvitationResponse } from 'src/app/models/prefernces.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  public tabIndex = 0;
  public isGetLinkButtonActive = false
  public newSpaceId = ''

  invitation$: Observable<InvitationResponse | null> | undefined;
  
  constructor(
    public cmsapiServce: CmsapiService,
    public errmessageService: ErrmessagesService,
  ) { }

  ngOnInit(): void {
    this.invitation$ = this.cmsapiServce.invitation$
  }

  onTabChange(){
    this.cmsapiServce.updateInvitation(this.tabIndex)  
    this.newSpaceId = ''
  }

  setTab(num: number){
    this.tabIndex = num
  }

  setNewSpaceId(id: string){
    this.newSpaceId = id
  }

}

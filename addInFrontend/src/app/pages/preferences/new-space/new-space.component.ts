import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';

@Component({
  selector: 'app-new-space',
  templateUrl: './new-space.component.html',
  styleUrls: ['./new-space.component.css']
})
export class NewSpaceComponent implements OnInit {
  @Input()
  cmsapiServce!: CmsapiService;
  @Input()
  errmessageService!: ErrmessagesService;
  
  public spacetemps: string[] = [];

  constructor(
  ) { }

  ngOnInit(): void {
    // get space templates
    this.spacetemps = ["a","b","c"]
  }

  onCreateSpace(newspaceForm: NgForm){
    console.log(newspaceForm.controls['space_name'].value, newspaceForm.controls['space_temps'].value)
  }




}

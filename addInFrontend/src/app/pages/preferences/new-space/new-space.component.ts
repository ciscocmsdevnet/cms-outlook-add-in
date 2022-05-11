import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SpaceTemplate } from 'src/app/models/prefernces.model';
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
  
  public spacetemps: SpaceTemplate[] = [];

  constructor(
  ) { }

  ngOnInit(): void {
    // get space templates
    this.cmsapiServce.getUserSpaceTemplates().subscribe(
      {
        next: (temps)=> {
          this.spacetemps = temps
        }
      }
    )
  }

  onCreateSpace(newspaceForm: NgForm){
    console.log(newspaceForm.controls['space_name'].value, newspaceForm.controls['space_temps'].value['id'])
    this.cmsapiServce.createSpaceFromTemplate(newspaceForm.controls['space_name'].value, newspaceForm.controls['space_temps'].value['id']).subscribe(
      {
        complete: ()=>{
          // change to returned value from createSpaceFromTemplate
          this.cmsapiServce.getMeetingInformation({"guid":'fed04266-6afa-4cd1-9730-05d14e0e8532','name':"aaa",'uri':''}, {"guid":'00000000-0000-0000-0000-000000000001','name':"aaa",'uri':''}).subscribe(
            {
              complete: () => {
                newspaceForm.controls['space_name'].setValue('')
                newspaceForm.controls['space_temps'].setValue('')
              }
            }
          )
        }
      }
    )
    
  }




}

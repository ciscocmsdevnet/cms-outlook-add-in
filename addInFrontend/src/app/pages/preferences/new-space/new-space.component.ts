import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  @Output() 
  switchTabevent = new EventEmitter<number>();
  @Output() 
  setNewSpace = new EventEmitter<string>();
  
  public spacetemps: SpaceTemplate[] = [];
  public showCreateButton: boolean = false;

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
    this.showCreateButton = true
    this.cmsapiServce.createSpaceFromTemplate(newspaceForm.controls['space_name'].value, newspaceForm.controls['space_temps'].value['id']).subscribe(
      {
        next: (newspace)=>{
          console.log(newspace.name)
          newspaceForm.controls['space_name'].setValue('')
          newspaceForm.controls['space_temps'].setValue('')
          this.showCreateButton = false
          this.switchTabevent.emit(0)
          this.setNewSpace.emit(newspace.guid)
          // this.cmsapiServce.getUserSpaces().subscribe();
          // this.cmsapiServce.getMeetingInformation(newspace.guid, '00000000-0000-0000-0000-000000000001').subscribe(
          //   {
          //     complete: () => {
          //       newspaceForm.controls['space_name'].setValue('')
          //       newspaceForm.controls['space_temps'].setValue('')
          //     }
          //   }
          // )
        },
        
      }
      
    )
    
  }




}

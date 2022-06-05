import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SpaceTemplate } from 'src/app/models/prefernces.model';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { SelectedSpaceService } from 'src/app/services/selected-space.service';

@Component({
  selector: 'app-new-space',
  templateUrl: './new-space.component.html',
  styleUrls: ['./new-space.component.css']
})
export class NewSpaceComponent implements OnInit {
  @Input()
  cmsapiServce!: CmsapiService;

  @Output() 
  switchTabevent = new EventEmitter<number>();
  
  public spacetemps: SpaceTemplate[] = [];
  public showCreateButton: boolean = false;

  constructor(
    private errmessageService: ErrmessagesService,
    private selectedSpaceService: SelectedSpaceService
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
          this.errmessageService.showMesssage("New space '"+newspace.name+"' has been created!")
          newspaceForm.controls['space_name'].setValue('')
          newspaceForm.controls['space_temps'].setValue('')
          this.showCreateButton = false
          this.switchTabevent.emit(0)
          this.cmsapiServce.getUserSpaces().subscribe(
            {
              next: () => {
                this.selectedSpaceService.setSelectedSpaceid(newspace.guid)
                this.selectedSpaceService.setSelectedAccessid('')
              }
            }
          )
          
        }
      }
    )
  }

}

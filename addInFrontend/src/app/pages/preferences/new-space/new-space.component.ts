import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  public showLoading: boolean = false;
  public validForm: boolean = false;

  createSpaceForm = this.fb.group({
    name: ['', Validators.required],
    templates: ['', Validators.required]
  });

  constructor(
    private errmessageService: ErrmessagesService,
    private selectedSpaceService: SelectedSpaceService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    // get space templates
    this.cmsapiServce.getUserSpaceTemplates().subscribe(
      {
        next: (temps) => {
          this.spacetemps = temps
        }
      }
    )
  }

  onCreateSpace() {
    this.showLoading = true
    if (this.createSpaceForm.valid) {
      this.cmsapiServce.createSpaceFromTemplate(this.createSpaceForm.controls.name.value!, this.createSpaceForm.controls.templates.value!).subscribe(
        {
          next: (newspace) => {
            this.errmessageService.showMesssage("New space '" + newspace.name + "' has been created!")
            // give time to CMS to create/update coSpaces DB.
            setTimeout(
              () => {
                this.createSpaceForm.controls.name.setValue('')
                this.createSpaceForm.controls.templates.setValue('')
                this.cmsapiServce.getUserSpaces().subscribe(
                  {
                    next: () => {
                      this.showLoading = false
                      this.selectedSpaceService.setSelectedSpaceid(newspace.guid)
                      this.selectedSpaceService.setSelectedAccessid('')
                    },
                    complete: () => {
                      this.switchTabevent.emit(0)
                    }
                    
                  }
                )
              }, 500
              )
                        
          }
        }
      )
    }
    
  }

}

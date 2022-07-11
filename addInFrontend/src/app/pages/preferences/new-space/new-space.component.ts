import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  createSpaceForm!: FormGroup;

  constructor(
    private errmessageService: ErrmessagesService,
    private selectedSpaceService: SelectedSpaceService
  ) { }

  ngOnInit(): void {
    this.initForm()
    // get space templates
    this.cmsapiServce.getUserSpaceTemplates().subscribe(
      {
        next: (temps) => {
          this.spacetemps = temps
        }
      }
    )
  }

  private initForm() {
    this.createSpaceForm = new FormGroup({
      'name': new FormControl<string>('',
        [
          Validators.required,
          Validators.minLength(1)

        ]),
      'templates': new FormControl<string>('',
        [
          Validators.required,
          Validators.minLength(1)
        ]
      ),
    });
  }

  onCreateSpace() {
    this.showLoading = true
    this.cmsapiServce.createSpaceFromTemplate(this.createSpaceForm.controls['name'].value, this.createSpaceForm.controls['templates'].value).subscribe(
      {
        next: (newspace) => {
          this.errmessageService.showMesssage("New space '" + newspace.name + "' has been created!")
          this.createSpaceForm.controls['name'].setValue('')
          this.createSpaceForm.controls['templates'].setValue('')
          this.cmsapiServce.getUserSpaces().subscribe(
            {
              next: () => {
                this.showLoading = false
                this.selectedSpaceService.setSelectedSpaceid(newspace.guid)
                this.selectedSpaceService.setSelectedAccessid('')
                this.switchTabevent.emit(0)
              }
            }
          )
        }
      }
    )
  }

}

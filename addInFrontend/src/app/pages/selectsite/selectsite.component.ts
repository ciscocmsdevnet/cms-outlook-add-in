import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-selectsite',
  templateUrl: './selectsite.component.html',
  styleUrls: ['./selectsite.component.css']
})
export class SelectsiteComponent implements OnInit {

  meetinglist$!: Observable<string[]>;
  webbridgeForm!: FormGroup;  

  constructor(
    private router: Router, 
    private cmsapiService: CmsapiService,
    private errmessageService: ErrmessagesService
  ) { }

  ngOnInit(): void {
    this.meetinglist$ = this.cmsapiService.getPredefinedSites()
    this.initForm()
  }

  initForm() {
    this.webbridgeForm = new FormGroup({
      radio: new FormControl('', Validators.required),
      input: new FormControl({value:'', disabled:true}, Validators.required),
    });
  }

  changeSelection() {
    if (this.webbridgeForm.controls['radio'].value == "Enter your own site") {
      this.webbridgeForm.controls['input'].enable()
    } else {
      this.webbridgeForm.controls['input'].disable()
    }
  }

  onNext(): void {
    var selectedwebbridge: string = '';
    this.errmessageService.showError('');
    if (!this.webbridgeForm.valid) {
      this.errmessageService.showError('Please fill the form');
      return;
    }
    if (this.webbridgeForm.controls['input'].enabled) {
      selectedwebbridge = this.webbridgeForm.controls['input'].value
    }
    else {
      selectedwebbridge = this.webbridgeForm.controls['radio'].value
    }    
    this.router.navigate(['/login', {"webbridge":selectedwebbridge}]);
   
  }

}

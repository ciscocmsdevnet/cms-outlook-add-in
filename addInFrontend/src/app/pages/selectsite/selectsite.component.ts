import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-selectsite',
  templateUrl: './selectsite.component.html',
  styleUrls: ['./selectsite.component.css']
})
export class SelectsiteComponent implements OnInit {

  meetinglist$!: Observable<string[]>;
  webbridgeForm = this.fb.group({
    radio: ['', Validators.required],
    input: ['', Validators.required],
  });


  constructor(
    private router: Router,
    private cmsapiService: CmsapiService,
    private errmessageService: ErrmessagesService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.meetinglist$ = this.cmsapiService.getPredefinedSites()
    this.webbridgeForm.controls.input.disable()
  }


  changeSelection() {
    if (this.webbridgeForm.controls.radio.value == "Enter your own site") {
      this.webbridgeForm.controls.input.enable()
    } else {
      this.webbridgeForm.controls.input.disable()
    }
  }

  onNext(): void {
    var selectedwebbridge: string = '';
    this.errmessageService.showError('');
    if (!this.webbridgeForm.valid) {
      this.errmessageService.showError('Please fill the form');
      return;
    }
    if (this.webbridgeForm.controls.input.enabled) {
      selectedwebbridge = this.webbridgeForm.controls.input.value!
    }
    else {
      selectedwebbridge = this.webbridgeForm.controls.radio.value!
    }
    this.router.navigate(['/login', { "webbridge": selectedwebbridge }]);

  }

}

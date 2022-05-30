import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CmsapiService } from 'src/app/services/cmsapi.service';
import { NgForm } from '@angular/forms';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-selectsite',
  templateUrl: './selectsite.component.html',
  styleUrls: ['./selectsite.component.css']
})
export class SelectsiteComponent implements OnInit {

  meetinglist$!: Observable<string[]>;
  ownwebbridgeSelected = false;
  private selectedwebbridge = '';

  constructor(
    private router: Router, 
    private cmsapiService: CmsapiService,
    private errmessageService: ErrmessagesService
  ) { }

  ngOnInit(): void {
    this.meetinglist$ = this.cmsapiService.getPredefinedSites()
  }

  changeSelection(form: NgForm) {
    if (form.form.controls['sites'].value == "Enter your own site") {
      this.ownwebbridgeSelected = true
    } else {
      this.ownwebbridgeSelected = false
    }
  }

  onNext(form: NgForm): void {
    this.errmessageService.showError('');
    if (!form.valid) {
      this.errmessageService.showError('Please fill the form');
      return;
    }
    if (this.ownwebbridgeSelected) {
      this.selectedwebbridge = form.form.controls['webbridge'].value
    }
    else {
      this.selectedwebbridge = form.form.controls['sites'].value
    }    
    this.router.navigate(['/login', {"webbridge":this.selectedwebbridge}]);
   
  }

}

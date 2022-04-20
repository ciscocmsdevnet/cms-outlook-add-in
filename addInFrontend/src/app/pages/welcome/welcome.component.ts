import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CmsapiService } from 'src/app/services/cmsapi.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  private userSub!: Subscription;
  public welcomeMessage: String = "Welcome"
  public buttonIsenabled = false
  public showSpin = false

  constructor(
    private authService: AuthService,
    private cmsapiService: CmsapiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(
      user => {
      if (user.token) {
        this.showSpin = true
        this.cmsapiService.validate().subscribe(
          {
            
            error: ()=>{
              this.router.navigateByUrl("login")
              
            },
            complete: () => {
              this.router.navigateByUrl("preferences")
            }
          }
        )
      } else {
        this.buttonIsenabled = true
      }

    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

}

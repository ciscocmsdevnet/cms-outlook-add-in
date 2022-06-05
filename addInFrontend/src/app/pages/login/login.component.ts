import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { ErrmessagesService } from 'src/app/services/errmessages.service';
import { OutlookService } from 'src/app/services/outlook.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;
  username$!: Observable<string>;
  tokenisexpired$!: Observable<Boolean>;
  

  constructor(private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private errmessageService: ErrmessagesService,
    private outlookService: OutlookService) {
    }

  ngOnInit(): void {
    this.outlookService.get_outlook_username()  
    this.username$ = this.outlookService.loginusername$
    this.tokenisexpired$ = this.authService.tokenisexpired$
  }

  reset(){
    this.authService.logout()
  }
 
  onLogin(form: NgForm): void {
    this.isLoading = true;
    this.errmessageService.showError('');
    if (!form.valid) {
      this.errmessageService.showError('Form is not valid');
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    const webbridge = this.route.snapshot.paramMap.get('webbridge')!;
    form.controls['email'].disable();
    form.controls['password'].disable();

    this.authService.login(email, password, webbridge).subscribe(
      {
        next: () => {
          this.isLoading = false;
          form.controls['email'].enable();
          form.controls['password'].enable();
          this.router.navigate(['/preferences']);
        },
        error: () => {
          this.isLoading = false;
          form.controls['email'].enable();
          form.controls['password'].enable();
        }    
      }
    );

  }

}
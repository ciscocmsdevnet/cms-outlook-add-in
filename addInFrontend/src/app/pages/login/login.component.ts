import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
  tokenisexpired$!: Observable<Boolean>;
  loginForm!: FormGroup;
  error$!: Observable<string>;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private errmessageService: ErrmessagesService,
    private outlookService: OutlookService) {
  }

  ngOnInit(): void {
    this.initForm()
    this.error$ = this.errmessageService.error$
    this.outlookService.get_outlook_username()
    this.outlookService.loginusername$.subscribe(
      {
        next: (email) => {
          this.loginForm.controls['email'].setValue(email)
        }
      }
    )
    this.tokenisexpired$ = this.authService.tokenisexpired$
  }

  private initForm() {
    this.loginForm = new FormGroup({
      'email': new FormControl<string>('', [Validators.required, Validators.email]),
      'password': new FormControl<string>('', [Validators.required])
    });
  }

  reset() {
    this.authService.logout()
  }

  onLogin(): void {
    this.isLoading = true;
    this.errmessageService.showError('');
    if (!this.loginForm.valid) {
      this.errmessageService.showError('Form is not valid');
      return;
    }
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    const webbridge = this.route.snapshot.paramMap.get('webbridge')!;
    this.loginForm.controls['email'].disable();
    this.loginForm.controls['password'].disable();

    this.authService.login(email, password, webbridge).subscribe(
      {
        next: () => {
          this.isLoading = false;
          this.loginForm.controls['email'].enable();
          this.loginForm.controls['password'].enable();
          this.router.navigate(['/preferences']);
        },
        error: () => {
          this.isLoading = false;
          this.loginForm.controls['email'].enable();
          this.loginForm.controls['password'].enable();
        }
      }
    );

  }

}
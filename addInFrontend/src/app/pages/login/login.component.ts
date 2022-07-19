import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
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

  loginForm = this.fb.group({
    email: ['', Validators.email],
    password: ['', Validators.required]
  });

  error$!: Observable<string>;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private errmessageService: ErrmessagesService,
    private outlookService: OutlookService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.error$ = this.errmessageService.error$
    this.outlookService.get_outlook_username()
    this.outlookService.loginusername$.subscribe(
      {
        next: (email) => {
          this.loginForm.controls.email.setValue(email)
        }
      }
    )
    this.tokenisexpired$ = this.authService.tokenisexpired$
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
    const email = this.loginForm.controls.email.value!;
    const password = this.loginForm.controls.password.value!;
    const webbridge = this.route.snapshot.paramMap.get('webbridge')!;
    this.loginForm.controls.email.disable();
    this.loginForm.controls.password.disable();

    this.authService.login(email, password, webbridge).subscribe(
      {
        next: () => {
          this.isLoading = false;
          this.loginForm.controls.email.enable();
          this.loginForm.controls.password.enable();
          this.router.navigate(['/preferences']);
        },
        error: () => {
          this.isLoading = false;
          this.loginForm.controls.email.enable();
          this.loginForm.controls.password.enable();
        }
      }
    );

  }

}
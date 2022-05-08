import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthResponseData, AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { ErrmessagesService } from 'src/app/services/errmessages.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = false;

  constructor(private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private errmessageService: ErrmessagesService) {}
 
  onLogin(form: NgForm): void {
    this.errmessageService.showError('');
    if (!form.valid) {
      this.errmessageService.showError('Form is not valid');
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    const webbridge = this.route.snapshot.paramMap.get('webbridge')!;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;
    form.controls['email'].disable();
    form.controls['password'].disable();

    authObs = this.authService.login(email, password, webbridge);

    authObs.subscribe({
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
    });
  }

}
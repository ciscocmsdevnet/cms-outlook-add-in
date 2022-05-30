import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  public user$: Observable<User> | undefined ;

  constructor(
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.user$ = this.authService.user$
  }


}

import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent implements OnInit {

  currentUser$!: Observable<User>;
  
  constructor(
    private authService: AuthService
    ) { }

  ngOnInit(): void {
    this.currentUser$=this.authService.user$
  }

  logout() {
    this.authService.logout();
  }

}

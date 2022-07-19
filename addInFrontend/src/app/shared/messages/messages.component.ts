import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ErrmessagesService } from 'src/app/services/errmessages.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  showMessage: boolean = false;
  showError: boolean = false;

  error$!: Observable<string>;
  message$!: Observable<string>;

  constructor(public errmessagesService: ErrmessagesService) { }

  ngOnInit(): void {
    this.error$ = this.errmessagesService.error$.pipe(
      tap(() => {
        this.showError = true
      })
    )
    this.message$ = this.errmessagesService.message$.pipe(
      tap(() => { this.showMessage = true })
    )
  }

  onCloseError() {
    this.showError = false;
  }

  onCloseMessage() {
    this.showMessage = false;
  }

}

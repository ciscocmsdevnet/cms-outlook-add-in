import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';

@Injectable()
export class ErrmessagesService {
  
  private errorsubj = new BehaviorSubject<string>('');
  private messagesubj = new BehaviorSubject<string>('');
  error$: Observable<string> = this.errorsubj.asObservable();
  message$: Observable<string> = this.messagesubj.asObservable();

  constructor() { }

  showError(error: string) {
    this.errorsubj.next(error)
  }

  showMesssage(message: string) {
    this.messagesubj.next(message)
  }

}

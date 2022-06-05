import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class SelectedSpaceService {
  private selectedspaceid = new BehaviorSubject<string>('');
  selectedspaceid$: Observable<string> = this.selectedspaceid.asObservable();
  private selectedaccessid = new BehaviorSubject<string>('');
  selectedaccessid$: Observable<string> = this.selectedaccessid.asObservable();

  constructor() { }

  setSelectedSpaceid(id: string) {
    this.selectedspaceid.next(id)
  }

  setSelectedAccessid(id: string) {
    this.selectedaccessid.next(id)
  }


}

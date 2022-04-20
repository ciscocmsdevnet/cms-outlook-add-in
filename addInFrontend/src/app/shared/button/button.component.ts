import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Event } from '@angular/router';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {

  @Input() label: string = 'button';
  @Input() disabled: boolean = false;
  @Output() onClick = new EventEmitter<any>();

  onClickButton(event: any) {
      this.onClick.emit(event);
    }
    
}

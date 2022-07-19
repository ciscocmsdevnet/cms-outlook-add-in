import { Component, OnInit } from '@angular/core';
declare function action(event: any): any;
@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
})
export class CommandsComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit(): void {
    this.action()
  }

  action() {
    action(Office);
  }

}

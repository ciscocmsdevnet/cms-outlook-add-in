import { Component, OnInit } from '@angular/core';
import { OutlookService } from 'src/app/services/outlook.service';


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
})
export class CommandsComponent implements OnInit {

  constructor(private outlookService: OutlookService) { }

  ngOnInit(): void {
    this.outlookService.run_command();
  }

}

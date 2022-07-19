import { Component } from "@angular/core";
import { CmsapiService } from "src/app/services/cmsapi.service";
@Component({
  selector: "app-preferences",
  templateUrl: "./preferences.component.html",
  styleUrls: ["./preferences.component.css"],
})
export class PreferencesComponent {
  public tabIndex = 0;
  public isGetLinkButtonActive = false;
  public favoriteSeason = "";

  constructor(public cmsapiServce: CmsapiService) { }

  setTab(num: number) {
    this.tabIndex = num;
  }
}

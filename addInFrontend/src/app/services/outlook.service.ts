import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { CmsapiService } from "./cmsapi.service";
import { ErrmessagesService } from "./errmessages.service";

@Injectable()
export class OutlookService {

  private invitation: string = '';
  private loginusernamesub = new BehaviorSubject<string>('');
  loginusername$: Observable<string> = this.loginusernamesub.asObservable();

  constructor(
    private cmsapiService: CmsapiService, 
    private errmessageService: ErrmessagesService ) {

  }

  get_outlook_username() {
    Office.onReady(() => {
      if (Office.context.mailbox) {
        if (Office.context.mailbox.userProfile) {
          this.loginusernamesub.next(Office.context.mailbox.userProfile.emailAddress)
        }
      }
    });
  }

  run_command() {
    this.cmsapiService.invitation$.subscribe(
      {
        next: (inv) => {
          if (inv){
            this.invitation = inv.invitation;
          }
        }
      }
    )

    Office.onReady(() => {
      this.parselink();
      this.setLocation();
      this.errmessageService.showMesssage("Space created and Meeting Information added.");   
    });
    
  }



  parselink() {
   
    let meetingInvitation: string = '';
    if (this.invitation == '') {
      meetingInvitation = localStorage.getItem('invitation')!;
    } else {
      meetingInvitation = this.invitation;
    }

    console.log("INVITATION:", meetingInvitation)
   
    var removedSubject = meetingInvitation.replace(/Subject:/g, "");
    var meetingBody = removedSubject.replace(/"/g, "");
    // let meetingBody = removedQuotes.replace(/\\n/g, "<br></div>");
    Office.context.mailbox.item!.body.setSelectedDataAsync(
        meetingBody,
        {
          coercionType: 'text', // Write text as HTML
        },
  
        (asyncResult) => {
          if (asyncResult.status == Office.AsyncResultStatus.Failed) {
            const message = {
              type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
              message: "Failed.",
              icon: "Icon.80x80",
              persistent: true,
            };
            this.errmessageService.showError("Failed to add meeting information.");
            Office.context.mailbox.item!.notificationMessages.replaceAsync("action", message);
          } else {
            const message = {
              type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
              message: "Space created and Meeting Information added.",
              icon: "Icon.80x80",
              persistent: true,
            };
            Office.context.mailbox.item!.notificationMessages.replaceAsync("action", message);
          }
        }
      );

  }


  setLocation() {
    
    var str: string | null = ''
    const regex = /(https[a-zA-Z0-9:/\.\?=_-]+)/gm;
    if (this.invitation == '') {
      str = localStorage.getItem('invitation');
    } else {
      str = this.invitation;
    }
    let m;
    var meetingLink: string = '';

    while ((m = regex.exec(str!)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      meetingLink = m[0] //Pick the first match for link
    }

    Office.context.mailbox.item!.location.setAsync(
      meetingLink,
      (asyncResult) => {
        if (asyncResult.status == Office.AsyncResultStatus.Failed) {
          const message = {
            type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
            message: "Failed to get meeting location.",
            icon: "Icon.80x80",
            persistent: true,
          };
          this.errmessageService.showError('Failed to get meeting location.');
          Office.context.mailbox.item!.notificationMessages.replaceAsync("action", message);
        }
      }
    );
  }



}


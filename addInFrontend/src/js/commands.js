/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global global, Office, self, window */

Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

function parselink() {

  /*Meeting invite body
  Meeting ID: 649206560 

Join from a computer, mobile phone or tablet
Pre-Alpha: https://pajoin.cisco.com/meeting/649206560?secret=n354DMuPy4mzLNRwxQWo1Q

Join from a video conferencing system or application
Dial sip:rd@alphauk.cisco.com
*/

  // meetingBody = "Meeting ID: " + meetingID + "<br><br>Join from a computer, mobile phone or tablet<br>Pre-Alpha: " + meetingLink + "<br><br>Join from a video conferencing system or application<br>Dial " + meetingSIPURL
  
  meetingInvitation = JSON.parse(localStorage.getItem('invitation'))['invitation']
  removedSubject = meetingInvitation.replace(/Subject:/g, "");
  meetingBody = removedSubject.replace(/"/g, "");

  // var removedSubject = meetingInvitation.replace(/Subject:/g, "<br>");
  // let meetingBody = removedSubject.replace(/\\n/g, "<br>");

  Office.context.mailbox.item.body.setAsync(
    meetingBody,
    {
      coercionType: 'text', // Write text as HTML
    },

    // Callback method to check that setAsync succeeded
    function (asyncResult) {
      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
        write(asyncResult.error.message);
      }
    }
  );
}

// Get the subject of the item that the user is composing.
// function getSubject() {
//   Office.context.mailbox.item.subject.getAsync(
//     function (asyncResult) {
//       if (asyncResult.status == Office.AsyncResultStatus.Failed) {
//         write(asyncResult.error.message);
//       }
//       else {
//         // Successfully got the subject, display it.
//         return asyncResult.status
//       }
//     });
// }

// Set the location of the item that the user is composing.
function setLocation() {

  const regex = /(https[a-zA-Z0-9:/\.\?=]+)/gm;
  const str = JSON.parse(localStorage.getItem('invitation'))['invitation'];
  let m;
  var meetingLink;

  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    meetingLink = m[0] //Pick the first match for link
  }

  Office.context.mailbox.item.location.setAsync(
    meetingLink,
    function (asyncResult) {
      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
        write(asyncResult.error.message);
      }
    });
}

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
function action(event) {
  console.log("ACTION")
  const message = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Space created and Meeting Information added.",
    icon: "Icon.80x80",
    persistent: true,
  };

  // Show a notification message
  Office.context.mailbox.item.notificationMessages.replaceAsync("action", message);

  // CMS Space will be created once Subject is added to event

  //Query backend to get the meeting information
  parselink() // fill the message body
  setLocation() // fill the location URL

  // Be sure to indicate when the add-in command function is complete
  event.completed();
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
        ? global
        : undefined;
}

const g = getGlobal();
// The add-in command functions need to be available in global scope
g.action = action;

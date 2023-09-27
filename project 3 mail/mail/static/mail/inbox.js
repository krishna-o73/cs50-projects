document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  load_mailbox('inbox');
});

function compose_email() {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  

  document.querySelector('#compose-form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(() => {
        load_mailbox('sent');
    });
    return false;
  };
}

function load_mailbox(mailbox) {
  
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'none';

  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3><ul id="inbox-list"></ul>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      for (let email of emails) {
        if (email.archived && mailbox == 'inbox') {
        }
        else {
          const emailDiv = document.createElement('div');
          emailDiv.setAttribute("class", "border border-secondary mt-2");
          email.read ? emailDiv.style.backgroundColor = 'lightgrey' : emailDiv.style.backgroundColor = 'white';
          emailDiv.innerHTML += "From: " + email.sender + "<br />";
          emailDiv.innerHTML += "Subject: " + email.subject + "<br />";
          emailDiv.innerHTML += email.timestamp + "<br />";
          document.querySelector('#emails-view').appendChild(emailDiv);
          emailDiv.addEventListener('click', () => load_email(email));

          if (mailbox != 'sent') { 
            const archiveButton = document.createElement('button');
            archiveButton.setAttribute("class", "btn btn-danger");
            archiveButton.textContent = email.archived ? "Unarchive" : "Archive";
            document.querySelector('#emails-view').appendChild(archiveButton);
            archiveButton.addEventListener('click', () => {
              fetch('/emails/'+`${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: !(email.archived)
                })
              }).then(() => load_mailbox(mailbox));
            });
          }

        }

      }
    });

}

function load_email(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-email').style.display = 'block';

  fetch('/emails/'+`${email.id}`)
  .then(response => response.json())
  .then(email => {
      document.querySelector('#read-email').innerHTML = `<h3>${email.subject}</h3>`;
      
      const emailDiv = document.createElement('div');
      emailDiv.setAttribute("class", "border mt-2");
      emailDiv.innerHTML += "From: " + email.sender + "<br />";
      emailDiv.innerHTML += "Recipients: ";
      for (let recipient of email.recipients) {
        emailDiv.innerHTML += recipient;
      }
      emailDiv.innerHTML += "<br />";
      emailDiv.innerHTML += "Sent on " + email.timestamp + "<br />";

      const bodyDiv = document.createElement('div');
      bodyDiv.setAttribute("class", "border mt-2 mb-2");
      bodyDiv.innerHTML += email.body + "<br />";
      document.querySelector('#read-email').appendChild(emailDiv);
      document.querySelector('#read-email').appendChild(bodyDiv);

      const replyButton = document.createElement('button'); 
      replyButton.setAttribute("class", "btn btn-primary");
      replyButton.textContent = "Reply";
      document.querySelector('#read-email').appendChild(replyButton);

      replyButton.addEventListener('click', () => {
        compose_email(); 

        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = email.subject.slice(0,4) == 'Re: ' ? 'Re: ' + email.subject.slice(4,) : 'Re: ' + email.subject;
        document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote ' + email.body;
      }); 
  });

  fetch('/emails/'+`${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  
}
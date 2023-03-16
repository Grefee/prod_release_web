Website which is divided into two parts.
Admin page
  - where can admins set up production lines, productions stations and production operations. Set to each operation which type is it. Options were needed just as buttons which are Oks or Noks. Or Textareas for inputs of whole text.
  - see reports of saved data and click button to get exported excel file with data.
Base page
  - for wokers, which pick production line and pick for each production operation Ok or Noks and after setting all inputs will show a button for sending those data to api server to save those data to database.

Api server is node.js using express.js to set up urls and pg library to access postgresql database.

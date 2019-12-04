<h1> IBM Bluepages JS </h1>
<img alt="David" src="https://img.shields.io/david/aromerohcr/ibm-bluepages-js">
<img alt="GitHub code size in bytes" src="https://img.shields.io/github/languages/code-size/aromerohcr/ibm-bluepages-js">
<img alt="npm" src="https://img.shields.io/npm/dm/ibm-bluepages-js">
<img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/aromerohcr/ibm-bluepages-js">
<img alt="NPM" src="https://img.shields.io/npm/l/ibm-bluepages-js">
<img alt="GitHub contributors" src="https://img.shields.io/github/contributors/aromerohcr/ibm-bluepages-js?color=green">

<p> This module provides a set of tools to help <b>IBM</b> Developers working on internal projects to authenticate and access directory data available on <b>IBM Bluepages</b> using Javascript Async/Await functions (promises).</p>

<h3>Requirements (MacOS/Windows)</h3>

* Node 10.x / npm v6.x
* Python version 2.7

<b>Note:</b> Depending on your Windows setup <a href="https://www.npmjs.com/package/windows-build-tools">windows-build-tools</a> may need to be installed first. Also, for MacOS users, you should have xcode-select or entire Xcode App installed.

<h3> Install </h3>
You may install the package using npm install command:

```shell
$ npm install ibm-bluepages-js
```

<h3> Uninstall </h3>
To uninstall ibm-bluepages-js from your system, use the npm uninstall command:

```shell
$ npm uninstall ibm-bluepages-js
```

Or just delete the ibm-bluepages-js directory located in node_modules.

<h3> Change History </h3>

* `1.2.3`
  * `Extended getEmployeeLocationByW3ID() to include work location code.`
* `2.0.0`
  * `Local functions update, code refactoring and patching.`
  * `Replaced "user" by "employee" in code for better understanding of the functions.`
  * `Changed the profile photo endpoint for one that returns .JPG images with better quality.`
  * `Added new function employeeExists(W3ID) to validate if an employee is still part of IBM.`
  * `Added new function getManagerInCountryEmployees(W3ID) that allows to return the in country employees of a specific manager.`
* `2.0.3, 2.0.4 and 2.0.5`
  * `Documentation corrections.`
* `2.0.6 and 2.0.7`
  * `Fixed the problem caused by DTrace dependency of ldapjs on MacOS Catalina devices.`
  * `Added new function getEmployeeMobileByW3ID(W3ID).`
  * `Documentation and other minor fixes.`

<h3> Usage </h3>

<p> Perform an action based on location: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

async function doSomethingBasedOnLocation() {
  let location = await bluePages.getEmployeeLocationByW3ID('aromeroh@cr.ibm.com');

  if(location.countryAlphaCode === 'CR') {
    // if true code
  } else {
    // if else code
  }
}

```

<p> Define a function to return employee information: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

const userProfile = function(id) {
  return bluePages.getEmployeeInfoByW3ID(id).then(function(result){
    return result;
  }).catch(function(error){
    return error;
  });
};

```

<p> Authenticate an account: </p>

```javascript

const bluePages = require('ibm-bluepages-js');

async function doAccountAuthentication() {
  let success = await bluePages.authenticate('aromeroh@cr.ibm.com', '********');

  if(success) {
    // if true code
  } else {
    // if else code
  }
}

```

<p> Render an employee photo with <a href="https://www.npmjs.com/package/express" target="_blank">Express</a> & <a href="https://www.npmjs.com/package/ejs" target="_blank">EJS</a>: </p>

```javascript

app.get('/profile', async (req, res) => {
  let photo = await bluePages.getPhotoByW3ID('aromeroh@cr.ibm.com');

  res.render('profile.ejs', {
      photo: photo
  });
});

```
```html

<% if (photo) { %>
  <img src="<%= photo %>" alt="User Photo" height="240" width="320">
<% } %>

```

<h3> List of functions available </h3>

* `getNameByW3ID(W3ID)`
* `getUIDByW3ID(W3ID)`
* `getPrimaryUserIdByW3ID(W3ID)`
* `getManagerUIDByEmployeeW3ID(W3ID)`
* `getManagerInCountryEmployees(managerW3ID)`
* `getEmployeeLocationByW3ID(W3ID)`
* `getEmployeeMobileByW3ID(W3ID)`
* `getPhoneNumberByW3ID(W3ID)`
* `getJobFunctionByW3ID(W3ID)`
* `getPhotoByW3ID(W3ID)`
* `getEmployeeInfoByW3ID(W3ID)`
* `authenticate(W3ID, password)`
* `isManager(W3ID)`
* `employeeExists(W3ID)`

<h3> Features that make this module secure </h3>
<ul>
  <li>It's designed to only work within the IBM Blue Zone (Secure Network).</li>
  <li>It's designed to use LDAPS as the main authentication method which makes traffic confidential and secure by using Secure Sockets Layer (SSL).</li>
</ul>

<h3> Contributing </h3>
If you want to contribute to the module and make it better, your help is very welcome. You can do so submitting a <b>Pull Request</b>.

<h3> Contact Email / Slack </h3>
Please use this email for contact if you have questions: <b>aromeroh@cr.ibm.com</b>

<h3> License </h3>
This project is licensed under the IBM Public License.
Copyright (c) 2019 IBM

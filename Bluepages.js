/*
 * Copyright (C) 2019 International Business Machines Corporation and others. All Rights Reserved.
 * The accompanying program is provided under the terms of this IBM public license ("agreement").
 * Written by Andres Romero <aromeroh@cr.ibm.com>, August 2019.
 * Contributors: Rod Anami <rod.anami@br.ibm.com>
*/

const DOMParser = require('xmldom').DOMParser;
const fetch = require('node-fetch');
const LDAP = require('ldapjs');
const XMLParser = new DOMParser();
const xpath = require('xpath');

const urls = require('./URLs');
const NOT_AVAILABLE = 'N/A';

async function bluepagesGetEmployee(W3ID) {
	try {
		const res = await fetch(urls.api + `/mail=${W3ID}.list/byxml`).then(res => res.text());
		const employee = XMLParser.parseFromString(res);

		return employee; // API XML response

	} catch (error) {
		return error;
	}
}

async function bluepagesGetMgrInCountryEmployees(W3ID) {
	try {
		const dn = await getDnByW3ID(W3ID);
		const res = await fetch(urls.api + `/manager=${dn}.list/byjson?mail`).then(res => res.json());
		const { entry } = res.search;

		return entry.map(({attribute}) => attribute[0].value[0]); // employee email

	} catch (error) {
		return error;
	}
}

function getAttrValue(attrName, employee) {
	const attribute = xpath.select(`//attr[@name='${attrName}']/value`, employee);

	if (attribute.length > 0) {
		return attribute[0].firstChild.data;
	} else {
		return NOT_AVAILABLE;
	}
}

async function getDnByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const nodes = xpath.select('//directory-entries/entry', employee);

	if (nodes.length > 0) {
		return nodes[0].getAttribute('dn');
	} else {
		return null;
	}
}

async function bluePagesReportsQueryByDn(dn) {
  return fetch(urls.api + `/manager=${dn}.list/byjson`)
    .then(res => res.text())
    .then(str => JSON.parse(str))
    .catch(error => console.error(`Error: ${error}`));
}

/* Converts from the LDAP search json form to more idiomatic objects */
function objectise(json) {
  const arrayOfAttributes = json.search.entry.map(entry => entry.attribute);

  // A bit of magic which reduces type safety (we don't know if values will be arrays or not) but increases convenience (since almost all values are *not* arrays)
  const stripArrays = value => (value.length === 1 ? value[0] : value);
  const reducer = (acc, val) => {
    acc[val.name] = stripArrays(val.value);
    return acc;
  };
  const objects = arrayOfAttributes.map(array => array.reduce(reducer, {}));

  return objects;
}

/**
* @param {String} W3ID
* @param {String} password
* @returns {Promise<boolean>}
*/
async function authenticate(W3ID, password) {
	const dn = await getDnByW3ID(W3ID);

	return new Promise((resolve, reject) => {

		if (dn === null) {
			resolve(false);
		}

		const uid = dn.split(/,/)[0].split(/=/)[1];

		const opts = {
			filter: '(uid='+ uid +')',
			timeLimit: 500,
			scope: 'sub'
		};

		// * Client for connecting to Bluepages LDAPS interface
		const CLIENT = LDAP.createClient({ url: urls.ldaps });

		CLIENT.bind(dn, password, function (error) {
			if (error) {
				CLIENT.unbind();
				resolve(false);
			} else {
				CLIENT.search('ou=bluepages,o=ibm.com', opts, function(error, res) {
					res.on('searchEntry', function(entry) {
						if(entry.object){
							CLIENT.unbind();
							resolve(true);
						} else {
							CLIENT.unbind();
							resolve(false);
						}
					});

					res.on('error', function(error) {
						CLIENT.unbind();
						resolve(false);
					});
				});
			}
		});
	});
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getNameByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const name = getAttrValue('givenname', employee) + ' ' + getAttrValue('sn', employee);

	return name;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getPrimaryUserIdByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const userId = getAttrValue('primaryuserid', employee);

	return userId.toLowerCase(); // e.g: aromeroh, joe.doe, etc ...
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getUIDByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const uid = getAttrValue('uid', employee);

	return uid;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getManagerUIDByEmployeeW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const serialNumber = getAttrValue('managerserialnumber', employee);
	const countryCode = getAttrValue('managercountrycode', employee);

	const managerUid = serialNumber + countryCode;

	return managerUid;
}

/**
* @param {String} W3ID
* @returns {Array<Object>}
*/
async function getManagerInCountryEmployees(managerW3ID) {
	const employees = await bluepagesGetMgrInCountryEmployees(managerW3ID);
	const managerEmployees = Promise.all(employees.map(async (e) => await getEmployeeInfoByW3ID(e)));

	return managerEmployees;
}

/**
* @param {String} W3ID
* @returns {Promise<Object>}
*/
async function getEmployeeLocationByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);

	return {
		buildingName: getAttrValue('buildingname', employee),
		country: getAttrValue('co', employee),
		countryAlphaCode: getAttrValue('c', employee),
		workLocation: getAttrValue('workloc', employee),
		employeeCountryCode: getAttrValue('employeecountrycode', employee)
	};
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getPhoneNumberByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const phoneNumber = getAttrValue('telephonenumber', employee);

	return phoneNumber;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getJobFunctionByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const jobFunction = getAttrValue('jobresponsibilities', employee);

	return jobFunction;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getEmployeeMobileByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const mobile = getAttrValue('mobile', employee);

	return mobile;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getPhotoByW3ID(W3ID) {
	return urls.photo + `/${W3ID}?def=avatar`;
}

/**
* @param {String} W3ID
* @returns {Promise<Object>}
*/
async function getEmployeeInfoByW3ID(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);

	return {
		name: `${getAttrValue('givenname', employee)} ${getAttrValue('sn', employee)}`,
		email : getAttrValue('mail', employee),
		photo: urls.photo + `/${W3ID}?def=avatar`,
		jobFunction: getAttrValue('jobresponsibilities', employee),
		telephoneNumber: getAttrValue('telephonenumber', employee),
		buildingName: getAttrValue('buildingname', employee)
	};
}

function flatten(items) {
  const flat = [];

  items.forEach(item => {
    if (Array.isArray(item)) {
      flat.push(...flatten(item));
    } else {
      flat.push(item);
    }
  });

  return flat;
}

/**
* @param {String} W3ID
* @returns {Promise<string>}
*/
async function getDirectReportsByW3ID(W3ID) {
	const dn = await getDnByW3ID(W3ID);
	return await getDirectReportsByDn(dn);
}

async function getDirectReportsByDn(dn) {
  const allReports = await bluePagesReportsQueryByDn(dn);
  const json = objectise(allReports);

  // Extract just a few fields of interest
  return json.map(person => {
    return {
      name: person.cn,
      dn: `uid=${person.uid},c=${person.c},ou=${person.ou},o=${person.o}`,
      uid: person.uid,
      mail: person.mail,
      workLocation: person.workloc
    };
  });
}
async function getDirectAndIndirectReportsByW3ID(W3ID) {
  const dn = await getDnByW3ID(W3ID);
  return await getDirectAndIndirectReportsByDn(dn);
}

async function getDirectAndIndirectReportsByDn(dn) {
  // This is only doing the in-country hierarchy; global seems to be much harder
  // It would be nice to have an option to filter out functional and task IDs
  const directReports = await getDirectReportsByDn(dn);
  const recurser = async person =>
    [person].concat(await getDirectAndIndirectReportsByDn(person.dn));
  const recursed = await Promise.all(directReports.map(recurser));
  const flattened = flatten(recursed);
  return flattened;
}

/**
* @param {String} W3ID
* @returns {Promise<boolean>}
*/
async function isManager(W3ID) {
	const employee = await bluepagesGetEmployee(W3ID);
	const flag = getAttrValue('ismanager', employee);

	return (flag === 'Y'); // Y: True, N: False ...
}

/**
* @param {String} W3ID
* @returns {Promise<boolean>}
*/
async function employeeExists(W3ID) {
	return (await getDnByW3ID(W3ID) !== null);
}

module.exports = {
	authenticate,
	getNameByW3ID,
	getPrimaryUserIdByW3ID,
	getUIDByW3ID,
	getManagerUIDByEmployeeW3ID,
	getManagerInCountryEmployees,
	getEmployeeLocationByW3ID,
	getEmployeeMobileByW3ID,
	getPhoneNumberByW3ID,
	getJobFunctionByW3ID,
	getPhotoByW3ID,
	getEmployeeInfoByW3ID,
	getDirectAndIndirectReportsByW3ID,
	getDirectReportsByW3ID,
	isManager,
	employeeExists
};

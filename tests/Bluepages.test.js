const bluePages = require('../Bluepages');

test('the result is the full name of the employee', async () => {
	const data = await bluePages.getNameByW3ID('aromeroh@cr.ibm.com');
	return expect(data).toBe('Andres Alexander Romero Hernandez');
});

test('the result is an object containing employee information', async () => {
	const data = await bluePages.getEmployeeInfoByW3ID('aromeroh@cr.ibm.com');
	return expect(data).toBeDefined();
});

test('the result is an object containing employee location', async () => {
  const data = await bluePages.getEmployeeLocationByW3ID('aromeroh@cr.ibm.com');
  return expect(data).toBeDefined();
});

test('the result is an object containing employee mobile', async () => {
  const data = await bluePages.getEmployeeMobileByW3ID('rod.anami@br.ibm.com');
  return expect(data).toBeDefined();
});

test('the result is an object containing employee location including the office', async () => {
  const data = await bluePages.getEmployeeLocationByW3ID('aromeroh@cr.ibm.com');
  return expect(data).toHaveProperty('workLocation');
});

test('the result is the primary user ID of the employee', async () => {
	const data = await bluePages.getPrimaryUserIdByW3ID('aromeroh@cr.ibm.com');
	return expect(data).toBe('aromeroh');
});

test('the employee exists', async () => {
	const success = await bluePages.employeeExists('aromeroh@cr.ibm.com');
	return expect(success).toBe(true);
});

test('the employee does not exists', async () => {
	const success = await bluePages.employeeExists('joe.doe@us.ibm.com');
	return expect(success).toBe(false);
});

test('the result is a URL with a employee\'s JPG profile picture', async () => {
	const data = await bluePages.getPhotoByW3ID('aromeroh@cr.ibm.com');
	return expect(data).toBe('https://w3-services1.w3-969.ibm.com/myw3/unified-profile-photo/v1/image/aromeroh@cr.ibm.com?def=avatar');
});

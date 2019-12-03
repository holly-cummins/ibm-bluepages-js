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

test("the direct reports are populated", async () => {
  const data = await bluePages.getDirectReportsByW3ID("rwilliams@uk.ibm.com");
  // This data will likely change in the live system, so until we use mocking, we can be general
  // We expect this manager to have more than 2 reports, and less than 50
  expect(data).toBeInstanceOf(Array);
  expect(data.length).toBeGreaterThan(2);
  expect(data.length).toBeLessThan(40);

  // We can make some sensible assertions about what fields are populated, too
  const report = data[2];
  expect(report).toHaveProperty("uid");
  expect(report).toHaveProperty("name");
  expect(report).toHaveProperty("mail");
});

test(
  "the direct and indirect reports are populated",
  async () => {
    const manager = "rasayles@us.ibm.com";
    const data = await bluePages.getDirectAndIndirectReportsByW3ID(manager);

    // This data will likely change in the live system, so until we use mocking, we can be general
    // We expect this higher-level manager to have more than 20 reports, and less than 500
    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(20);
    expect(data.length).toBeLessThan(500);

    // This should include all the direct reports too ... sadly, this makes a slow test even slower
    const directReports = await bluePages.getDirectAndIndirectReportsByW3ID(
      manager
    );
    expect(data).toEqual(expect.arrayContaining(directReports));
  },
  30 * 1000
);

test('the login is successful', async () => {
	// This is a weak test, since we can't use a correct password (unless we mock), but at least it catches compilation errors
	const success = await bluePages.authenticate(
		"aromeroh@cr.ibm.com",
		"nottherightpassword");
	return expect(success).toBe(false);
});
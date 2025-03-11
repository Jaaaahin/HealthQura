import { Builder, By, Browser, until } from 'selenium-webdriver';

// Configuration object to define test pages and scenarios
const config = {
  baseUrl: 'https://katalon-demo-cura.herokuapp.com/',
  credentials: {
    username: 'John Doe',
    password: 'ThisIsNotAPassword'
  },
  pages: [
    {
      name: 'Appointment Booking',
      tests: [
        {
          description: 'Book appointment at Tokyo CURA Healthcare Center',
          facilityIndex: 0,
          date: '15',
          readmission: true,
          comment: 'Appointment at Tokyo center'
        },
        {
          description: 'Book appointment at Hongkong CURA Healthcare Center',
          facilityIndex: 1,
          date: '20',
          readmission: true,
          comment: 'Appointment at Hongkong center'
        },
        {
          description: 'Book appointment at Seoul CURA Healthcare Center',
          facilityIndex: 2,
          date: '25',
          readmission: false,
          comment: 'Appointment at Seoul center'
        }
      ]
    },
    {
      name: 'History Page',
      tests: [
        {
          description: 'Check appointment history',
          action: 'viewHistory',
          expectedResults: ['Tokyo CURA Healthcare Center', 'Hongkong CURA Healthcare Center', 'Seoul CURA Healthcare Center']
        }
      ]
    }
  ]
};

// Generic utility functions
class WebDriver {
  constructor(driver) {
    this.driver = driver;
  }

  async findElement(locator, timeout = 5000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async click(locator, timeout = 5000) {
    const element = await this.findElement(locator, timeout);
    await element.click();
    return element;
  }

  async sendKeys(locator, text, timeout = 5000) {
    const element = await this.findElement(locator, timeout);
    await element.clear();
    await element.sendKeys(text);
    return element;
  }

  async getText(locator, timeout = 5000) {
    const element = await this.findElement(locator, timeout);
    return await element.getText();
  }

  async isSelected(locator, timeout = 5000) {
    const element = await this.findElement(locator, timeout);
    return await element.isSelected();
  }

  async waitForElement(locator, timeout = 5000) {
    return await this.findElement(locator, timeout);
  }

  async findElements(locator, timeout = 5000) {
    await this.driver.wait(until.elementLocated(locator), timeout);
    return await this.driver.findElements(locator);
  }
}

// Page objects
class LoginPage {
  constructor(driver) {
    this.webDriver = new WebDriver(driver);
  }

  async navigateToLogin() {
    await this.webDriver.click(By.id('btn-make-appointment'));
    console.log("Navigated to login page.");
  }

  async login(username, password) {
    await this.webDriver.sendKeys(By.id('txt-username'), username);
    await this.webDriver.sendKeys(By.id('txt-password'), password);
    await this.webDriver.click(By.id('btn-login'));
    console.log(`Login submitted for user: ${username}`);
    
    try {
      await this.webDriver.waitForElement(By.id('combo_facility'));
      console.log("Login successful. Navigated to appointment page.");
      return true;
    } catch (error) {
      console.error("Login failed or page did not load properly.");
      return false;
    }
  }
}

class AppointmentPage {
  constructor(driver) {
    this.webDriver = new WebDriver(driver);
  }

  async selectFacility(facilityIndex) {
    try {
      await this.webDriver.waitForElement(By.id('combo_facility'));
      const facility = await this.webDriver.driver.findElement(By.id('combo_facility'));
      const options = await facility.findElements(By.tagName('option'));

      if (facilityIndex < options.length) {
        await options[facilityIndex].click();
        console.log(`Facility ${facilityIndex + 1} selected successfully.`);
        return true;
      } else {
        console.log(`Facility index ${facilityIndex} is out of range.`);
        return false;
      }
    } catch (error) {
      console.error("Error selecting facility:", error);
      return false;
    }
  }

  async toggleReadmission(shouldCheck) {
    try {
      const readmissionCheckbox = await this.webDriver.driver.findElement(By.id('chk_hospotal_readmission'));
      const isSelected = await readmissionCheckbox.isSelected();
      
      if ((shouldCheck && !isSelected) || (!shouldCheck && isSelected)) {
        await readmissionCheckbox.click();
        console.log(`${shouldCheck ? 'Checked' : 'Unchecked'} the 'Apply for hospital readmission' checkbox.`);
      } else {
        console.log(`'Apply for hospital readmission' checkbox is already ${shouldCheck ? 'checked' : 'unchecked'}.`);
      }
      return true;
    } catch (error) {
      console.error("Error toggling readmission checkbox:", error);
      return false;
    }
  }

  async selectDate(date) {
    try {
      // Click to open the date picker
      await this.webDriver.click(By.id('txt_visit_date'));
      
      // Wait for the date picker to be visible
      await this.webDriver.waitForElement(By.className('datepicker'));
      
      // Find and click the desired date
      const dates = await this.webDriver.driver.findElements(By.css('.day'));
      let dateFound = false;
      
      for (let day of dates) {
        const dayText = await day.getText();
        if (dayText === date) {
          await day.click();
          dateFound = true;
          console.log(`Date ${date} selected successfully.`);
          break;
        }
      }
      
      if (!dateFound) {
        console.log(`Date ${date} not found in the current month view.`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error selecting date:", error);
      return false;
    }
  }

  async addComment(comment) {
    try {
      await this.webDriver.sendKeys(By.id('txt_comment'), comment);
      console.log("Comment added successfully.");
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  }

  async bookAppointment() {
    try {
      await this.webDriver.click(By.id('btn-book-appointment'));
      console.log("Clicked the 'Book Appointment' button.");
      
      // Wait for the confirmation page
      await this.webDriver.waitForElement(By.id('summary'));
      console.log("Appointment booked successfully.");
      return true;
    } catch (error) {
      console.error("Error booking appointment:", error);
      return false;
    }
  }

  async navigateToHistory() {
    try {
      // Go to homepage first
      await this.webDriver.click(By.linkText('Go to Homepage'));
      console.log("Navigated to homepage.");
      
      // Add a small delay before clicking the menu toggle
      await this.webDriver.driver.sleep(1000);
      
      // Click on the menu toggle to open the sidebar
      await this.webDriver.click(By.id('menu-toggle'));
      console.log("Opened sidebar menu.");
      
      // Add a delay after opening the menu
      await this.webDriver.driver.sleep(1000);
      
      // Click on the History link
      await this.webDriver.click(By.xpath("//a[contains(@href, 'history.php')]"));
      console.log("Clicked on History link.");
      
      // Increase wait time for history page to load (10 seconds)
      await this.webDriver.waitForElement(By.id('history'), 10000);
      
      // Add an additional delay to ensure everything is loaded
      await this.webDriver.driver.sleep(2000);
      
      console.log("Navigated to History page successfully.");
      
      return true;
    } catch (error) {
      console.error("Error navigating to History page:", error);
      return false;
    }
  }

  async makeAppointment(testConfig) {
    try {
      console.log(`Running test: ${testConfig.description}`);
      
      const facilitySuccess = await this.selectFacility(testConfig.facilityIndex);
      if (!facilitySuccess) return false;
      
      const readmissionSuccess = await this.toggleReadmission(testConfig.readmission);
      if (!readmissionSuccess) return false;
      
      const dateSuccess = await this.selectDate(testConfig.date);
      if (!dateSuccess) return false;
      
      const commentSuccess = await this.addComment(testConfig.comment);
      if (!commentSuccess) return false;
      
      const bookingSuccess = await this.bookAppointment();
      if (!bookingSuccess) return false;
      
      // Navigate to history page after booking
      await this.navigateToHistory();
      
      return true;
    } catch (error) {
      console.error(`Test failed: ${testConfig.description}`, error);
      return false;
    }
  }

  async navigateBackToAppointment() {
    try {
      // Go to homepage first
      await this.webDriver.click(By.linkText('Go to Homepage'));
      
      // Add a small delay before clicking the appointment button
      await this.webDriver.driver.sleep(1000);
      
      // Navigate to the appointment page
      await this.webDriver.click(By.id('btn-make-appointment'));
      
      // Wait for the appointment page to load
      await this.webDriver.waitForElement(By.id('combo_facility'));
      console.log("Navigated back to Appointment page successfully.");
      
      return true;
    } catch (error) {
      console.error("Error navigating back to Appointment page:", error);
      return false;
    }
  }
}

class HistoryPage {
  constructor(driver) {
    this.webDriver = new WebDriver(driver);
  }

  async toggleAppointmentDetails(index) {
    try {
      // Wait for the history page to load
      await this.webDriver.waitForElement(By.id('history'), 10000);

      // Get all appointment cards
      const appointmentCards = await this.webDriver.findElements(By.className('panel-info'));

      // Check if the index is valid
      if (index < 0 || index >= appointmentCards.length) {
        console.error(`Invalid index: ${index}. There are only ${appointmentCards.length} appointments.`);
        return false;
      }

      // Find the toggle button for the specified appointment card
      const toggleButton = await appointmentCards[index].findElement(By.css('.panel-heading .btn'));

      // Click the toggle button to expand/collapse details
      await toggleButton.click();
      console.log(`Toggled details for appointment at index ${index}.`);

      return true;
    } catch (error) {
      console.error("Error toggling appointment details:", error);
      return false;
    }
  }

  async checkHistory(expectedFacilities) {
    try {
      console.log("Checking appointment history...");

      // Wait for the history page to load with increased timeout (10 seconds)
      await this.webDriver.waitForElement(By.id('history'), 10000);

      // Add an additional delay to ensure all history items are loaded
      await this.webDriver.driver.sleep(3000);

      // Get all appointment cards
      const appointmentCards = await this.webDriver.findElements(By.className('panel-info'));
      console.log(`Found ${appointmentCards.length} appointments in history.`);

      // Check if the number of appointments matches expected
      if (appointmentCards.length < expectedFacilities.length) {
        console.error(`Expected at least ${expectedFacilities.length} appointments, but found ${appointmentCards.length}.`);
        return false;
      }

      // Check facility names in the history
      let foundFacilities = 0;
      for (const facilityName of expectedFacilities) {
        let facilityFound = false;

        for (const card of appointmentCards) {
          const cardText = await card.getText();
          if (cardText.includes(facilityName)) {
            facilityFound = true;
            foundFacilities++;
            console.log(`Found appointment for ${facilityName} in history.`);
            break;
          }
        }

        if (!facilityFound) {
          console.error(`Appointment for ${facilityName} not found in history.`);
        }
      }

      console.log(`Found ${foundFacilities}/${expectedFacilities.length} expected facilities in history.`);
      return foundFacilities === expectedFacilities.length;
    } catch (error) {
      console.error("Error checking appointment history:", error);
      return false;
    }
  }

  async viewHistory(testConfig) {
    try {
      console.log(`Running test: ${testConfig.description}`);

      // Add a delay before checking history to ensure all items are loaded
      await this.webDriver.driver.sleep(2000);

      // Toggle details for each appointment (if needed)
      if (testConfig.toggleDetails) {
        const appointmentCards = await this.webDriver.findElements(By.className('panel-info'));
        for (let i = 0; i < appointmentCards.length; i++) {
          await this.toggleAppointmentDetails(i);
          await this.webDriver.driver.sleep(500); // Add a small delay between toggles
        }
      }

      const historyCheckSuccess = await this.checkHistory(testConfig.expectedResults);

      return historyCheckSuccess;
    } catch (error) {
      console.error(`Test failed: ${testConfig.description}`, error);
      return false;
    }
  }

  async navigateBackToAppointment() {
    try {
      // Go to homepage first
      await this.webDriver.click(By.linkText('Go to Homepage'));

      // Add a small delay before clicking the appointment button
      await this.webDriver.driver.sleep(1000);

      // Navigate to the appointment page
      await this.webDriver.click(By.id('btn-make-appointment'));

      // Wait for the appointment page to load
      await this.webDriver.waitForElement(By.id('combo_facility'));
      console.log("Navigated back to Appointment page successfully.");

      return true;
    } catch (error) {
      console.error("Error navigating back to Appointment page:", error);
      return false;
    }
  }
}

// Test runner
class TestRunner {
  constructor(config) {
    this.config = config;
    this.driver = null;
  }

  async initialize() {
    this.driver = await new Builder().forBrowser(Browser.CHROME).build();
    await this.driver.get(this.config.baseUrl);
    await this.driver.manage().window().maximize();
    console.log(`Initialized browser and navigated to ${this.config.baseUrl}`);
  }

  async runTests() {
    try {
      await this.initialize();
      
      // Login first (assuming login is required for all pages)
      const loginPage = new LoginPage(this.driver);
      await loginPage.navigateToLogin();
      const loginSuccess = await loginPage.login(
        this.config.credentials.username,
        this.config.credentials.password
      );
      
      if (!loginSuccess) {
        console.error("Failed to login. Aborting tests.");
        return;
      }
      
      // Process each page in the config
      for (const page of this.config.pages) {
        console.log(`\n=== Testing page: ${page.name} ===`);
        
        // Run tests specific to this page
        if (page.name === 'Appointment Booking') {
          const appointmentPage = new AppointmentPage(this.driver);
          
          for (const test of page.tests) {
            const testResult = await appointmentPage.makeAppointment(test);
            console.log(`Test "${test.description}": ${testResult ? 'PASSED' : 'FAILED'}`);
            
            // Navigate back to appointment page for the next test if there are more tests
            if (page.tests.indexOf(test) < page.tests.length - 1) {
              await appointmentPage.navigateBackToAppointment();
            }
          }
        } else if (page.name === 'History Page') {
          const historyPage = new HistoryPage(this.driver);
          
          for (const test of page.tests) {
            const testResult = await historyPage.viewHistory(test);
            console.log(`Test "${test.description}": ${testResult ? 'PASSED' : 'FAILED'}`);
          }
        }
        // Add other page types here as needed
      }
    } catch (error) {
      console.error("An error occurred during test execution:", error);
    } finally {
      // Uncomment to close the browser when done
      await this.driver.quit();
      console.log("\nTest execution completed.");
    }
  }
}

// Add a function to add new pages/tests to the config
function addTestPage(pageConfig) {
  config.pages.push(pageConfig);
  console.log(`Added new test page: ${pageConfig.name} with ${pageConfig.tests.length} tests`);
}

// Example of adding a new page
function addExampleProfilePage() {
  addTestPage({
    name: 'Profile Page',
    tests: [
      {
        description: 'Check user profile information',
        action: 'viewProfile',
        expectedResults: ['John Doe']
      }
    ]
  });
}

// Run the tests
async function main() {
  // Uncomment to add a new page example
  // addExampleProfilePage();
  
  const testRunner = new TestRunner(config);
  await testRunner.runTests();
}

main();
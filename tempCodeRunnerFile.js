import { Builder, By, Browser, until } from 'selenium-webdriver';

async function selectDate(driver, date) {
    try {
        // Wait for the date input field and click to open the date picker
        let dateInput = await driver.wait(until.elementLocated(By.id('txt_visit_date')), 5000);
        await dateInput.click();

        // Wait for the date picker to be visible
        await driver.wait(until.elementLocated(By.className('datepicker')), 5000);

        // Navigate through the date picker to select the desired date
        let dates = await driver.findElements(By.css('.day'));
        for (let day of dates) {
            let dayText = await day.getText();
            if (dayText === date) {
                await day.click();
                break;
            }
        }
        console.log(`Date ${date} selected successfully.`);
    } catch (error) {
        console.error("Error while selecting date:", error);
    }
}

async function addComment(driver, commentText) {
    try {
        // Wait for the comment text area to be present
        let commentTextArea = await driver.wait(until.elementLocated(By.id('txt_comment')), 5000);

        // Clear any existing text (optional, based on application behavior)
        await commentTextArea.clear();

        // Enter the comment text
        await commentTextArea.sendKeys(commentText);
        console.log("Comment added successfully.");
    } catch (error) {
        console.error("Error while adding comment:", error);
    }
}

async function makeAppointment(driver, facilityIndex, date, comment) {
    try {
        // Wait for the facility dropdown
        await driver.wait(until.elementLocated(By.id('combo_facility')), 5000);
        let facility = await driver.findElement(By.id('combo_facility'));
        let options = await facility.findElements(By.tagName('option'));

        if (facilityIndex < options.length) {
            await options[facilityIndex].click();
            console.log(`Facility ${facilityIndex + 1} selected successfully.`);
        } else {
            console.log(`Facility index ${facilityIndex} is out of range.`);
            return;
        }

        // Select the "Apply for hospital readmission" checkbox
        let readmissionCheckbox = await driver.findElement(By.id('chk_hospotal_readmission'));
        if (!(await readmissionCheckbox.isSelected())) {
            await readmissionCheckbox.click();
            console.log("Checked the 'Apply for hospital readmission' checkbox.");
        } else {
            console.log("'Apply for hospital readmission' checkbox is already checked.");
        }

        // Select the visit date
        await selectDate(driver, date);

        // Add a comment
        await addComment(driver, comment);

        // Click the "Book Appointment" button
        let bookAppointmentButton = await driver.findElement(By.id('btn-book-appointment'));
        await bookAppointmentButton.click();
        console.log("Clicked the 'Book Appointment' button.");

        // Wait for the confirmation page to load
        await driver.wait(until.elementLocated(By.id('summary')), 5000);
        console.log("Appointment booked successfully.");

    } catch (error) {
        console.error("Error in makeAppointment:", error);
    }
}

async function main() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://katalon-demo-cura.herokuapp.com/');
        await driver.manage().window().maximize();
        // Navigate to login page
        let makeAppointmentBtn = await driver.wait(until.elementLocated(By.id('btn-make-appointment')), 5000);
        await makeAppointmentBtn.click();
        console.log("Navigated to login page.");

        // Enter login details
        let usernameField = await driver.wait(until.elementLocated(By.id('txt-username')), 5000);
        let passwordField = await driver.findElement(By.id('txt-password'));
        let loginButton = await driver.findElement(By.id('btn-login'));

        await usernameField.sendKeys('John Doe');
        await passwordField.sendKeys('ThisIsNotAPassword');
        await loginButton.click();
        console.log("Login submitted.");

        // Wait for login success
        try {
            await driver.wait(until.elementLocated(By.id('combo_facility')), 5000);
            console.log("Login successful. Navigated to appointment page.");
        } catch (error) {
            console.error("Login failed or page did not load properly.");
            return;
        }

        // Iterate through each facility option and select a date
        let appointmentDate = '15'; // Example: Selecting the 15th day of the month
        let comment = 'This is a test comment for the appointment.';
        for (let i = 0; i < 3; i++) {
            console.log(`Processing appointment for facility ${i + 1}`);
            await makeAppointment(driver, i, appointmentDate, comment);
            // Add any necessary steps to reset the state before the next iteration
        }

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        // await driver.quit();
        console.log("Browser closed.");
    }
}

main();
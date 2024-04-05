window.onload = () => {
  let url = window.location.href;

  if (url.includes("TimeInOut")) {
    addAutofillButton();
  } else if (url.includes("termSelection?mode=registration")) {
    addTimeSelector();
    addAutoClickButton();
    addCancelButton();
  } else if (
    url.includes(
      "classRegistration"
    )
  ) {
    addRegisterThirdPlanButton();
    addRegisterSecondPlanButton();
    addRegisterFirstPlanButton();
  }
};

function addTimeSelector() {
  const div = document.createElement("div");
  div.style = "margin-top: 15px";
  
  const label = createLabel();
  const input = createInput();
  const errorMsg = createErrorMsg();
  let br1 = document.createElement("br");
  let br2 = document.createElement("br");
  let br3 = document.createElement("br");

  div.appendChild(label);
  div.appendChild(br1);
  div.appendChild(input);
  div.appendChild(br2);
  div.appendChild(errorMsg);
  div.appendChild(br3);

  const container = document.getElementById("term-buttons");

  container.appendChild(div);

  document.getElementById("time").addEventListener("blur", function (e) {
    let time = e.target.value;
    let regEx = /^(0?\d|1\d|2[0-3]):([0-5]\d)$/;

    if (!regEx.test(time)) {
      document.getElementById("errorMsg").innerHTML =
        "Invalid time format. Please enter in HH:MM (24h format)";
    } else {
      document.getElementById("errorMsg").innerHTML = "";
    }
  });
}

function createErrorMsg() {
  let errorMsg = document.createElement("span");
  errorMsg.setAttribute("id", "errorMsg");
  errorMsg.classList.add("error-message");
  errorMsg.style = "font-size: 12px; margin: 10px; display: inline-block;";
  return errorMsg;
}

function createInput() {
  let input = document.createElement("input");
  input.setAttribute("type", "time");
  input.setAttribute("id", "time");
  input.setAttribute("name", "time");
  input.setAttribute("placeholder", "HH:MM");
  input.setAttribute("pattern", "^([01]\\d|2[0-3]):([0-5]\\d)$");
  input.required = true;
  return input;
}

function createLabel() {
  let label = document.createElement("label");
  label.setAttribute("for", "time");
  label.style = "display: inline-block; margin-bottom: 5px";
  label.textContent = "Select auto click time (HH:MM 24h format):";
  return label;
}

// Function to check if the element exists
function elementExists(selector) {
  return document.querySelector(selector) !== null;
}

// Function to execute when the element exists
function onElementExists(selector, callback) {
  const observer = new MutationObserver((mutationsList, observer) => {
    if (elementExists(selector)) {
      observer.disconnect(); // Stop observing
      callback(); // Execute the callback function
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Function to check if the element doesn't have a particular class
function elementDoesNotHaveClass(element, className) {
  return !element.classList.contains(className);
}

// Function to wait until an element doesn't have a particular class
function waitForElementClass(element, className, callback) {
  const observer = new MutationObserver(() => {
    if (elementDoesNotHaveClass(element, className)) {
      observer.disconnect(); // Stop observing mutations
      callback(); // Call the callback function
    }
  });

  // Start observing mutations on the target element and its descendants
  observer.observe(element, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

function addRegisterNthPlanButton(n) {
  const button = document.createElement("button");
  button.innerText = `Register Plan ${n}`;
  button.style =
    "float: right; display: inline-block; margin: 10px; margin-right: 40px; font-size: 16px;";
  button.className = "form-button";

  const titleDiv = document.getElementById("title-panel");
  titleDiv.append(button);

  button.addEventListener("click", async (e) => {
    e.preventDefault();

    clickPlansButton();
    clickAddAllButton(n - 1);
    await sleep(500); // to give time to add the courses as pending
    clickSubmitButton();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addRegisterFirstPlanButton() {
  addRegisterNthPlanButton(1);
}

function addRegisterSecondPlanButton() {
  addRegisterNthPlanButton(2);
}

function addRegisterThirdPlanButton() {
  addRegisterNthPlanButton(3);
}

function clickSubmitButton() {
  debugger;
  const saveButton = document.getElementById("saveButton");
  if (saveButton.classList.contains("disabled")) {
    waitForElementClass(saveButton, "disabled", () => {
      saveButton.click();
    });
  } else {
    saveButton.click();
  }
}

function clickAddAllButton(index) {
  function clickButton() {
    const addAllButtons = document.getElementsByClassName("add-all-button");
    const addAllButton = addAllButtons[index];
    addAllButton.click();
  }
  if (document.getElementsByClassName("add-all-button").length - 1 >= index) {
    debugger;
    clickButton();
    return;
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    if (document.getElementsByClassName("add-all-button").length - 1 >= index) {
      observer.disconnect();

      clickButton();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function clickPlansButton() {
  const plansButton = document.getElementById("loadPlans-tab");
  plansButton.click();
}

function addAutoClickButton() {
  let autoClickButton = document.createElement("button");
  autoClickButton.innerText = "Auto Click";
  autoClickButton.className = "form-button";
  autoClickButton.style = "margin-right: 3px;";

  document.getElementById("term-go").parentElement.append(autoClickButton);

  let isClicked = false;
  autoClickButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (isClicked) {
      return;
    }

    let time = document.getElementById("time").value;

    let regEx = /^(0?\d|1\d|2[0-3]):([0-5]\d)$/;

    if (!regEx.test(time)) {
      document.getElementById("errorMsg").innerText =
        "Invalid time format. Please enter in HH:MM (24h format)";
      return;
    } else {
      document.getElementById("errorMsg").innerText = "";
    }

    isClicked = true;

    let [timeRemaining, timeoutId] = scheduleAutoClick(time);
    notifyUserOfScheduledAutoClick(timeRemaining);

    let cancelButton = document.getElementById("cancel-autoclick");
    cancelButton.addEventListener("click", () => {
      isClicked = false;
      clearTimeout(timeoutId);
      clearNotificationText();
    });
  });
}

function clearNotificationText() {
  let autoclickDivs = document.getElementsByClassName("notify-autoclick");

  for (let autoClickDiv of autoclickDivs) {
    autoClickDiv.innerText = "";
  }
}

function addCancelButton() {
  let cancelButton = document.createElement("button");
  cancelButton.innerText = "Cancel";
  cancelButton.className = "form-button";
  cancelButton.id = "cancel-autoclick";

  document.getElementById("term-go").parentElement.append(cancelButton);
}

function notifyUserOfScheduledAutoClick(timeRemaining) {
  let notificationDiv = document.createElement("div");
  notificationDiv.innerHTML = `Scheduled to click 'Continue' button <span style="font-weight: bold;">${Math.ceil(
    timeRemaining / 1000 / 60
  )} minute(s)</span> from now.`;
  notificationDiv.className = "notify-autoclick";
  notificationDiv.style = "margin-top: 20px; font-size: 14px;";

  document
    .getElementById("term-go")
    .parentElement.parentElement.append(notificationDiv);
}

function scheduleAutoClick(time) {
  const continueButton = document.getElementById("term-go");

  let now = new Date();
  let desiredTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    time.split(":")[0],
    time.split(":")[1]
  );

  let delay = desiredTime - now;

  // If the desired time has already passed today, schedule for tomorrow
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000; // Add 24 hours
  }

  const id = setTimeout(() => {
    continueButton.click();
  }, delay);

  return [delay, id];
}

function addAutofillButton() {
  let autofillButton = document.createElement("button");
  autofillButton.innerText = "Autofill";

  document
    .querySelector(
      "body > div.pagebodydiv > form > table.plaintable > tbody > tr:nth-child(1) > td"
    )
    .appendChild(autofillButton);

  autofillButton.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Clicked!");
    fill_out_entire_timesheet();
  });
}

function fill_out_sunday_timesheet() {
  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "02:00";
  time_out.value = "06:00";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_monday_timesheet() {
  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "02:00";
  time_out.value = "06:00";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_tuesday_timesheet() {
  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "06:30";
  time_out.value = "08:30";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_wednesday_timesheet() {

  // first time

  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "03:00";
  time_out.value = "04:30";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  // second time

  const time_in_2 = document.getElementsByName("TimeIn")[1];
  const time_out_2 = document.getElementsByName("TS_TimeOut")[1];

  time_in_2.value = "06:00";
  time_out_2.value = "08:00";

  const time_in_ampm_2 = document.getElementsByName("TimeInAm")[1];
  const time_out_ampm_2 = document.getElementsByName("TimeOutAm")[1];

  time_in_ampm_2.value = "PM";
  time_out_ampm_2.value = "PM";

  // save

  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_thursday_timesheet() {

  // first time

  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "12:00";
  time_out.value = "01:30";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  // second time

  const time_in_2 = document.getElementsByName("TimeIn")[1];
  const time_out_2 = document.getElementsByName("TS_TimeOut")[1];

  time_in_2.value = "04:30";
  time_out_2.value = "06:00";

  const time_in_ampm_2 = document.getElementsByName("TimeInAm")[1];
  const time_out_ampm_2 = document.getElementsByName("TimeOutAm")[1];

  time_in_ampm_2.value = "PM";
  time_out_ampm_2.value = "PM";

  // save
  
  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_friday_timesheet() {
  const time_in = document.getElementsByName("TimeIn")[0];
  const time_out = document.getElementsByName("TS_TimeOut")[0];

  time_in.value = "2:00";
  time_out.value = "05:30";

  const time_in_ampm = document.getElementsByName("TimeInAm")[0];
  const time_out_ampm = document.getElementsByName("TimeOutAm")[0];

  time_in_ampm.value = "PM";
  time_out_ampm.value = "PM";

  const save_button = get_input("Save");
  if (save_button === null) {
    return;
  }

  save_button.click();
}

function fill_out_saturday_timesheet() {
  return;
}

function get_input(val) {
  const all_inputs = document.getElementsByTagName("input");
  let target_input;
  for (let input of all_inputs) {
    if (input.value === val) {
      target_input = input;
    }
  }

  if (target_input !== null) {
    return target_input;
  } else {
    console.log("Save button not found");
  }
}

function fill_out_entire_timesheet() {
  const current_date = document.querySelector(
    "body > div.pagebodydiv > form > table:nth-child(9) > tbody > tr:nth-child(1) > td.dedefault"
  ).textContent;
  const date = new Date(current_date);
  let utc_day = date.getUTCDay();

  if (utc_day === 0) {
    fill_out_sunday_timesheet();
  }
  
  if (utc_day === 1) {
    fill_out_monday_timesheet();
  }
  
  if (utc_day === 2) {
    fill_out_tuesday_timesheet();
  }
  
  if (utc_day === 3) {
    fill_out_wednesday_timesheet();
  }
  
  if (utc_day === 4) {
    fill_out_thursday_timesheet();
  }
  
  if (utc_day === 5) {
    fill_out_friday_timesheet();
  }
  
  if (utc_day === 6) {
    fill_out_saturday_timesheet();
  }

  const next_day_button = get_input("Next Day");

  if (next_day_button === undefined) {
    const time_sheet_button = get_input("Time Sheet");
    time_sheet_button.click();
    return;
  }

  next_day_button.click();
}

// Function to generate cron expression based on the input values
function generateCron() {
    const minute = document.getElementById("minute").value || "*";
    const hour = document.getElementById("hour").value || "*";
    const dayOfMonth = document.getElementById("dayOfMonth").value || "*";
    const month = document.getElementById("month").value || "*";
    const dayOfWeek = document.getElementById("dayOfWeek").value || "*";
    let command = document.getElementById("command").value.trim();

    if (!command) {
        document.getElementById("cronOutput").textContent = "Please enter a command.";
        return;
    }

    // Check for redirection options
    const redirectOutput = document.getElementById("redirectOutput").checked;
    const suppressErrors = document.getElementById("suppressErrors").checked;

    if (redirectOutput && suppressErrors) {
        command += " > /dev/null 2>&1";
    } else if (redirectOutput) {
        command += " > /dev/null";
    } else if (suppressErrors) {
        command += " 2>/dev/null";
    }

    const cronEntry = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${command}`;

    // Validate cron format and update output
    if (validateCron(minute, hour, dayOfMonth, month, dayOfWeek)) {
        document.getElementById("cronOutput").textContent = cronEntry;
    } else {
        document.getElementById("cronOutput").textContent = "One or more cron fields are invalid.";
    }
}

// Function to validate cron fields (optional, basic validation here)
function validateCron(minute, hour, dayOfMonth, month, dayOfWeek) {
    const cronRegex = /^(\*|[0-9]|[0-5][0-9])$/;
    return (
        cronRegex.test(minute) &&
        cronRegex.test(hour) &&
        cronRegex.test(dayOfMonth) &&
        cronRegex.test(month) &&
        cronRegex.test(dayOfWeek)
    );
}

// Event listeners for all inputs and checkboxes to generate cron on change
document.querySelectorAll("#cronForm input").forEach(input => {
    input.addEventListener("input", generateCron);
});

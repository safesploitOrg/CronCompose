# CronCompose

An intuitive web tool for crafting and validating cron job schedules. **CronCompose** allows you to easily build, preview, and troubleshoot crontab entries directly in your browser. Ideal for sysadmins, developers, and anyone needing a quick, reliable way to set up scheduled tasks.

## Features

- **Easy Cron Schedule Creation**: Use a simple form to create cron job schedules without needing to remember syntax.
- **Real-Time Validation**: Validate cron expressions as you type, ensuring accuracy.
- **Preview & Copy**: See the generated cron entry and copy it with one click.
- **Client-Side Only**: No data is saved or sent to a server; everything runs in your browser.
  
## Getting Started

### Prerequisites

To use CronCompose, you only need a web browser.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/CronCompose.git
    ```

2. Navigate to the project folder:

    ```bash
    cd CronCompose
    ```

3. Open index.html in your browser to start using CronCompose.

    ```bash
    chrome index.html
    ```

## Usage

1. Open the app in your browser.
2. Enter the values for each cron field (minute, hour, day of month, month, day of week).
3. Add the command you want to schedule.
4. Click **Generate Cron** to preview the cron job entry.
5. Copy the cron entry to your clipboard and add it to your crontab.

### Cron Field Guide

| Field         | Allowed Values         | Description                              |
|---------------|------------------------|------------------------------------------|
| **Minute**    | 0-59 or `*`            | Specifies the minute of the hour to run. |
| **Hour**      | 0-23 or `*`            | Specifies the hour of the day to run.    |
| **Day of Month** | 1-31 or `*`         | Specifies the day of the month to run.   |
| **Month**     | 1-12 or `*`            | Specifies the month of the year to run.  |
| **Day of Week**  | 0-7 (0 and 7 are Sun) | Specifies the day of the week to run. |

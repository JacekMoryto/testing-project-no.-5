# README

## Introduction

This is a test automation project using Playwright for a simple To-Do application built with Ruby on Rails and React. The project demonstrates how to automate end-to-end testing for a web app using Playwright.

## Setup

1. Clone the repository to your local machine.

2. If you don't have Ruby, Rails or NodeJS setup in your local machine, follow instructions on these links to install Ruby, Rails, Node and all the dependencies required for this project to work:
    - https://courses.bigbinaryacademy.com/learn-rubyonrails/setting-up-workspace
    - https://courses.bigbinaryacademy.com/learn-rubyonrails/installing-ruby-on-rails/

3. Run the command `./bin/setup` from the root of the directory. This will install all the ruby gems and npm packages required to run the project.
4. Open a new terminal on the root of the repository and execute the command `bundle exec rails server`. This starts the rails server on the local machine. Do not stop the execution or close this terminal while you are working on the automation project.
5. Open a new terminal on the root of the repository and execute the commanand `./bin/webpacker-dev-server`. This starts the webpack dev server and compiles all the frontend code. Do not stop the execution or close this terminal while you are working on the automation project.

## Testing Scope
This project focuses on testing the To-Do application from the following perspectives:
Task Management: Create, update, delete, and complete tasks.
UI Interactions: Automated UI testing for interactions with the task list, such as adding, removing, and editing tasks.
Cross-Browser Testing: Ensuring that the application works correctly on different browsers (using Playwright's built-in support for multiple browsers).

## Techniques and Tools Used:
Playwright Commands: Used for end-to-end testing, including DOM interactions, form filling, and navigation.

Assertions: Leveraged Playwright's built-in assertions and Chai for behavior-driven testing.

Cross-Browser Testing: Automated tests across Chromium, Firefox, and WebKit to ensure compatibility.

Page Object Model: Implemented to organize test code for better maintainability and reusability.

Global Setup/Teardown: Utilized Playwright's global setup to initialize test environments and share authentication states.

API Calls for Setup: used API requests to set up the test environment, ensuring consistency and reducing the need for manual setup.

Fixtures: Implemented fixtures to manage test data and dependencies efficiently.

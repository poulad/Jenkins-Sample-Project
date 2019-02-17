# Jenkins - Sample Project

## Getting Started

### Dependencies

- Node.JS

### Run

1. Restore dependency packages.

    ```sh
    npm install
    ```

1. Run the UAT tests on Jenkins

    ```sh
    npm test
    ```

1. Store the test execution logs as structured JSON data.

    ```sh
    npm test | grep --color=never --line-regexp --regexp='^\{\".*\}$' > /tmp/logs.json
    ```

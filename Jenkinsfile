pipeline {
    agent any
    stages {
        stage 'Checkout', {
            steps {
                checkout scm
            }
        }
        stage 'Greeting', {
            steps {
                echo 'Hello World'
            }
        }
    }
}
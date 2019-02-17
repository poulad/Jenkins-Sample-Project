pipeline {
    agent any
    stages {
        stage 'Checkout', {
            steps {
                checkout scm
            }
        }
        stage 'Saludo', {
            steps {
                echo 'Hola Mundo'
            }
        }
    }
}
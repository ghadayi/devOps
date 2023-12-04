pipeline {
    agent any

    tools {
        msbuild 'MSBuild' // The name of the MSBuild installation
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/ghadayi/devOps.git' // Your repository URL
            }
        }

        stage('Build') {
            steps {
                bat "msbuild SampleApp.sln /p:Configuration=Release" // Build command
            }
        }

        stage('Test') {
            steps {
                // Run tests here (e.g., using NUnit or MSTest)
            }
        }

        stage('Dockerize') {
            steps {
                script {
                    docker.build("Dockerfile")
                }
            }
        }

        // Additional stages like Docker Push, Deployment, etc. can be added here
    }
}

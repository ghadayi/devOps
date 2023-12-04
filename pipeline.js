pipeline {
    agent any

    tools {
        msbuild 'MSBuild' // The name of the MSBuild installation
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ghadayi/devOps.git'
            }
        }

        stage('Build') {
            steps {
               // bat "msbuild SampleApp.sln /p:Configuration=Release" // Build command
                bat "\"${tool 'MSBuild'}\" SampleApp.sln /p:Configuration=Release"

            }
        }

       // stage('Test') {
        //    steps {
                // Run tests here (e.g., using NUnit or MSTest)
        //    }
      //  }

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

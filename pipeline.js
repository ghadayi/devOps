pipeline {
    agent any

    tools {
        msbuild 'MSBuild' // The name of the MSBuild installation
    }

    environment {
        // Define necessary environment variables
        DOCKER_IMAGE = 'ghadayi/booktracker' // Replace with your Docker image name
        GKE_CREDENTIALS_ID = 'gcp-service-account' // Jenkins credentials ID for Google Cloud
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials' // Jenkins credentials ID for docker-hub
        DOCKER_TAG = "${env.BUILD_NUMBER}_${env.GIT_COMMIT}" // Combines build number and Git commit hash
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${env.BRANCH_NAME}", url: 'https://github.com/ghadayi/devOps.git'
            }
        }

        stage('Build') {
            steps {
                // Restore NuGet packages and build the solution
                bat 'dotnet restore SampleApp.sln'
                bat "\"C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe\" SampleApp.sln /p:Configuration=Release"
            }
        }

   // Stage for running unit tests
   stage('Unit Tests') {
    steps {
        // Run unit tests using the .NET Core CLI
        bat 'dotnet test SampleApp.UnitTests'
    }
}

// // Stage for running integration tests
// stage('Integration Tests') {
//     steps {
//         // Run integration tests using the .NET Core CLI
//         bat 'dotnet test SampleApp.IntegrationTests'
//     }
// }

// // Stage for running functional tests
// stage('Functional Tests') {
//     steps {
//         // Run functional tests using the .NET Core CLI
//         // The command might differ if you use a test runner like Selenium
//         bat 'dotnet test SampleApp.FunctionalTests'
//     }
// }


        stage('Dockerize') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'release/*'
                    branch 'main'
                    branch 'hotfix/*'
                }
            }
            steps {
                // Build Docker image with specific tag
                script {
                    docker.build("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}")
                }
            }
        }

        stage('Docker Security Scan') {
            steps {
                // Run security scan on the Docker image using Trivy
                script {
                    bat "docker run --rm -v //var/run/docker.sock://var/run/docker.sock -v %HOME%/.cache:/root/.cache/ aquasec/trivy image ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
                }
            }
        }

        stage('Push Docker Image') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'release/*'
                    branch 'main'
                    branch 'hotfix/*'
                }
            }
            steps {
                // Push the built Docker image to the Docker registry
                script {
                    docker.withRegistry('https://registry.hub.docker.com', env.DOCKER_CREDENTIALS_ID) {
                        docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push()
                    }
                }
            }
        }

        stage('Deploy to GKE') {
            when {
                anyOf {
                    branch 'main'
                    branch 'release/*'
                }
            }
            steps {
                // Deploy the application to Google Kubernetes Engine
                script {
                    // Load GCP service account key from Jenkins credentials
                    withCredentials([file(credentialsId: env.GKE_CREDENTIALS_ID, variable: 'GCP_KEY_FILE')]) {
                        // Activate the service account with Google Cloud SDK
                        bat 'gcloud auth activate-service-account --key-file %GCP_KEY_FILE%'
                        
                        // Get credentials for your GKE cluster
                        bat 'gcloud container clusters get-credentials autopilot-cluster-1 --region asia-southeast1 --project booming-splicer-406808'
                    }
        
                    // Apply the Kubernetes deployment
                    bat 'kubectl apply -f k8s-deployment.yml'
                }
            }
        }
        stage('Configure Monitoring and Logging') {
            steps {
                script {
                    // Verify if Cloud Logging is enabled
                    bat "gcloud container clusters describe autopilot-cluster-1 --region asia-southeast1 --format='value(loggingService)' --project booming-splicer-406808"

                    // Check if Cloud Monitoring is configured
                    bat "gcloud container clusters describe autopilot-cluster-1 --region asia-southeast1 --format='value(monitoringService)' --project booming-splicer-406808"
        
                    // Optionally, deploy or configure any additional monitoring/logging tools if needed
                    // For example, deploying a custom metrics exporter, configuring Fluentd, etc.
                    // bat "<your-deployment-command-here>"
        
                    // Confirm that the necessary monitoring and logging configurations are in place
                    echo "Monitoring and logging configuration verified."
                }
            }
        }
        stage('Validate Alerting Policies') {
            steps {
                script {
                    // List the current alerting policies in Cloud Monitoring
                    bat "gcloud alpha monitoring policies list"
        
                    // Optionally, add additional checks or scripts to validate specific aspects of the alerting policies
                    // For instance, checking for the existence of certain critical alerts or verifying configurations
        
                    // Confirm that the alerting policies validation is complete
                    echo "Alerting policies validation completed."
                }
            }
        }
        
        // ... other stages ...
    }
}

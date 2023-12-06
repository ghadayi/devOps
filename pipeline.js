pipeline {
    agent any

    // Define the tools used in the pipeline
    tools {
        msbuild 'MSBuild' // The name of the MSBuild installation
    }

    // Set environment variables
    environment {
        // Docker image name for the application
        DOCKER_IMAGE = 'ghadayi/booktracker'
        // Jenkins credentials ID for Google Cloud
        GKE_CREDENTIALS_ID = 'gcp-service-account'
        // Jenkins credentials ID for Docker Hub
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        // Tag for Docker image, combining build number and Git commit hash
        DOCKER_TAG = "${env.BUILD_NUMBER}_${env.GIT_COMMIT}"
    }

    stages {
        // Checkout code from the specified branch and repository
        stage('Checkout') {
            steps {
                git branch: "${env.BRANCH_NAME}", url: 'https://github.com/ghadayi/devOps.git'
            }
        }

        // Build the application using .NET Core
        stage('Build') {
            steps {
                bat 'dotnet restore SampleApp.sln'
                bat "\"C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe\" SampleApp.sln /p:Configuration=Release"
            }
        }

        // Upload build artifacts to Google Cloud Storage
        stage('Upload Build Artifacts to Cloud Storage') {
            steps {
                script {
                    withCredentials([file(credentialsId: env.GKE_CREDENTIALS_ID, variable: 'GCP_KEY_FILE')]) {
                        bat 'gcloud auth activate-service-account --key-file %GCP_KEY_FILE%'
                        def artifactPath = 'SampleApp/bin/Debug'
                        def destinationBucket = 'gs://book-tracker-storage'
                        bat "gsutil cp -r ${artifactPath}/* ${destinationBucket}"
                    }
                }
            }
        }

        // Run unit tests
        stage('Unit Tests') {
            steps {
                bat 'dotnet test SampleApp.UnitTests'
            }
        }

        // Uncomment and use these stages for integration and functional tests as needed
        // stage('Integration Tests') {
        //     steps {
        //         bat 'dotnet test SampleApp.IntegrationTests'
        //     }
        // }
        // stage('Functional Tests') {
        //     steps {
        //         bat 'dotnet test SampleApp.FunctionalTests'
        //     }
        // }

        // Build Docker image and tag it
        stage('Dockerize') {
            when {
                anyOf { branch 'develop'; branch 'release/*'; branch 'main'; branch 'hotfix/*' }
            }
            steps {
                script {
                    docker.build("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}")
                }
            }
        }

        // Run security scan on Docker image using Trivy
        stage('Docker Security Scan') {
            steps {
                script {
                    bat "docker run --rm -v //var/run/docker.sock://var/run/docker.sock -v %HOME%/.cache:/root/.cache/ aquasec/trivy image ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
                }
            }
        }

        // Push Docker image to Docker Hub
        stage('Push Docker Image') {
            when {
                anyOf { branch 'develop'; branch 'release/*'; branch 'main'; branch 'hotfix/*' }
            }
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', env.DOCKER_CREDENTIALS_ID) {
                        docker.image("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}").push()
                    }
                }
            }
        }

        // Deploy application to Google Kubernetes Engine
        stage('Deploy to GKE') {
            when {
                anyOf { branch 'main'; branch 'release/*' }
            }
            steps {
                script {
                    withCredentials([file(credentialsId: env.GKE_CREDENTIALS_ID, variable: 'GCP_KEY_FILE')]) {
                        bat 'gcloud auth activate-service-account --key-file %GCP_KEY_FILE%'
                        bat 'gcloud container clusters get-credentials autopilot-cluster-1 --region asia-southeast1 --project booming-splicer-406808'
                    }
                    bat 'kubectl apply -f k8s-deployment.yml'
                }
            }
        }

        // Configure and verify monitoring and logging
        stage('Configure Monitoring and Logging') {
            steps {
                script {
                    bat 'gcloud container clusters describe autopilot-cluster-1 --region asia-southeast1 --format="value(loggingService)" --project booming-splicer-406808'
                    bat 'gcloud container clusters describe autopilot-cluster-1 --region asia-southeast1 --format="value(monitoringService)" --project booming-splicer-406808'
                    echo "Monitoring and logging configuration verified."
                }
            }
        }
        stage('Check Application Performance') {
            steps {
                script {
                    // Define the URL of your web application
                    def appUrl = "http://34.124.220.35:80"
        
                    // Execute a curl command to measure response time
                    // Directly embedding the URL in the command
                    def responseTime = bat(script: "curl -o /dev/null -s -w '%{time_total}\\n' ${appUrl}", returnStdout: true).trim()
        
                    // Log the response time
                    echo "Response time for ${appUrl} is ${responseTime} seconds."
        
                    // Define a threshold for response time (in seconds)
                    def threshold = 3.0 // Threshold set to 3 seconds
        
                    // Check if the response time is within the acceptable range
                    if (Double.parseDouble(responseTime) > threshold) {
                        echo "Warning: High response time detected."
                        // Additional steps to handle high response time
                    } else {
                        echo "Response time is within acceptable limits."
                    }
                }
            }
        }
        
        // Validate alerting policies in Cloud Monitoring
        stage('Validate Alerting Policies') {
            steps {
                script {
                    bat "gcloud alpha monitoring policies list"
                    echo "Alerting policies validation completed."
                }
            }
        }
        
     }
}

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
                // Restore NuGet packages
                bat 'dotnet restore SampleApp.sln'
                bat "\"C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe\" SampleApp.sln /p:Configuration=Release"
            }
        }

        // ... other stages like 'Test' ...

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
                script {
                    // Build Docker image with specific tag
                    docker.build("${env.DOCKER_IMAGE}:${env.DOCKER_TAG}")
                }
            }
        }

        stage('Docker Security Scan') {
            steps {
                script {
                    // Run Trivy scan without the --no-progress flag
                    bat "docker run --rm -v //var/run/docker.sock://var/run/docker.sock -v %HOME%/.cache:/root/.cache/ aquasec/trivy ${env.DOCKER_IMAGE}:${env.DOCKER_TAG}"
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
                script {
                    // Log in to Docker registry
                    docker.withRegistry('https://registry.hub.docker.com', env.DOCKER_CREDENTIALS_ID) {
                        // Push the tagged image
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

        // ... other stages ...
    }
}

pipeline {
    agent any

    tools {
        msbuild 'MSBuild' // The name of the MSBuild installation
    }

    environment {
        // Define necessary environment variables
        DOCKER_IMAGE = 'your-docker-image-name' // Replace with your Docker image name
        GKE_CREDENTIALS_ID = 'your-gke-credentials-id' // Jenkins credentials ID for Google Cloud
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ghadayi/devOps.git'
            }
        }

        stage('Build') {
            steps {
                // Restore NuGet packages
                bat 'dotnet restore SampleApp.sln'

                bat "\"C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\MSBuild\\Current\\Bin\\MSBuild.exe\" SampleApp.sln /p:Configuration=Release"

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
                    // Build Docker image
                    docker.build(env.DOCKER_IMAGE)
                }
            }
        }
        // Additional stages like Docker Push, Deployment, etc. can be added here
        stage('Push Docker Image') {
            steps {
                script {
                    // Push to Docker registry
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-credentials-id') {
                        docker.image(env.DOCKER_IMAGE).push('latest')
                    }
                }
            }
        }
        stage('Deploy to GKE') {
            steps {
                script {
                    // Set up Google Cloud SDK
                    sh "gcloud auth activate-service-account --key-file=${env.GKE_CREDENTIALS_ID}"
                    sh "gcloud container clusters get-credentials your-cluster-name --zone your-cluster-zone --project your-gcp-project"

                    // Update Kubernetes deployment
                    // Assuming you have a deployment YAML file in your repository
                    sh "kubectl apply -f k8s-deployment.yml"

                    // Additional Kubernetes commands if necessary
                }
            }
        }

        // ... other stages ...
    }
}
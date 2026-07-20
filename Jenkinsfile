pipeline {
    agent any

    tools {
        nodejs 'node20'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Angular') {
            steps {
                dir('frontend') {
                    sh 'npx ng build --configuration production'
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Backend checkout') {
            steps {
                dir('backend') {
                    sh 'npm run start &'
                }
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }
        stage('Docker Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }
       stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=avocat-pro \
                    -Dsonar.sources=frontend/src,backend/src
                    '''
                }
            }
        }

    }
}
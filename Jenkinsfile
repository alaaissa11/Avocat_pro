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
                    sh 'npx ng build --configuration production --no-progress'
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


        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'sonar-scanner'
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=avocat-pro \
                        -Dsonar.sources=frontend/src,backend/src
                        """
                    }
                }
            }
        }


        stage('Docker Build') {
            steps {
                sh 'docker compose build'
            }
        }


        stage('Docker Login Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-credentials',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                    echo $NEXUS_PASS | docker login localhost:8083 \
                    -u $NEXUS_USER \
                    --password-stdin
                    '''
                }
            }
        }


        stage('Docker Push Nexus') {
            steps {
                sh '''
                docker push localhost:8083/avocat-backend:1.0
                docker push localhost:8083/avocat-frontend:1.0
                '''
            }
        }


        stage('Docker Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

    }
}
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
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npx ng build --configuration production --no-progress
                    '''
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


        stage('Docker Push to Nexus') {
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

                        docker push localhost:8083/avocat-backend:1.0
                        docker push localhost:8083/avocat-frontend:1.0
                    '''
                }
            }
        }
        stage('Docker Push Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                    echo $DOCKER_PASS | docker login \
                        -u $DOCKER_USER \
                        --password-stdin

                    docker tag avocat-backend:latest $DOCKER_USER/avocat-backend:latest
                    docker tag avocat-frontend:latest $DOCKER_USER/avocat-frontend:latest

                    docker push $DOCKER_USER/avocat-backend:latest
                    docker push $DOCKER_USER/avocat-frontend:latest

                    docker logout
                    '''
                }
            }
        }

        stage('Docker Deploy') {
            steps {
                sh 'docker compose up -d'
            }
        }

    }
}
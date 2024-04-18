pipeline {
    agent any
    environment {
        GIT_REPO = 'git@github.com:Telgou/Frontend--PI-Project-2024-Cipher.git'
        GIT_CREDENTIALS_ID = 'cipher-frontend'
    }
    stages {
        /*stage('Clone') {
            steps {
                git credentialsId: "${env.GIT_CREDENTIALS_ID}", url: "${env.GIT_REPO}", branch: "Ahmed"
            }
        }*/
        
        stage('Dependancies installation') {
            steps {
                script {
                        sh 'npm install'
                }
            }
        }
        /*
        stage('Build') {
            steps {
                script {
                        sh 'npm run build'
                }
            }
        }
        */
        
        stage('Build Image & push to DockerHub') {
            steps {
                    script {
                        
                        docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-telgoudelou') {
                        def customImage = docker.build("telgoudelou/frontunisocialize:latest")
                        customImage.push()
                        }
                        
                    }
            }
        }

        stage('Docker compose (BackEnd MySql FrontEnd)') {
            steps {
                script {
                  
                        sh 'docker-compose up -d'
                  
                }
            }
        }

    }
    
    post {
        success {
            echo 'All Pipeline steps were successful.'
            emailext (
                        body: 'Jenkins Pipeline has finished successfully',
                        recipientProviders: [
                            [$class: 'DevelopersRecipientProvider'], 
                            [$class: 'RequesterRecipientProvider'], 
                            [$class: 'CulpritsRecipientProvider']
                        ],
                        subject: 'Pipeline Status : Success'
                    )
        }
        failure {
            echo 'Pipelin FAILED.'
            emailext (
                        body: 'Jenkins Pipeline has finished with an error',
                        recipientProviders: [
                            [$class: 'DevelopersRecipientProvider'], 
                            [$class: 'RequesterRecipientProvider'], 
                            [$class: 'CulpritsRecipientProvider']
                        ],
                        subject: 'Pipeline Status : Failed'
                    )
        }
    }
}
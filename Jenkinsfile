pipeline {
    agent any 

    stages {
        stage('checkout from git repo') {
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/imostack/events-kona.git']])
            }
        }
    }
}
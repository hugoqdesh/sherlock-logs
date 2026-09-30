pipeline {
  agent any

  options {
    disableConcurrentBuilds()
  }

  stages {
    stage('Validate') {
      steps {
        sh 'vagrant validate'
        sh 'ansible-playbook -i ansible/inventory.yaml ansible/playbook.yaml --syntax-check'
      }
    }

    stage('Deploy') {
      steps {
        sh 'vagrant up --provision'
      }
    }
  }
}

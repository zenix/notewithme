#!/usr/bin/env bash
ansible-playbook -v deploy_and_restart.yml -i hosts --ask-sudo-pass

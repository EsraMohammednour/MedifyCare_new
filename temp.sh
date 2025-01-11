#!/bin/bash
echo "# MedifyCare_new" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin git@github.com:EsraMohammednour/MedifyCare_new.git
git push -u origin main

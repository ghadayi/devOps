const { execSync } = require('child_process');

function runCommand(command) {
    try {
        execSync(`${command}`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to execute ${command}:`, e);
        process.exit(1);
    }
}

console.log('Starting CI/CD Pipeline for ASP.NET Core Application...');

// Change to your repository URL
const REPO_URL = 'https://github.com/ghadayi/devOps.git';
// Change to your application's directory name if different
const APP_DIR = 'SampleApp';

// Step 1: Clone Repository
console.log('Cloning Repository...');
runCommand(`git clone ${REPO_URL}`);

// Step 2: Navigate to the Project Directory
console.log('Navigating to Project Directory...');
runCommand(`cd ${APP_DIR}`);

// Step 3: Build the .NET Core Application
console.log('Building .NET Core Application...');
runCommand('dotnet build');

// Step 4: Run Tests (if you have any test projects)
console.log('Running Tests...');
// runCommand('dotnet test Your.Test.Project.csproj');

// Step 5: Publish the .NET Core Application
console.log('Publishing .NET Core Application...');
runCommand('dotnet publish -c Release -o out');

// Step 6: Build the Docker Image
console.log('Building Docker Image...');
runCommand('docker build -t aspnetcoreapp:latest .');

// Optional Steps: Push to Docker Registry
// Make sure to log in to your Docker registry and handle credentials securely
// console.log('Pushing to Docker Registry...');
// runCommand('docker tag aspnetcoreapp:latest yourdockerhubusername/aspnetcoreapp:latest');
// runCommand('docker push yourdockerhubusername/aspnetcoreapp:latest');

console.log('CI/CD Pipeline execution completed successfully!');

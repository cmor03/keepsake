const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to find files with console statements
function findFilesWithConsole() {
  return new Promise((resolve, reject) => {
    exec("find app -type f \\( -name \"*.js\" -o -name \"*.jsx\" \\) | xargs grep -l \"console\\.\"", (error, stdout) => {
      if (error && error.code !== 1) {
        reject(error);
        return;
      }
      
      const files = stdout.trim().split('\n').filter(Boolean);
      resolve(files);
    });
  });
}

// Function to clean a file
function cleanFile(filePath) {
  console.log(`Cleaning ${filePath}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Remove console.log, console.error, etc. statements
  const cleanedContent = content.replace(/^\s*console\.(log|error|debug|info|warn).*?;\s*$/gm, '');
  
  fs.writeFileSync(filePath, cleanedContent, 'utf8');
}

// Main function
async function main() {
  try {
    const files = await findFilesWithConsole();
    console.log(`Found ${files.length} files with console statements`);
    
    files.forEach(file => {
      cleanFile(file);
    });
    
    console.log('Done cleaning console statements from files');
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 